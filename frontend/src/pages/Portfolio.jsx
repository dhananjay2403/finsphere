import { Box, Container, Typography, Paper, Grid, Skeleton, Chip } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { formatCurrency } from '../utils/helpers';
import { INITIAL_BALANCE } from '../utils/constants';


const BREAKDOWN_SEGMENTS = [
  { label: 'Technology', pct: 45, color: '#7A3E48' },
  { label: 'Finance', pct: 25, color: '#C88C96' },
  { label: 'Healthcare', pct: 20, color: '#B07A61' },
  { label: 'Other', pct: 10, color: '#E8DED5' },
];

const TOP_PERFORMER = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  returnPct: 12.4,
};

/* custom tooltip for PieChart */
function AllocationTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { label, pct } = payload[0].payload;
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
      <Typography variant="body2" fontWeight={700} color="primary.main">{pct}%</Typography>
    </Box>
  );
}

function Portfolio() {
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

        {/* Holdings table area */}
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
              <Chip
                label="In development"
                size="small"
                variant="outlined"
                sx={{ color: 'text.secondary', borderColor: '#e2e8f0', fontSize: '0.72rem' }}
              />
            </Box>

            <Box sx={{ textAlign: 'center', py: 6 }}>
              <PieChartIcon sx={{ fontSize: 48, color: '#e2e8f0', mb: 1.5 }} />
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                No holdings yet
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Stocks you buy will appear here with live P&amp;L tracking.
              </Typography>
            </Box>
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
              <Typography variant="h5" fontWeight={700} letterSpacing="-0.025em">
                {formatCurrency(INITIAL_BALANCE)}
              </Typography>
            </Paper>

            {/* P&L summary card */}
            <Paper
              elevation={0}
              sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'white' }}
            >
              <Typography variant="body1" fontWeight={600} mb={2.5}>
                P&amp;L Summary
              </Typography>
              {['Total invested', 'Current value', 'Total return'].map((label) => (
                <Box
                  key={label}
                  sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f1f5f9' }}
                >
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Skeleton width={80} height={16} animation="wave" />
                </Box>
              ))}
            </Paper>

            {/* Portfolio Breakdown */}
            <Paper
              elevation={0}
              sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'white' }}
            >
              <Typography variant="body1" fontWeight={600} mb={2}>
                Portfolio Breakdown
              </Typography>

              {/* Stacked bar */}
              <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', mb: 2 }}>
                {BREAKDOWN_SEGMENTS.map(({ label, pct, color }) => (
                  <Box key={label} sx={{ width: `${pct}%`, bgcolor: color }} />
                ))}
              </Box>

              {BREAKDOWN_SEGMENTS.map(({ label, pct, color }) => (
                <Box
                  key={label}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 0.75,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                    <Typography variant="body2" color="text.secondary">{label}</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>{pct}%</Typography>
                </Box>
              ))}

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Placeholder allocation — will update with real holdings.
              </Typography>
            </Paper>

            {/* Top Performer */}
            <Paper
              elevation={0}
              sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'white' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="body1" fontWeight={600}>
                  Top Performer
                </Typography>
                <TrendingUpIcon sx={{ fontSize: 18, color: 'primary.main', opacity: 0.6 }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {TOP_PERFORMER.symbol}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {TOP_PERFORMER.name}
                  </Typography>
                </Box>
                <Chip
                  label={`+${TOP_PERFORMER.returnPct}%`}
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
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                Placeholder — will calculate from real portfolio data.
              </Typography>
            </Paper>

            {/* Allocation donut — Recharts PieChart */}
            <Paper
              elevation={0}
              sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: 'white' }}
            >
              <Typography variant="body1" fontWeight={600} mb={2}>
                Allocation
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={BREAKDOWN_SEGMENTS}
                      dataKey="pct"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      strokeWidth={0}
                    >
                      {BREAKDOWN_SEGMENTS.map(({ label, color }) => (
                        <Cell key={label} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip content={<AllocationTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              {/* Legend */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', mt: 1 }}>
                {BREAKDOWN_SEGMENTS.map(({ label, color, pct }) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      {label} {pct}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Portfolio;
