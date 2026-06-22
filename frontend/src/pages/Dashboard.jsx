import { Box, Container, Typography, Grid, Paper, Chip, Button } from '@mui/material';
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
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/helpers';
import { INITIAL_BALANCE, ROUTES } from '../utils/constants';


/* Mock data */

// 30-day portfolio value history (mock)
const PORTFOLIO_HISTORY = Array.from({ length: 30 }, (_, i) => {
  const base = 100000;
  const day = i + 1;
  // Gentle upward trend with some variance
  const value = base + day * 120 + Math.sin(day * 0.8) * 800 + Math.cos(day * 0.3) * 400;
  return {
    day: `Day ${day}`,
    value: Math.round(value * 100) / 100,
  };
});

const TOP_ALLOCATIONS = [
  { label: 'Technology', pct: 45, color: '#7A3E48' },
  { label: 'Finance', pct: 25, color: '#C88C96' },
  { label: 'Healthcare', pct: 20, color: '#B07A61' },
];

const HEALTH_METRICS = [
  { label: 'Diversification', score: 80 },
  { label: 'Cash Management', score: 65 },
  { label: 'Activity', score: 72 },
  { label: 'Concentration', score: 68 },
];

/* Constants */

const KPI_CARDS = [
  {
    label: 'Portfolio Value',
    value: formatCurrency(INITIAL_BALANCE),
    badge: null,
    badgeText: null,
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 18 }} />,
    accentIcon: true,
  },
  {
    label: 'Total Gain / Loss',
    value: formatCurrency(0),
    badge: 'neutral',
    badgeText: '+0.00%',
    icon: <TrendingUpIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: "Today's Change",
    value: formatCurrency(0),
    badge: 'neutral',
    badgeText: '+0.00%',
    icon: <ShowChartIcon sx={{ fontSize: 18 }} />,
  },
  {
    label: 'Total Transactions',
    value: '0',
    badge: null,
    badgeText: 'All time',
    icon: <SwapHorizIcon sx={{ fontSize: 18 }} />,
  },
];

const BADGE_STYLES = {
  positive: { bgcolor: '#dcfce7', color: '#15803d' },
  negative: { bgcolor: '#fee2e2', color: '#dc2626' },
  neutral: { bgcolor: '#f1f5f9', color: '#64748b' },
};

/* Sub-components */

function KpiCard({ label, value, badge, badgeText, icon, accentIcon }) {
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
        <Box sx={{ color: accentIcon ? 'primary.main' : 'text.secondary', opacity: accentIcon ? 0.7 : 0.4 }}>{icon}</Box>
      </Box>

      <Typography
        variant="h5"
        fontWeight={700}
        letterSpacing="-0.025em"
        mb={1}
        sx={{ fontSize: { xs: '1.15rem', sm: '1.5rem' }, color: valueColor }}
      >
        {value}
      </Typography>

      {badge ? (
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

function getHealthLabel(score) {
  if (score >= 80) return { text: 'Excellent', color: '#15803d' };
  if (score >= 60) return { text: 'Good', color: '#7A3E48' };
  if (score >= 40) return { text: 'Moderate', color: '#b45309' };
  return { text: 'Poor', color: '#dc2626' };
}

/* custom tooltip for the chart */
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

/* Main component */

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] ?? 'Investor';

  const healthScore = 72;
  const health = getHealthLabel(healthScore);

  const challengeDays = 12;
  const challengeTotal = 30;
  const challengePercent = Math.round((challengeDays / challengeTotal) * 100);

  // Challenge tracking details
  const challengeDetails = [
    { label: 'Learning streak', value: '5 days' },
    { label: 'Trading streak', value: '3 days' },
    { label: 'Completion', value: `${challengePercent}%` },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      <Box sx={{ mb: 4, textAlign: { xs: 'center', md: 'left' } }}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.025em">
          Welcome back, {firstName}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Here&apos;s your portfolio overview
        </Typography>
      </Box>

      {/* KPI cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {KPI_CARDS.map((card) => (
          <Grid item xs={6} sm={6} md={3} key={card.label}>
            <KpiCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Chart row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2.5,
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                Portfolio Performance
              </Typography>
              <Chip
                label="30 Days"
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
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={PORTFOLIO_HISTORY} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
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
          </Paper>
        </Grid>

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
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2.5,
              }}
            >
              <Typography variant="body1" fontWeight={600}>
                Allocation
              </Typography>
              <Chip
                label={`${TOP_ALLOCATIONS.length} sectors`}
                size="small"
                sx={{ bgcolor: 'rgba(122, 62, 72, 0.08)', color: 'primary.main', fontWeight: 500, fontSize: '0.7rem', height: 20 }}
              />
            </Box>

            {/* Top 3 allocations */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
              {TOP_ALLOCATIONS.map(({ label, pct, color }) => (
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
        <Grid item xs={12} md={6}>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  Portfolio Health Score
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Based on diversification, risk, and activity
                </Typography>
              </Box>
              <FavoriteIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.6 }} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {healthScore}
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

            <Box sx={{ height: 6, bgcolor: '#E8DED5', borderRadius: 3, overflow: 'hidden', mb: 2.5 }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${healthScore}%`,
                  bgcolor: 'primary.main',
                  borderRadius: 3,
                }}
              />
            </Box>

            {/* Sub-metrics */}
            <Grid container spacing={1}>
              {HEALTH_METRICS.map(({ label, score }) => (
                <Grid item xs={6} key={label}>
                  <Box sx={{ p: 1.5, bgcolor: '#F8F4EF', borderRadius: 1.5 }}>
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
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
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

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1.5 }}>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {challengeDays}
              </Typography>
              <Typography variant="body2" color="text.secondary">/ {challengeTotal} days</Typography>
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
              <Box
                sx={{
                  height: '100%',
                  width: `${challengePercent}%`,
                  bgcolor: 'primary.main',
                  borderRadius: 3,
                }}
              />
            </Box>

            {/* Tracking details */}
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
          </Paper>
        </Grid>
      </Grid>

      {/* Recent transactions */}
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
        <Typography variant="body1" fontWeight={600} mb={3}>
          Recent Transactions
        </Typography>

        <Box sx={{ textAlign: 'center', py: 3 }}>
          <SwapHorizIcon sx={{ fontSize: 28, color: '#e2e8f0', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            No transactions yet
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Your trade history will appear here once you start trading.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}


export default Dashboard;
