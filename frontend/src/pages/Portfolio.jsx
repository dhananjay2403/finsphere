import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Skeleton,
  Chip,
  Alert,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { formatCurrency, formatPercent } from '../utils/helpers';
import portfolioService from '../services/portfolioService';


// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// A fixed palette — cycles through for as many holdings as exist
const SEGMENT_COLORS = [
  '#7A3E48',
  '#C88C96',
  '#B07A61',
  '#E8DED5',
  '#9D5F6B',
  '#D4A0A8',
  '#C49A7A',
];


// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build allocation segments from holdings array.
 * Groups each holding by symbol, computes its share of total invested.
 * Returns up to 6 named segments + an "Other" catch-all if needed.
 */
function buildAllocationSegments(holdings) {
  if (!holdings || holdings.length === 0) return [];

  const total = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
  if (total === 0) return [];

  // Sort by totalInvested desc
  const sorted = [...holdings].sort((a, b) => b.totalInvested - a.totalInvested);

  const TOP_N = 6;
  const top = sorted.slice(0, TOP_N);
  const rest = sorted.slice(TOP_N);

  const segments = top.map((h, i) => ({
    label: h.symbol,
    fullName: h.name,
    pct: parseFloat(((h.totalInvested / total) * 100).toFixed(1)),
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
  }));

  if (rest.length > 0) {
    const otherTotal = rest.reduce((sum, h) => sum + h.totalInvested, 0);
    segments.push({
      label: 'Other',
      fullName: 'Other holdings',
      pct: parseFloat(((otherTotal / total) * 100).toFixed(1)),
      color: SEGMENT_COLORS[SEGMENT_COLORS.length - 1],
    });
  }

  return segments;
}

/**
 * Find the top performer — holding with the highest totalInvested.
 * (Full P&L comparison requires live prices which are null in the backend
 *  until the stock-price feed is wired in. We display the largest position.)
 */
function findTopHolder(holdings) {
  if (!holdings || holdings.length === 0) return null;
  return [...holdings].sort((a, b) => b.totalInvested - a.totalInvested)[0];
}


// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AllocationTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { label, fullName, pct } = payload[0].payload;
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
      {fullName && fullName !== label && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
          {fullName}
        </Typography>
      )}
      <Typography variant="body2" fontWeight={700} color="primary.main">{pct}%</Typography>
    </Box>
  );
}

/** Row used for each holding in the holdings table */
function HoldingRow({ holding, isLast }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: 1,
        alignItems: 'center',
        py: 1.5,
        borderBottom: isLast ? 'none' : '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Symbol + name */}
      <Box>
        <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
          {holding.symbol}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 160, display: 'block' }}>
          {holding.name}
        </Typography>
      </Box>

      {/* Quantity */}
      <Box sx={{ textAlign: 'right', minWidth: 50 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mb: 0.25 }}>
          Qty
        </Typography>
        <Typography variant="body2" fontWeight={600}>{holding.quantity}</Typography>
      </Box>

      {/* Avg cost */}
      <Box sx={{ textAlign: 'right', minWidth: 70 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mb: 0.25 }}>
          Avg Cost
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          ${holding.avgCostPrice?.toFixed(2)}
        </Typography>
      </Box>

      {/* Total invested */}
      <Box sx={{ textAlign: 'right', minWidth: 80 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem', mb: 0.25 }}>
          Invested
        </Typography>
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {formatCurrency(holding.totalInvested)}
        </Typography>
      </Box>
    </Box>
  );
}

/** Skeleton row for loading state */
function HoldingRowSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto',
        gap: 1,
        alignItems: 'center',
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box>
        <Skeleton width={50} height={16} animation="wave" />
        <Skeleton width={100} height={12} animation="wave" sx={{ mt: 0.25 }} />
      </Box>
      <Skeleton width={30} height={16} animation="wave" />
      <Skeleton width={55} height={16} animation="wave" />
      <Skeleton width={70} height={16} animation="wave" />
    </Box>
  );
}


// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function Portfolio() {

  // Data state 
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [holdingsLoading, setHoldingsLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [holdingsError, setHoldingsError] = useState('');
  const [summaryError, setSummaryError] = useState('');


  // Fetch on mount 
  const fetchData = useCallback(async () => {
    // Fetch holdings and summary in parallel
    const [holdingsResult, summaryResult] = await Promise.allSettled([
      portfolioService.getHoldings(),
      portfolioService.getSummary(),
    ]);

    // Holdings
    if (holdingsResult.status === 'fulfilled') {
      setHoldings(holdingsResult.value);
    } else {
      setHoldingsError('Could not load holdings. Please refresh.');
    }
    setHoldingsLoading(false);

    // Summary
    if (summaryResult.status === 'fulfilled') {
      setSummary(summaryResult.value);
    } else {
      setSummaryError('Could not load portfolio summary.');
    }
    setSummaryLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);


  // Derived data 
  const allocationSegments = buildAllocationSegments(holdings);
  const topHolder = findTopHolder(holdings);
  const hasHoldings = holdings.length > 0;


  // Render 
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.025em">
          Portfolio
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Your holdings and allocation breakdown
        </Typography>
      </Box>

      <Grid container spacing={3}>

        {/* Holdings table */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              bgcolor: 'white',
              maxHeight: 480,
              overflowY: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="body1" fontWeight={600}>Holdings</Typography>
              {hasHoldings && !holdingsLoading && (
                <Chip
                  label={`${holdings.length} position${holdings.length !== 1 ? 's' : ''}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(122, 62, 72, 0.08)', color: 'primary.main', fontWeight: 500, fontSize: '0.72rem' }}
                />
              )}
            </Box>

            {/* Error */}
            {holdingsError && (
              <Alert severity="error" sx={{ borderRadius: 1.5 }}>{holdingsError}</Alert>
            )}

            {/* Loading skeletons */}
            {holdingsLoading && !holdingsError && (
              <Box>
                {/* Table header */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto auto',
                    gap: 1,
                    pb: 1,
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    mb: 0.5,
                  }}
                >
                  {['Stock', 'Qty', 'Avg Cost', 'Invested'].map((h) => (
                    <Typography key={h} variant="caption" color="text.secondary" fontWeight={600}
                      sx={{ textAlign: h === 'Stock' ? 'left' : 'right', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {h}
                    </Typography>
                  ))}
                </Box>
                {[1, 2, 3].map((i) => <HoldingRowSkeleton key={i} />)}
              </Box>
            )}

            {/* Empty state */}
            {!holdingsLoading && !holdingsError && !hasHoldings && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <PieChartIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 1.5 }} />
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  No holdings yet
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Stocks you buy will appear here with cost basis tracking.
                </Typography>
              </Box>
            )}

            {/* Live holdings table */}
            {!holdingsLoading && !holdingsError && hasHoldings && (
              <Box>
                {/* Table header */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto auto auto',
                    gap: 1,
                    pb: 1,
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                    mb: 0.5,
                  }}
                >
                  {['Stock', 'Qty', 'Avg Cost', 'Invested'].map((h) => (
                    <Typography key={h} variant="caption" color="text.secondary" fontWeight={600}
                      sx={{ textAlign: h === 'Stock' ? 'left' : 'right', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {h}
                    </Typography>
                  ))}
                </Box>
                {holdings.map((holding, idx) => (
                  <HoldingRow
                    key={holding._id}
                    holding={holding}
                    isLast={idx === holdings.length - 1}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Cash available */}
            <Paper
              elevation={0}
              sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'white' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  Cash Available
                </Typography>
                <AccountBalanceWalletIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.6 }} />
              </Box>
              {summaryLoading ? (
                <Skeleton width={120} height={32} animation="wave" />
              ) : summaryError ? (
                <Typography variant="body2" color="error">—</Typography>
              ) : (
                <Typography variant="h5" fontWeight={700} letterSpacing="-0.025em">
                  {formatCurrency(summary?.cashBalance ?? 0)}
                </Typography>
              )}
            </Paper>

            {/* P&L Summary */}
            <Paper
              elevation={0}
              sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'white' }}
            >
              <Typography variant="body1" fontWeight={600} mb={2.5}>
                P&amp;L Summary
              </Typography>

              {summaryError && (
                <Alert severity="error" sx={{ borderRadius: 1.5, mb: 1 }}>{summaryError}</Alert>
              )}

              {[
                {
                  label: 'Total invested',
                  value: summaryLoading ? null : formatCurrency(summary?.totalInvested ?? 0),
                },
                {
                  label: 'Portfolio value',
                  value: summaryLoading ? null : formatCurrency(summary?.portfolioValue ?? 0),
                },
                {
                  label: 'Total return',
                  value: summaryLoading ? null : formatCurrency(summary?.totalReturn ?? 0),
                  sub: summaryLoading ? null : formatPercent(summary?.totalReturnPct ?? 0),
                  color: !summaryLoading && summary
                    ? summary.totalReturn > 0 ? '#15803d' : summary.totalReturn < 0 ? '#dc2626' : 'text.primary'
                    : 'text.primary',
                },
              ].map(({ label, value, sub, color }) => (
                <Box
                  key={label}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f1f5f9' }}
                >
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  {summaryLoading ? (
                    <Skeleton width={80} height={16} animation="wave" />
                  ) : (
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={600} color={color || 'text.primary'}>
                        {value}
                      </Typography>
                      {sub && (
                        <Typography variant="caption" color={color || 'text.secondary'} sx={{ fontSize: '0.68rem' }}>
                          {sub}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
            </Paper>

            {/* Portfolio Breakdown — stacked bar + legend */}
            <Paper
              elevation={0}
              sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'white' }}
            >
              <Typography variant="body1" fontWeight={600} mb={2}>
                Portfolio Breakdown
              </Typography>

              {holdingsLoading ? (
                <Box>
                  <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4, mb: 2 }} animation="wave" />
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Skeleton variant="circular" width={8} height={8} />
                        <Skeleton width={70} height={14} />
                      </Box>
                      <Skeleton width={30} height={14} />
                    </Box>
                  ))}
                </Box>
              ) : allocationSegments.length === 0 ? (
                <Typography variant="caption" color="text.secondary">
                  Buy stocks to see your allocation breakdown.
                </Typography>
              ) : (
                <>
                  {/* Stacked bar */}
                  <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', mb: 2 }}>
                    {allocationSegments.map(({ label, pct, color }) => (
                      <Box key={label} sx={{ width: `${pct}%`, bgcolor: color }} />
                    ))}
                  </Box>

                  {allocationSegments.map(({ label, pct, color }) => (
                    <Box
                      key={label}
                      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                        <Typography variant="body2" color="text.secondary">{label}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>{pct}%</Typography>
                    </Box>
                  ))}
                </>
              )}
            </Paper>

            {/* Top Position (largest holding by invested amount) */}
            <Paper
              elevation={0}
              sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'white' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body1" fontWeight={600}>
                  Largest Position
                </Typography>
                <TrendingUpIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.6 }} />
              </Box>

              {holdingsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Skeleton width={50} height={18} animation="wave" />
                    <Skeleton width={90} height={14} sx={{ mt: 0.25 }} animation="wave" />
                  </Box>
                  <Skeleton width={60} height={22} sx={{ borderRadius: 3 }} animation="wave" />
                </Box>
              ) : !topHolder ? (
                <Typography variant="caption" color="text.secondary">
                  No positions yet.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{topHolder.symbol}</Typography>
                    <Typography variant="caption" color="text.secondary">{topHolder.name}</Typography>
                  </Box>
                  <Chip
                    label={formatCurrency(topHolder.totalInvested)}
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
              )}
            </Paper>

            {/* Allocation donut — Recharts PieChart */}
            <Paper
              elevation={0}
              sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'white' }}
            >
              <Typography variant="body1" fontWeight={600} mb={2}>
                Allocation
              </Typography>

              {holdingsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Skeleton variant="circular" width={150} height={150} animation="wave" />
                </Box>
              ) : allocationSegments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    No holdings to display.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={allocationSegments}
                          dataKey="pct"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={2}
                          strokeWidth={0}
                        >
                          {allocationSegments.map(({ label, color }) => (
                            <Cell key={label} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip content={<AllocationTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  {/* Legend */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1 }}>
                    {allocationSegments.map(({ label, color, pct }) => (
                      <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {label} {pct}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Paper>

          </Box>
        </Grid>

      </Grid>
    </Container>
  );
}


export default Portfolio;
