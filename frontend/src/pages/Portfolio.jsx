import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Skeleton,
  Chip,
  Alert,
  Select,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import PieChartIcon from '@mui/icons-material/PieChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { formatCurrency, formatPercent } from '../utils/helpers';
import portfolioService from '../services/portfolioService';


// Constants
const SEGMENT_COLORS = [
  '#7A3E48',
  '#C88C96',
  '#B07A61',
  '#E8DED5',
  '#9D5F6B',
  '#D4A0A8',
  '#C49A7A',
];


// Gain/green, loss/red — matches the app-wide convention (the MUI theme's success/error tokens use different hues).
const GAIN_COLOR = '#15803d';
const LOSS_COLOR = '#dc2626';
function pnlColor(value) {
  if (value > 0) return GAIN_COLOR;
  if (value < 0) return LOSS_COLOR;
  return 'text.primary';
}


// Helpers
function buildAllocationSegments(holdings) {
  if (!holdings || holdings.length === 0) return [];
  const total = holdings.reduce((sum, h) => sum + h.totalInvested, 0);
  if (total === 0) return [];

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


// Sub-components
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

// Max height of the scrollable holdings area, so the card stays a fixed size as positions are added.
const HOLDINGS_MAX_HEIGHT = 428;

// Sortable columns — `key` maps to a holding field; `sortLabel` is the friendlier mobile dropdown wording.
const HOLDING_COLUMNS = [
  { label: 'Stock',     sortLabel: 'Alphabetical',  key: 'symbol',        align: 'left' },
  { label: 'Qty',       sortLabel: 'Quantity',      key: 'quantity',      align: 'right' },
  { label: 'Avg Cost',  sortLabel: 'Avg Cost',      key: 'avgCostPrice',  align: 'right' },
  { label: 'Mkt Value', sortLabel: 'Market Value',  key: 'currentValue',  align: 'right' },
  { label: 'P/L',       sortLabel: 'Profit / Loss', key: 'unrealisedPnL', align: 'right' },
];

const DEFAULT_SORT = { key: 'currentValue', dir: 'desc' };

// Symbol sorts alphabetically; numeric columns sort by value with missing quotes (null) always last.
function sortHoldings(holdings, { key, dir }) {
  const sorted = [...holdings];
  sorted.sort((a, b) => {
    if (key === 'symbol') {
      return dir === 'asc'
        ? a.symbol.localeCompare(b.symbol)
        : b.symbol.localeCompare(a.symbol);
    }
    const av = a[key];
    const bv = b[key];
    const aNull = av == null;
    const bNull = bv == null;
    if (aNull && bNull) return 0;
    if (aNull) return 1;   // nulls last
    if (bNull) return -1;
    return dir === 'asc' ? av - bv : bv - av;
  });
  return sorted;
}

// Desktop holdings table — a real <table> shares column widths so headers align with values, and a
// sticky header + scrollable container keeps the card a fixed height as positions grow.
const headCellSx = {
  bgcolor: 'white',
  borderBottom: '2px solid',
  borderColor: 'divider',
  color: 'text.secondary',
  fontSize: '0.66rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.02em',
  py: 1,
  px: 0.5,
  whiteSpace: 'nowrap',
};

// Compact padding so all five columns fit the narrow lg panel without a scrollbar hiding P/L.
const bodyCellSx = { px: 0.5 };

function HoldingsTable({ holdings, sort, onSort }) {
  return (
    <TableContainer sx={{ maxHeight: HOLDINGS_MAX_HEIGHT }}>
      <Table stickyHeader size="small" aria-label="Holdings">
        <TableHead>
          <TableRow>
            {HOLDING_COLUMNS.map(({ label, key, align }) => (
              <TableCell
                key={key}
                align={align === 'left' ? 'left' : 'center'}
                sortDirection={sort.key === key ? sort.dir : false}
                sx={headCellSx}
              >
                <TableSortLabel
                  active={sort.key === key}
                  direction={sort.key === key ? sort.dir : 'asc'}
                  onClick={() => onSort(key)}
                >
                  {label}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {holdings.map((h) => {
            const hasQuote = h.currentValue != null;
            const pnl = h.unrealisedPnL;
            return (
              <TableRow key={h._id} hover>
                <TableCell sx={bodyCellSx}>
                  <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{h.symbol}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', maxWidth: 118 }}>
                    {h.name}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={bodyCellSx}>
                  <Typography variant="body2" fontWeight={600}>{h.quantity}</Typography>
                </TableCell>
                <TableCell align="center" sx={bodyCellSx}>
                  <Typography variant="body2" fontWeight={600}>${h.avgCostPrice?.toFixed(2)}</Typography>
                </TableCell>
                <TableCell align="center" sx={bodyCellSx}>
                  <Typography variant="body2" fontWeight={600}>
                    {hasQuote ? formatCurrency(h.currentValue) : '—'}
                  </Typography>
                </TableCell>
                <TableCell align="center" sx={bodyCellSx}>
                  {hasQuote ? (
                    <>
                      <Typography variant="body2" fontWeight={600} sx={{ color: pnlColor(pnl) }}>
                        {pnl > 0 ? '+' : ''}{formatCurrency(pnl)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: pnlColor(pnl), display: 'block', fontSize: '0.68rem' }}>
                        {formatPercent(h.unrealisedPnLPct)}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" fontWeight={600}>—</Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function HoldingsTableSkeleton() {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {HOLDING_COLUMNS.map(({ label, align }) => (
              <TableCell key={label} align={align === 'left' ? 'left' : 'center'} sx={headCellSx}>
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[1, 2, 3].map((i) => (
            <TableRow key={i}>
              <TableCell sx={bodyCellSx}>
                <Skeleton width={50} height={16} animation="wave" />
                <Skeleton width={100} height={12} animation="wave" sx={{ mt: 0.25 }} />
              </TableCell>
              {[24, 48, 60, 64].map((w) => (
                <TableCell key={w} align="center" sx={bodyCellSx}>
                  <Skeleton width={w} height={16} animation="wave" sx={{ mx: 'auto' }} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// Stacked card for narrow screens — truncates long company names and pins the numbers to the right.
function HoldingCardMobile({ holding, isLast }) {
  const hasQuote = holding.currentValue != null;
  const pnl = holding.unrealisedPnL;
  return (
    <Box sx={{ py: 1.5, borderBottom: isLast ? 'none' : '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} lineHeight={1.2}>{holding.symbol}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {holding.name}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
          <Typography variant="body2" fontWeight={700}>
            {hasQuote ? formatCurrency(holding.currentValue) : '—'}
          </Typography>
          {hasQuote && (
            <Typography variant="caption" sx={{ color: pnlColor(pnl), display: 'block', fontSize: '0.7rem' }}>
              {pnl > 0 ? '+' : ''}{formatCurrency(pnl)} ({formatPercent(holding.unrealisedPnLPct)})
            </Typography>
          )}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2.5 }}>
        <Typography variant="caption" color="text.secondary">
          Qty <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>{holding.quantity}</Box>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Avg <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>${holding.avgCostPrice?.toFixed(2)}</Box>
        </Typography>
      </Box>
    </Box>
  );
}


// Main component
function Portfolio() {

  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [holdingsLoading, setHoldingsLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [holdingsError, setHoldingsError] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [sort, setSort] = useState(DEFAULT_SORT);


  const fetchData = useCallback(async () => {
    const [holdingsResult, summaryResult] = await Promise.allSettled([
      portfolioService.getHoldings(),
      portfolioService.getSummary(),
    ]);

    if (holdingsResult.status === 'fulfilled') {
      setHoldings(holdingsResult.value);
    } else {
      setHoldingsError('Could not load holdings. Please refresh.');
    }
    setHoldingsLoading(false);

    if (summaryResult.status === 'fulfilled') {
      setSummary(summaryResult.value);
    } else {
      setSummaryError('Could not load portfolio summary.');
    }
    setSummaryLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);


  const allocationSegments = buildAllocationSegments(holdings);
  const hasHoldings = holdings.length > 0;
  const sortedHoldings = useMemo(() => sortHoldings(holdings, sort), [holdings, sort]);

  // Toggle direction when re-selecting the active column, otherwise switch to
  // the new column with a sensible default (A→Z for names, high→low for numbers).
  const handleSort = useCallback((key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: key === 'symbol' ? 'asc' : 'desc' }
    );
  }, []);


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {/* ── Page header — centered ── */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.025em">
          Portfolio
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Your holdings and allocation breakdown
        </Typography>
      </Box>

      <Grid container spacing={2.5}>

        {/* ── Left column — Holdings table (wider at lg so all 5 columns fit) ── */}
        <Grid item xs={12} md={12} lg={6}>
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

            {holdingsError && (
              <Alert severity="error" sx={{ borderRadius: 1.5 }}>{holdingsError}</Alert>
            )}

            {holdingsLoading && !holdingsError && (
              <Box>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <HoldingsTableSkeleton />
                </Box>
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Skeleton width={140} height={18} animation="wave" />
                      <Skeleton width={90} height={14} animation="wave" sx={{ mt: 0.5 }} />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

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

            {!holdingsLoading && !holdingsError && hasHoldings && (
              <Box>
                {/* Mobile sort control — the desktop table uses sortable headers */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                    Sort by
                  </Typography>
                  <Select
                    size="small"
                    value={sort.key}
                    onChange={(e) => setSort({ key: e.target.value, dir: e.target.value === 'symbol' ? 'asc' : 'desc' })}
                    sx={{ flex: 1, fontSize: '0.8rem', '& .MuiSelect-select': { py: 0.5 } }}
                  >
                    {HOLDING_COLUMNS.map(({ key, sortLabel }) => (
                      <MenuItem key={key} value={key} sx={{ fontSize: '0.8rem' }}>{sortLabel}</MenuItem>
                    ))}
                  </Select>
                  <IconButton
                    size="small"
                    onClick={() => setSort((p) => ({ ...p, dir: p.dir === 'asc' ? 'desc' : 'asc' }))}
                    aria-label={`Sort ${sort.dir === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    {sort.dir === 'asc'
                      ? <ArrowUpwardIcon sx={{ fontSize: 18 }} />
                      : <ArrowDownwardIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Box>

                {/* Desktop sortable table (sticky header + scrolls past HOLDINGS_MAX_HEIGHT) */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <HoldingsTable holdings={sortedHoldings} sort={sort} onSort={handleSort} />
                </Box>

                {/* Mobile stacked cards — scroll once the list gets long */}
                <Box sx={{ display: { xs: 'block', md: 'none' }, maxHeight: HOLDINGS_MAX_HEIGHT, overflowY: 'auto' }}>
                  {sortedHoldings.map((holding, idx) => (
                    <HoldingCardMobile
                      key={holding._id}
                      holding={holding}
                      isLast={idx === sortedHoldings.length - 1}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Middle column — Cash Available + P&L Summary */}
        <Grid item xs={12} md={6} lg={3}>
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
              <Typography variant="body1" fontWeight={600} mb={2}>
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
                  label: 'Holdings value',
                  value: summaryLoading ? null : formatCurrency(summary?.currentValue ?? 0),
                },
                {
                  label: 'Portfolio value',
                  value: summaryLoading ? null : formatCurrency(summary?.portfolioValue ?? 0),
                },
                {
                  // Return on capital in currently-open positions only.
                  label: 'Unrealized P/L',
                  value: summaryLoading ? null : formatCurrency(summary?.totalReturn ?? 0),
                  sub: summaryLoading ? null : formatPercent(summary?.totalReturnPct ?? 0),
                  color: !summaryLoading && summary ? pnlColor(summary.totalReturn) : 'text.primary',
                },
                {
                  // Account-level return since inception (realised + unrealised).
                  label: 'Total gain/loss',
                  value: summaryLoading ? null : formatCurrency(summary?.totalPnL ?? 0),
                  sub: summaryLoading ? null : formatPercent(summary?.totalPnLPct ?? 0),
                  color: !summaryLoading && summary ? pnlColor(summary.totalPnL) : 'text.primary',
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

          </Box>
        </Grid>

        {/* Right column — Allocation (above) + Portfolio Breakdown */}
        <Grid item xs={12} md={6} lg={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Allocation donut chart — appears first */}
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
                  {/* Inline legend */}
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

            {/* Portfolio Breakdown */}
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

          </Box>
        </Grid>

      </Grid>
    </Container>
  );
}


export default Portfolio;
