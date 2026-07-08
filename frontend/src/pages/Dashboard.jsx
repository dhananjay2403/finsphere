import { useState, useEffect, useCallback } from 'react';
import { Box, Container, Typography, Grid, Paper, Chip, Button, Skeleton, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import FavoriteIcon from '@mui/icons-material/Favorite';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency, formatPercent } from '../utils/helpers';
import { ROUTES } from '../utils/constants';
import portfolioService from '../services/portfolioService';
import tradeService from '../services/tradeService';


// Constants
const BADGE_STYLES = {
  positive: { bgcolor: '#dcfce7', color: '#15803d' },
  negative: { bgcolor: '#fee2e2', color: '#dc2626' },
  neutral: { bgcolor: '#f1f5f9', color: '#64748b' },
};

// Segment palette — cycles for up to 6 allocation slices
const ALLOC_COLORS = ['#7A3E48', '#C88C96', '#B07A61', '#E8DED5', '#9D5F6B', '#D4A0A8'];

// Health score sub-metric labels (used for the loading placeholder).
const HEALTH_METRIC_LABELS = ['Diversification', 'Concentration', 'Deployment'];

// Challenge config
const CHALLENGE_TOTAL = 30;


// Pure helpers
function getHealthLabel(score) {
  if (score >= 80) return { text: 'Excellent', color: '#15803d' };
  if (score >= 60) return { text: 'Good', color: '#7A3E48' };
  if (score >= 40) return { text: 'Moderate', color: '#b45309' };
  return { text: 'Needs work', color: '#dc2626' };
}

const clampScore = (n) => Math.max(0, Math.min(100, n));

// Component weights — sum to 1. Kept as a named constant so the methodology is
// explicit and easy to tune.
const HEALTH_WEIGHTS = { diversification: 0.40, concentration: 0.30, deployment: 0.30 };

// Portfolio Health Score (0–100). Measures portfolio *construction and risk*,
// and is deliberately independent of investment performance — returns are
// market outcomes (luck/skill), not structural health, so a sound portfolio
// can be temporarily down and still score well. Three deterministic axes:
//
//   Diversification (40%) — how evenly spread across positions, via the
//     Herfindahl-Hirschman Index. wᵢ = position market value / total holdings
//     value; HHI = Σwᵢ²; effective number of holdings N_eff = 1/HHI. Scored
//     against a target of 5 effective positions (realistic on the free-tier
//     tradable universe): (N_eff − 1)/(5 − 1) × 100.
//
//   Concentration risk (30%) — a hard cap on single-name exposure. With the
//     largest position weight maxW: (1 − maxW)/(1 − 0.30) × 100, so a position
//     over 30% of holdings starts losing points and ~100% weight scores 0.
//
//   Capital deployment (30%) — rewards putting cash to work while keeping a
//     liquidity buffer. r = holdings value / portfolio value. Ideal band
//     50–90% → 100; below 50% scales linearly (r / 0.50); above 90% a mild
//     penalty down to 70 at fully invested (no cash cushion).
//
// Weights use market value (currentValue), falling back to cost basis when a
// live quote is missing. An empty portfolio is "Not rated" rather than 0.
function computeHealthScore({ holdings, summary }) {
  const list = holdings ?? [];

  if (list.length === 0) {
    return {
      rated: false,
      total: 0,
      metrics: HEALTH_METRIC_LABELS.map((label) => ({ label, score: 0 })),
    };
  }

  // Market-value weight per position (cost-basis fallback when no live quote).
  const values = list.map((h) => (h.currentValue != null ? h.currentValue : h.totalInvested) || 0);
  const holdingsValue = values.reduce((s, v) => s + v, 0);
  const weights = holdingsValue > 0 ? values.map((v) => v / holdingsValue) : values.map(() => 0);

  // Diversification — effective number of holdings (1 / HHI) vs a target of 5.
  const hhi = weights.reduce((s, w) => s + w * w, 0);
  const nEff = hhi > 0 ? 1 / hhi : 0;
  const TARGET_HOLDINGS = 5;
  const diversification = clampScore(((nEff - 1) / (TARGET_HOLDINGS - 1)) * 100);

  // Concentration risk — largest single-position weight, capped at 30% ideal.
  const maxWeight = weights.length ? Math.max(...weights) : 1;
  const MAX_IDEAL_WEIGHT = 0.30;
  const concentration = clampScore(((1 - maxWeight) / (1 - MAX_IDEAL_WEIGHT)) * 100);

  // Capital deployment — reward being invested while keeping a cash buffer.
  const portfolioValue = summary?.portfolioValue ?? (summary?.cashBalance ?? 0) + holdingsValue;
  const investedRatio = portfolioValue > 0 ? holdingsValue / portfolioValue : 0;
  let deployment;
  if (investedRatio < 0.50) {
    deployment = clampScore((investedRatio / 0.50) * 100);
  } else if (investedRatio <= 0.90) {
    deployment = 100;
  } else {
    deployment = clampScore(100 - ((investedRatio - 0.90) / 0.10) * 30); // 90%→100, 100%→70
  }

  const total = Math.round(
    diversification * HEALTH_WEIGHTS.diversification +
    concentration  * HEALTH_WEIGHTS.concentration +
    deployment     * HEALTH_WEIGHTS.deployment
  );

  return {
    rated: true,
    total,
    metrics: [
      { label: 'Diversification', score: Math.round(diversification) },
      { label: 'Concentration',   score: Math.round(concentration) },
      { label: 'Deployment',      score: Math.round(deployment) },
    ],
  };
}

// Top 3 holdings by amount invested, for the dashboard allocation panel.
function buildDashboardAllocations(holdings) {
  if (!holdings || holdings.length === 0) return [];
  const total = holdings.reduce((s, h) => s + h.totalInvested, 0);
  if (total === 0) return [];

  return [...holdings]
    .sort((a, b) => b.totalInvested - a.totalInvested)
    .slice(0, 3)
    .map((h, i) => ({
      label: h.symbol,
      pct: parseFloat(((h.totalInvested / total) * 100).toFixed(1)),
      color: ALLOC_COLORS[i],
    }));
}

// Prefers real snapshots (actual portfolio value at the time they were
// written) for the chart. If none exist yet, approximates from trade
// history instead — walking trades chronologically and using cash +
// cumulative cost-at-purchase, which ignores unrealised P&L but beats a
// flat line. Returns [{ day: 'Jun 12', value: 98400 }, ...].
function buildPerformanceChart(trades, cashBalance, snapshots) {
  if (snapshots && snapshots.length > 0) {
    return snapshots.map((s) => ({
      day: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: s.totalValue,
    }));
  }

  if (!trades || trades.length === 0) return [];

  const sorted = [...trades].sort(
    (a, b) => new Date(a.executedAt) - new Date(b.executedAt)
  );

  let cumInvested = 0;
  return sorted.map((trade) => {
    if (trade.type === 'buy') {
      cumInvested += trade.totalAmount;
    } else {
      cumInvested = Math.max(0, cumInvested - trade.totalAmount);
    }
    // Approximate total value = current cash + what was invested up to this point
    return {
      day: new Date(trade.executedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: parseFloat((cashBalance + cumInvested).toFixed(2)),
    };
  });
}

// Number of distinct days with at least one trade, capped at CHALLENGE_TOTAL.
function computeChallengeDays(trades) {
  if (!trades || trades.length === 0) return 0;
  const days = new Set(
    trades.map((t) => new Date(t.executedAt).toDateString())
  );
  return Math.min(CHALLENGE_TOTAL, days.size);
}


// Sub-components
function KpiCard({ label, value, badge, badgeText, icon, accentIcon, loading }) {
  const valueColor = badge === 'positive' ? '#15803d' : badge === 'negative' ? '#dc2626' : 'text.primary';

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'white',
        height: '100%',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          {label}
        </Typography>
        <Box sx={{ color: accentIcon ? 'primary.main' : 'text.secondary', opacity: accentIcon ? 0.7 : 0.4 }}>
          {icon}
        </Box>
      </Box>

      {loading ? (
        <Skeleton width={100} height={28} animation="wave" sx={{ mb: 1 }} />
      ) : (
        <Typography
          variant="h5"
          fontWeight={700}
          letterSpacing="-0.025em"
          mb={1}
          sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' }, color: valueColor }}
        >
          {value}
        </Typography>
      )}

      {badge ? (
        loading ? (
          <Skeleton width={55} height={20} animation="wave" sx={{ borderRadius: 3 }} />
        ) : (
          <Chip
            label={badgeText}
            size="small"
            sx={{
              ...(BADGE_STYLES[badge] || BADGE_STYLES.neutral),
              fontWeight: 600,
              height: 20,
              fontSize: '0.7rem',
            }}
          />
        )
      ) : (
        badgeText && (
          <Typography variant="caption" color="text.secondary">
            {badgeText}
          </Typography>
        )
      )}
    </Paper>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: '#FFFDFB',
        border: '1px solid #E8DED5',
        borderRadius: 1.5,
        px: 1.5,
        py: 1,
        boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)',
      }}
    >
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={700} color="primary.main">
        {formatCurrency(payload[0].value)}
      </Typography>
    </Box>
  );
}

function RecentTxRow({ trade }) {
  const isBuy = trade.type === 'buy';
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.25,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: isBuy ? 'rgba(21, 128, 61, 0.1)' : 'rgba(220, 38, 38, 0.1)',
          }}
        >
          {isBuy
            ? <TrendingUpIcon sx={{ fontSize: 14, color: '#15803d' }} />
            : <TrendingDownIcon sx={{ fontSize: 14, color: '#dc2626' }} />}
        </Box>
        <Box>
          <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
            {trade.symbol}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isBuy ? 'Buy' : 'Sell'} · {trade.quantity} sh @ ${trade.pricePerShare?.toFixed(2)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        <Typography variant="body2" fontWeight={600} color={isBuy ? '#15803d' : '#dc2626'}>
          {isBuy ? '-' : '+'}{formatCurrency(trade.totalAmount)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(trade.executedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Typography>
      </Box>
    </Box>
  );
}


// Main component
function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] ?? 'Investor';

  // Data state 
  const [summary, setSummary] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [allTrades, setAllTrades] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [snapshots, setSnapshots] = useState([]);

  const [summaryLoading, setSummaryLoading] = useState(true);
  const [holdingsLoading, setHoldingsLoading] = useState(true);
  const [tradesLoading, setTradesLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);


  // Fetch on mount
  const fetchAll = useCallback(async () => {
    // Fire all requests in parallel — independent of each other. Trade history
    // is fetched once (limit 100); the recent-5 panel is sliced from it rather
    // than making a second, redundant request.
    const [summaryResult, holdingsResult, allTradesResult, snapshotsResult] =
      await Promise.allSettled([
        portfolioService.getSummary(),
        portfolioService.getHoldings(),
        tradeService.getHistory({ limit: 100, page: 1 }),      // all → chart, health, recent-5
        portfolioService.getSnapshots(),                        // performance chart history
      ]);

    if (summaryResult.status === 'fulfilled') setSummary(summaryResult.value);
    setSummaryLoading(false);

    if (holdingsResult.status === 'fulfilled') setHoldings(holdingsResult.value);
    setHoldingsLoading(false);

    if (allTradesResult.status === 'fulfilled') {
      const all = allTradesResult.value.data;
      setAllTrades(all);
      setRecentTrades(all.slice(0, 5));
    }
    setTradesLoading(false);

    if (snapshotsResult.status === 'fulfilled') setSnapshots(snapshotsResult.value);

    // Surface a failure of any primary panel (snapshots are non-critical, so a
    // snapshot-only failure doesn't trigger the banner). Without this, a failed
    // load renders identically to a brand-new empty account.
    setLoadError(
      [summaryResult, holdingsResult, allTradesResult].some((r) => r.status === 'rejected')
    );
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);


  // Derived values 
  const isLoading = summaryLoading || holdingsLoading || tradesLoading;

  // KPI badges — account-level return since inception (realised + unrealised),
  // consistent with Portfolio Value = cash + market value. (Per-position
  // unrealised P/L is shown on the Portfolio page.)
  const gainLoss = summary?.totalPnL ?? 0;
  const gainLossPct = summary?.totalPnLPct ?? 0;
  const gainBadge = gainLoss > 0 ? 'positive' : gainLoss < 0 ? 'negative' : 'neutral';

  // Allocations (top 3 for dashboard panel)
  const allocations = buildDashboardAllocations(holdings);

  // Health score — only compute when data is ready
  const healthData = isLoading
    ? { rated: false, total: 0, metrics: HEALTH_METRIC_LABELS.map((l) => ({ label: l, score: 0 })) }
    : computeHealthScore({ holdings, summary });
  const health = getHealthLabel(healthData.total);

  // Performance chart — real snapshot data first, trade-math fallback
  const chartData = buildPerformanceChart(allTrades, summary?.cashBalance ?? 0, snapshots);

  // Challenge
  const challengeDays = computeChallengeDays(allTrades);
  const challengePercent = Math.round((challengeDays / CHALLENGE_TOTAL) * 100);
  const challengeDetails = [
    { label: 'Active trading days', value: `${challengeDays} days` },
    { label: 'Total trades', value: `${allTrades.length}` },
    { label: 'Completion', value: `${challengePercent}%` },
  ];


  // Render 
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {/* Header */}
      <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.025em">
          Welcome back, {firstName}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Here&apos;s your portfolio overview
        </Typography>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }} onClose={() => setLoadError(false)}>
          Some dashboard data couldn&apos;t be loaded. Figures may be incomplete — please refresh.
        </Alert>
      )}

      {/* KPI cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>

        {/* Portfolio Value */}
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard
            label="Portfolio Value"
            value={formatCurrency(summary?.portfolioValue ?? 0)}
            badge={null}
            badgeText={null}
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 18 }} />}
            accentIcon
            loading={summaryLoading}
          />
        </Grid>

        {/* Total Gain / Loss */}
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard
            label="Total Gain / Loss"
            value={formatCurrency(gainLoss)}
            badge={gainBadge}
            badgeText={formatPercent(gainLossPct)}
            icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
            loading={summaryLoading}
          />
        </Grid>

        {/* Total Invested */}
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard
            label="Total Invested"
            value={formatCurrency(summary?.totalInvested ?? 0)}
            badge={null}
            badgeText={holdings.length > 0 ? `${holdings.length} positions` : 'No holdings'}
            icon={<ShowChartIcon sx={{ fontSize: 18 }} />}
            loading={summaryLoading || holdingsLoading}
          />
        </Grid>

        {/* Total Transactions */}
        <Grid item xs={6} sm={6} md={3}>
          <KpiCard
            label="Total Transactions"
            value={tradesLoading ? '—' : String(allTrades.length)}
            badge={null}
            badgeText="All time"
            icon={<SwapHorizIcon sx={{ fontSize: 18 }} />}
            loading={tradesLoading}
          />
        </Grid>

      </Grid>

      {/* Chart row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>

        {/* Portfolio Performance chart */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'white',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="body1" fontWeight={600}>
                Portfolio Performance
              </Typography>
              <Chip
                label={
                  snapshots.length > 0
                    ? `${chartData.length} day${chartData.length !== 1 ? 's' : ''}`
                    : chartData.length > 0
                      ? `${chartData.length} trades`
                      : 'No data yet'
                }
                size="small"
                sx={{
                  bgcolor: 'rgba(122, 62, 72, 0.08)',
                  color: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  height: 22,
                }}
              />
            </Box>

            {tradesLoading ? (
              <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 1 }} animation="wave" />
            ) : chartData.length === 0 ? (
              <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <ShowChartIcon sx={{ fontSize: 40, color: '#e2e8f0', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    No trade data yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Your portfolio performance will appear here after your first trade.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DED5" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: '#6B6B6B' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E8DED5' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6B6B6B' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    domain={['dataMin - 500', 'dataMax + 500']}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#7A3E48"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#7A3E48', stroke: '#FFFDFB', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Allocation panel */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'white',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Typography variant="body1" fontWeight={600}>
                Allocation
              </Typography>
              <Chip
                label={
                  holdingsLoading ? '…'
                    : allocations.length > 0 ? `${allocations.length} positions`
                      : 'Empty'
                }
                size="small"
                sx={{ bgcolor: 'rgba(122, 62, 72, 0.08)', color: 'primary.main', fontWeight: 500, fontSize: '0.7rem', height: 20 }}
              />
            </Box>

            {holdingsLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                {[1, 2, 3].map((i) => (
                  <Box key={i}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Skeleton width={70} height={14} animation="wave" />
                      <Skeleton width={30} height={14} animation="wave" />
                    </Box>
                    <Skeleton variant="rectangular" height={6} sx={{ borderRadius: 3 }} animation="wave" />
                  </Box>
                ))}
              </Box>
            ) : allocations.length === 0 ? (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Buy stocks to see your allocation breakdown.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                {allocations.map(({ label, pct, color }) => (
                  <Box key={label}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>{label}</Typography>
                      <Typography variant="body2" fontWeight={600}>{pct}%</Typography>
                    </Box>
                    <Box sx={{ height: 6, bgcolor: '#F0E9E2', borderRadius: 3, overflow: 'hidden' }}>
                      <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            <Button
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              onClick={() => navigate(ROUTES.PORTFOLIO)}
              sx={{
                mt: 2,
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '0.82rem',
                alignSelf: 'flex-start',
                '&:hover': { bgcolor: 'rgba(122, 62, 72, 0.04)' },
              }}
            >
              View All
            </Button>
          </Paper>
        </Grid>

      </Grid>

      {/* Health Score + Challenge row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>

        {/* Portfolio Health Score */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'white',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Portfolio Health Score
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Based on diversification, concentration risk, and capital deployment
                </Typography>
              </Box>
              <FavoriteIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.6 }} />
            </Box>

            {isLoading ? (
              <Box>
                <Skeleton width={80} height={40} animation="wave" sx={{ mb: 1.5 }} />
                <Skeleton variant="rectangular" height={6} sx={{ borderRadius: 3, mb: 2.5 }} animation="wave" />
                <Grid container spacing={1}>
                  {[1, 2, 3].map((i) => (
                    <Grid item xs={4} key={i}>
                      <Skeleton variant="rectangular" height={52} sx={{ borderRadius: 1.5 }} animation="wave" />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : !healthData.rated ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                  <Typography variant="h4" fontWeight={700} color="text.secondary">—</Typography>
                  <Typography variant="body2" color="text.secondary">/ 100</Typography>
                  <Chip
                    label="Not rated"
                    size="small"
                    sx={{ ml: 'auto', bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '0.72rem', height: 22 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Buy your first stock to generate a health score based on diversification,
                  concentration risk, and capital deployment.
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {healthData.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">/ 100</Typography>
                  <Chip
                    label={health.text}
                    size="small"
                    sx={{
                      ml: 'auto',
                      bgcolor: 'rgba(122, 62, 72, 0.08)',
                      color: health.color,
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      height: 22,
                    }}
                  />
                </Box>

                <Box sx={{ height: 6, bgcolor: '#E8DED5', borderRadius: 3, overflow: 'hidden', mb: 2 }}>
                  <Box sx={{ height: '100%', width: `${healthData.total}%`, bgcolor: 'primary.main', borderRadius: 3 }} />
                </Box>

                {/* Sub-metrics */}
                <Grid container spacing={1.5}>
                  {healthData.metrics.map(({ label, score }) => (
                    <Grid item xs={4} key={label}>
                      <Box sx={{ p: 2, bgcolor: '#F8F4EF', borderRadius: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.7rem' }}>
                            {label}
                          </Typography>
                          <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ fontSize: '0.7rem' }}>
                            {score}
                          </Typography>
                        </Box>
                        <Box sx={{ height: 3, bgcolor: '#E8DED5', borderRadius: 2, overflow: 'hidden' }}>
                          <Box sx={{ height: '100%', width: `${score}%`, bgcolor: '#C88C96', borderRadius: 2 }} />
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </Paper>
        </Grid>

        {/* Investment Challenge */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'white',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Investment Challenge
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  30-day consistency challenge
                </Typography>
              </Box>
              <EmojiEventsIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.6 }} />
            </Box>

            {tradesLoading ? (
              <Box>
                <Skeleton width={80} height={40} animation="wave" sx={{ mb: 1.5 }} />
                <Skeleton variant="rectangular" height={6} sx={{ borderRadius: 3, mb: 2.5 }} animation="wave" />
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rectangular" height={36} sx={{ borderRadius: 1.5, mb: 1 }} animation="wave" />
                ))}
              </Box>
            ) : (
              <>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {challengeDays}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">/ {CHALLENGE_TOTAL} days</Typography>
                  <Chip
                    label={`${challengePercent}%`}
                    size="small"
                    sx={{
                      ml: 'auto',
                      bgcolor: 'rgba(122, 62, 72, 0.08)',
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: '0.72rem',
                      height: 22,
                    }}
                  />
                </Box>

                <Box sx={{ height: 6, bgcolor: '#E8DED5', borderRadius: 3, overflow: 'hidden', mb: 2.5 }}>
                  <Box sx={{ height: '100%', width: `${challengePercent}%`, bgcolor: 'primary.main', borderRadius: 3 }} />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {challengeDetails.map(({ label, value }) => (
                    <Box
                      key={label}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.5,
                        bgcolor: '#F8F4EF',
                        borderRadius: 1.5,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: '0.78rem' }}>
                        {label}
                      </Typography>
                      <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ fontSize: '0.78rem' }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Paper>
        </Grid>

      </Grid>

      {/* Recent Transactions */}
      <Paper
        elevation={0}
        sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'white' }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" fontWeight={600}>
            Recent Transactions
          </Typography>
          {!tradesLoading && recentTrades.length > 0 && (
            <Button
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
              onClick={() => navigate(ROUTES.TRANSACTIONS)}
              sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.8rem', '&:hover': { bgcolor: 'rgba(122, 62, 72, 0.04)' } }}
            >
              View All
            </Button>
          )}
        </Box>

        {tradesLoading ? (
          <Box>
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Skeleton variant="circular" width={28} height={28} animation="wave" />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="25%" height={14} animation="wave" />
                  <Skeleton width="45%" height={12} animation="wave" sx={{ mt: 0.25 }} />
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Skeleton width={70} height={14} animation="wave" />
                  <Skeleton width={50} height={12} animation="wave" sx={{ mt: 0.25 }} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : recentTrades.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <SwapHorizIcon sx={{ fontSize: 28, color: '#e2e8f0', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              No transactions yet
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Your trade history will appear here once you start trading.
            </Typography>
          </Box>
        ) : (
          recentTrades.map((trade) => (
            <RecentTxRow key={trade._id} trade={trade} />
          ))
        )}
      </Paper>

    </Container>
  );
}


export default Dashboard;
