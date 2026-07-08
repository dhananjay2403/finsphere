import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Skeleton,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  ClickAwayListener,
} from '@mui/material';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

import { formatCurrency } from '../utils/helpers';
import api from '../services/api';
import stockService from '../services/stockService';
import tradeService from '../services/tradeService';


const TIMEFRAMES = ['1D', '1W', '1M', '6M', '1Y'];
const QUICK_QUANTITIES = [1, 5, 10];

// Map UI timeframe labels to Finnhub resolution strings and Unix time offsets
const TIMEFRAME_CONFIG = {
  '1D': { resolution: '30', daysBack: 1 },
  '1W': { resolution: '60', daysBack: 7 },
  '1M': { resolution: 'D',  daysBack: 30 },
  '6M': { resolution: 'D',  daysBack: 180 },
  '1Y': { resolution: 'D',  daysBack: 365 },
};

const DEBOUNCE_MS = 400;


// Converts candles from stockService.getHistory into recharts-ready { time, price } points.
function candlesToChartData(candles = [], resolution) {
  return candles.map((c) => {
    const date = new Date(c.time * 1000);
    let timeLabel;
    if (resolution === '30' || resolution === '60') {
      // Intraday: show HH:MM
      timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      // Daily: show Mon DD
      timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return { time: timeLabel, price: c.close };
  });
}

// Formats market cap compactly, e.g. 2950000 → "2.95T".
function formatMarketCap(valueInMillions) {
  if (!valueInMillions) return '—';
  const val = valueInMillions * 1_000_000;
  if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
  if (val >= 1e9)  return `$${(val / 1e9).toFixed(2)}B`;
  if (val >= 1e6)  return `$${(val / 1e6).toFixed(2)}M`;
  return `$${val.toFixed(0)}`;
}


function StockChartTooltip({ active, payload, label }) {
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
        ${payload[0].value?.toFixed(2)}
      </Typography>
    </Box>
  );
}

function ChartSkeleton() {
  return (
    <Box sx={{ px: 1.5, pb: 1 }}>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} animation="wave" />
    </Box>
  );
}

function StockCardSkeleton() {
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Skeleton variant="circular" width={44} height={44} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="40%" height={20} />
          <Skeleton width="60%" height={16} sx={{ mt: 0.5 }} />
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Skeleton width={80} height={28} />
          <Skeleton width={60} height={20} sx={{ mt: 0.5 }} />
        </Box>
      </Box>
    </Box>
  );
}

function RecentOrderRow({ trade }) {
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
        <Avatar
          sx={{
            width: 28,
            height: 28,
            bgcolor: isBuy ? 'rgba(21, 128, 61, 0.1)' : 'rgba(220, 38, 38, 0.1)',
            color: isBuy ? '#15803d' : '#dc2626',
            fontSize: '0.6rem',
            fontWeight: 700,
          }}
        >
          {isBuy ? <TrendingUpIcon sx={{ fontSize: 14 }} /> : <TrendingDownIcon sx={{ fontSize: 14 }} />}
        </Avatar>
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
        <Typography
          variant="body2"
          fontWeight={600}
          color={isBuy ? '#15803d' : '#dc2626'}
        >
          {isBuy ? '-' : '+'}{formatCurrency(trade.totalAmount)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(trade.executedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Typography>
      </Box>
    </Box>
  );
}


function TradePage() {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  // Prevents the dropdown from re-opening when a selection sets the query programmatically
  const suppressDropdownRef = useRef(false);

  // Selected stock state
  const [stock, setStock] = useState(null);         // quote data
  const [profile, setProfileData] = useState(null); // profile data
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState('');

  // Chart state
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  // Order state
  const [quantity, setQuantity] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');

  // Portfolio state
  const [cashBalance, setCashBalance] = useState(null);
  const [cashLoading, setCashLoading] = useState(true);

  // Watchlist state
  const [watchlist, setWatchlist] = useState([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [watchlistError, setWatchlistError] = useState('');

  // Recent orders state
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);


  // Fetch cash balance on mount
  useEffect(() => {
    api.get('/portfolio/cash')
      .then((res) => setCashBalance(res.data.data.cashBalance))
      .catch(() => setCashBalance(null))
      .finally(() => setCashLoading(false));
  }, []);

  // Fetch watchlist on mount
  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await api.get('/watchlist');
      setWatchlist(res.data.data); // [{ symbol, name, addedAt }]
    } catch {
      setWatchlistError('Could not load watchlist');
    } finally {
      setWatchlistLoading(false);
    }
  }, []);

  useEffect(() => { fetchWatchlist(); }, [fetchWatchlist]);

  // Fetch recent orders on mount
  const fetchRecentOrders = useCallback(async () => {
    try {
      const result = await tradeService.getHistory({ limit: 5, page: 1 });
      setRecentOrders(result.data);
    } catch {
      // silently ignore — empty state is shown
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecentOrders(); }, [fetchRecentOrders]);


  // Debounced search
  useEffect(() => {
    const q = searchQuery.trim();

    if (!q) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await stockService.search(q);
        setSearchResults(results);
        // Only open the dropdown for genuine user keystrokes, not programmatic
        // symbol assignments (e.g. after clicking a result or a watchlist item)
        if (!suppressDropdownRef.current) {
          setShowDropdown(true);
        } else {
          suppressDropdownRef.current = false; // reset for the next user keystroke
        }
      } catch {
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setSearchLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);


  // Load stock data (quote + profile)
  const loadStock = useCallback(async (symbol) => {
    setStockLoading(true);
    setStockError('');
    setChartError('');
    setOrderError('');
    setOrderSuccess('');

    try {
      const [quoteData, profileData] = await Promise.all([
        stockService.getQuote(symbol),
        stockService.getProfile(symbol),
      ]);
      setStock(quoteData);
      setProfileData(profileData);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load stock data';
      setStockError(msg);
      setStock(null);
      setProfileData(null);
    } finally {
      setStockLoading(false);
    }
  }, []);


  // Load chart data
  const loadChart = useCallback(async (symbol, timeframe) => {
    setChartLoading(true);
    setChartError('');

    const { resolution, daysBack } = TIMEFRAME_CONFIG[timeframe];
    const now = Math.floor(Date.now() / 1000);
    const from = now - daysBack * 86400;

    try {
      const historyData = await stockService.getHistory(symbol, resolution, from, now);
      const formatted = candlesToChartData(historyData.candles, resolution);
      setChartData(formatted);
    } catch {
      setChartError('Chart data unavailable for this period');
      setChartData([]);
    } finally {
      setChartLoading(false);
    }
  }, []);


  // Re-fetch chart when symbol or timeframe changes
  useEffect(() => {
    if (!stock?.symbol) return;
    loadChart(stock.symbol, selectedTimeframe);
  }, [stock?.symbol, selectedTimeframe, loadChart]);


  // Select result from dropdown
  const handleSelectStock = (result) => {
    suppressDropdownRef.current = true; // suppress the next auto-search from re-opening dropdown
    clearTimeout(debounceRef.current);  // cancel any in-flight debounce for the old query
    setSearchQuery(result.symbol);
    setShowDropdown(false);
    setSearchResults([]);
    setQuantity('');
    loadStock(result.symbol);
  };


  // Timeframe change
  const handleTimeframeChange = (tf) => {
    setSelectedTimeframe(tf);
  };


  // Watchlist helpers
  const isInWatchlist = watchlist.some(
    (item) => item.symbol === stock?.symbol
  );

  const handleAddToWatchlist = async () => {
    if (!stock) return;
    try {
      await api.post('/watchlist', {
        symbol: stock.symbol,
        name: profile?.name || stock.symbol,
      });
      await fetchWatchlist();
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg) setWatchlistError(msg);
    }
  };

  const handleRemoveFromWatchlist = async (symbol) => {
    try {
      await api.delete(`/watchlist/${symbol}`);
      setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
    } catch {
      // silently ignore — item stays in list
    }
  };

  const handleClickWatchlistItem = (item) => {
    setSearchQuery(item.symbol);
    setQuantity('');
    loadStock(item.symbol);
  };


  // Execute trade
  const executeTrade = async (type) => {
    setOrderError('');
    setOrderSuccess('');

    const qty = parseInt(quantity, 10);

    if (!stock) {
      setOrderError('Select a stock first.');
      return;
    }
    if (!qty || qty < 1) {
      setOrderError('Enter a valid quantity (minimum 1).');
      return;
    }

    setOrderLoading(true);

    try {
      const payload = {
        symbol: stock.symbol,
        quantity: qty,
        pricePerShare: stock.price,
        ...(type === 'buy' ? { name: profile?.name || stock.symbol } : {}),
      };

      const result = type === 'buy'
        ? await tradeService.buy(payload)
        : await tradeService.sell(payload);

      // Update cash balance and refresh orders
      setCashBalance(result.cashBalance);
      await fetchRecentOrders();

      setOrderSuccess(
        `Successfully ${type === 'buy' ? 'bought' : 'sold'} ${qty} share${qty > 1 ? 's' : ''} of ${stock.symbol} at ${formatCurrency(stock.price)} each`
      );
      setQuantity('');
    } catch (err) {
      const msg = err.response?.data?.message || `${type === 'buy' ? 'Buy' : 'Sell'} failed. Please try again.`;
      setOrderError(msg);
    } finally {
      setOrderLoading(false);
    }
  };


  // Derived display values
  const isPositive = (stock?.change ?? 0) >= 0;
  const estimatedTotal = stock && quantity
    ? (parseFloat(quantity) || 0) * stock.price
    : null;


  // Render
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {/* Page header — centered */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.025em">
          Trade
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Buy and sell stocks with virtual capital
        </Typography>
      </Box>

      <Grid container spacing={3}>

        {/* ── Left column ────────────────────────────────────────────────── */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Search with dropdown */}
            <ClickAwayListener onClickAway={() => setShowDropdown(false)}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  fullWidth
                  placeholder="Search stocks by name or symbol…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                  autoComplete="off"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {searchLoading
                          ? <CircularProgress size={18} sx={{ color: 'text.secondary' }} />
                          : <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />}
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Dropdown results */}
                {showDropdown && searchResults.length > 0 && (
                  <Paper
                    elevation={4}
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      mt: 0.5,
                      zIndex: 1300,
                      borderRadius: 2,
                      overflow: 'hidden',
                      maxHeight: 280,
                      overflowY: 'auto',
                    }}
                  >
                    <List dense disablePadding>
                      {searchResults.map((result) => (
                        <ListItemButton
                          key={result.symbol}
                          onClick={() => handleSelectStock(result)}
                          sx={{
                            py: 1.25,
                            px: 2,
                            '&:hover': { bgcolor: '#F8F4EF' },
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:last-child': { borderBottom: 'none' },
                          }}
                        >
                          <ListItemAvatar sx={{ minWidth: 40 }}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: 'rgba(122, 62, 72, 0.08)',
                                color: 'text.primary',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                              }}
                            >
                              {result.symbol[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body2" fontWeight={600}>{result.symbol}</Typography>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {result.name}
                              </Typography>
                            }
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Paper>
                )}

                {/* No results state */}
                {showDropdown && !searchLoading && searchResults.length === 0 && searchQuery.trim().length > 1 && (
                  <Paper
                    elevation={4}
                    sx={{ position: 'absolute', top: '100%', left: 0, right: 0, mt: 0.5, zIndex: 1300, borderRadius: 2, p: 2, textAlign: 'center' }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No results for &ldquo;{searchQuery}&rdquo;
                    </Typography>
                  </Paper>
                )}
              </Box>
            </ClickAwayListener>

            {/* Stock Detail Card */}
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'white',
                overflow: 'hidden',
              }}
            >
              {/* Error state */}
              {stockError && (
                <Box sx={{ p: 3 }}>
                  <Alert severity="error" sx={{ borderRadius: 1.5 }}>{stockError}</Alert>
                </Box>
              )}

              {/* Loading skeleton */}
              {stockLoading && !stockError && <StockCardSkeleton />}

              {/* Empty / prompt state */}
              {!stockLoading && !stockError && !stock && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <SearchIcon sx={{ fontSize: 40, color: '#e2e8f0', mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    Search for a stock to get started
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Try &ldquo;AAPL&rdquo;, &ldquo;Tesla&rdquo; or &ldquo;Microsoft&rdquo;
                  </Typography>
                </Box>
              )}

              {/* Live stock data */}
              {!stockLoading && !stockError && stock && (
                <>
                  {/* Stock header */}
                  <Box sx={{ p: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {profile?.logo ? (
                        <Avatar
                          src={profile.logo}
                          alt={stock.symbol}
                          sx={{ width: 44, height: 44, bgcolor: 'rgba(122, 62, 72, 0.08)' }}
                        />
                      ) : (
                        <Avatar
                          sx={{
                            width: 44, height: 44,
                            bgcolor: 'rgba(122, 62, 72, 0.08)',
                            color: 'text.primary',
                            fontSize: '0.85rem',
                            fontWeight: 700,
                          }}
                        >
                          {stock.symbol[0]}
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" fontWeight={600}>{stock.symbol}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {profile?.name || stock.symbol}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em">
                          ${stock.price?.toFixed(2)}
                        </Typography>
                        <Chip
                          label={`${isPositive ? '+' : ''}${stock.changePercent?.toFixed(2)}%`}
                          size="small"
                          sx={{
                            bgcolor: isPositive ? '#dcfce7' : '#fee2e2',
                            color: isPositive ? '#15803d' : '#dc2626',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            height: 20,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Price Chart */}
                  <Box sx={{ px: 1.5, pb: 1 }}>
                    {chartLoading && <ChartSkeleton />}
                    {!chartLoading && chartError && (
                      <Box sx={{ px: 1.5, pb: 2, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">{chartError}</Typography>
                      </Box>
                    )}
                    {!chartLoading && !chartError && chartData.length > 0 && (
                      <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                          <defs>
                            <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#7A3E48" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#7A3E48" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8DED5" vertical={false} />
                          <XAxis
                            dataKey="time"
                            tick={{ fontSize: 10, fill: '#6B6B6B' }}
                            tickLine={false}
                            axisLine={{ stroke: '#E8DED5' }}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            tick={{ fontSize: 10, fill: '#6B6B6B' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `$${v}`}
                            domain={['dataMin - 2', 'dataMax + 2']}
                          />
                          <Tooltip content={<StockChartTooltip />} />
                          <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#7A3E48"
                            strokeWidth={2}
                            fill="url(#stockGradient)"
                            activeDot={{ r: 4, fill: '#7A3E48', stroke: '#FFFDFB', strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </Box>

                  {/* Timeframe buttons */}
                  <Box sx={{ display: 'flex', gap: 0.5, px: 3, pb: 2 }}>
                    {TIMEFRAMES.map((tf) => (
                      <Button
                        key={tf}
                        size="small"
                        onClick={() => handleTimeframeChange(tf)}
                        sx={{
                          minWidth: 0,
                          flex: 1,
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          py: 0.5,
                          borderRadius: 1.5,
                          ...(selectedTimeframe === tf
                            ? { bgcolor: 'rgba(122, 62, 72, 0.1)', color: 'primary.main' }
                            : { color: 'text.secondary', '&:hover': { bgcolor: 'rgba(122, 62, 72, 0.04)' } }
                          ),
                        }}
                      >
                        {tf}
                      </Button>
                    ))}
                  </Box>

                  {/* Key Metrics */}
                  <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 3, pt: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}
                    >
                      Key Metrics
                    </Typography>
                    <Grid container spacing={1.5}>
                      {[
                        { label: 'Market Cap', value: formatMarketCap(profile?.marketCap) },
                        { label: 'Industry',   value: profile?.industry || '—' },
                        { label: 'Day High',   value: stock.high  ? `$${stock.high.toFixed(2)}`  : '—' },
                        { label: 'Day Low',    value: stock.low   ? `$${stock.low.toFixed(2)}`   : '—' },
                        { label: 'Day Open',   value: stock.open  ? `$${stock.open.toFixed(2)}`  : '—' },
                        { label: 'Prev Close', value: stock.previousClose ? `$${stock.previousClose.toFixed(2)}` : '—' },
                      ].map(({ label, value }) => (
                        <Grid item xs={4} key={label}>
                          <Box sx={{ p: 1.5, bgcolor: '#F8F4EF', borderRadius: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', mb: 0.25 }}>
                              {label}
                            </Typography>
                            <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.82rem' }} noWrap>
                              {value}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  {/* Exchange / country badge row */}
                  {(profile?.exchange || profile?.country) && (
                    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: 3, py: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {profile?.exchange && (
                        <Chip
                          label={profile.exchange}
                          size="small"
                          sx={{ bgcolor: 'rgba(122, 62, 72, 0.06)', color: 'text.secondary', fontSize: '0.68rem', height: 20, fontWeight: 500 }}
                        />
                      )}
                      {profile?.country && (
                        <Chip
                          label={profile.country}
                          size="small"
                          sx={{ bgcolor: 'rgba(122, 62, 72, 0.06)', color: 'text.secondary', fontSize: '0.68rem', height: 20, fontWeight: 500 }}
                        />
                      )}
                    </Box>
                  )}
                </>
              )}
            </Paper>

            {/* Order card — always visible, disabled until stock is loaded */}
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
              <Typography variant="body1" fontWeight={600} mb={2}>
                Place Order
              </Typography>

              {/* Feedback messages */}
              {orderError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setOrderError('')}>
                  {orderError}
                </Alert>
              )}
              {orderSuccess && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 1.5 }} onClose={() => setOrderSuccess('')}>
                  {orderSuccess}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                inputProps={{ min: 1 }}
                disabled={!stock || orderLoading}
                sx={{ mb: 1.5 }}
              />

              {/* Quick quantity buttons */}
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                {QUICK_QUANTITIES.map((qty) => (
                  <Button
                    key={qty}
                    size="small"
                    variant={String(quantity) === String(qty) ? 'contained' : 'outlined'}
                    onClick={() => setQuantity(String(qty))}
                    disabled={!stock || orderLoading}
                    sx={{
                      minWidth: 0,
                      flex: 1,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      ...(String(quantity) === String(qty)
                        ? { bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }
                        : { borderColor: '#E8DED5', color: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'primary.main' } }
                      ),
                    }}
                  >
                    {qty} {qty === 1 ? 'Share' : 'Shares'}
                  </Button>
                ))}
              </Box>

              {/* Estimated total */}
              {estimatedTotal !== null && estimatedTotal > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1.5,
                    mb: 2,
                    bgcolor: '#F8F4EF',
                    borderRadius: 1.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Estimated total
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color="primary.main">
                    {formatCurrency(estimatedTotal)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!stock || orderLoading}
                  onClick={() => executeTrade('buy')}
                  sx={{
                    bgcolor: '#15803d',
                    '&:hover': { bgcolor: '#166534' },
                    '&:disabled': { bgcolor: '#dcfce7', color: '#86efac' },
                    fontWeight: 600,
                    py: 1.2,
                  }}
                >
                  {orderLoading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : 'Buy'}
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!stock || orderLoading}
                  onClick={() => executeTrade('sell')}
                  sx={{
                    bgcolor: '#dc2626',
                    '&:hover': { bgcolor: '#b91c1c' },
                    '&:disabled': { bgcolor: '#fee2e2', color: '#fca5a5' },
                    fontWeight: 600,
                    py: 1.2,
                  }}
                >
                  {orderLoading ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : 'Sell'}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Grid>

        {/* ── Right column ───────────────────────────────────────────────── */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Cash Available */}
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
              {cashLoading ? (
                <Skeleton width={120} height={32} animation="wave" />
              ) : (
                <Typography variant="h5" fontWeight={700} letterSpacing="-0.025em">
                  {cashBalance !== null ? formatCurrency(cashBalance) : '—'}
                </Typography>
              )}
            </Paper>

            {/* Watchlist */}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" fontWeight={600}>
                  Watchlist
                </Typography>
                {watchlist.length > 0 && (
                  <Chip
                    label={`${watchlist.length} ${watchlist.length === 1 ? 'stock' : 'stocks'}`}
                    size="small"
                    sx={{ bgcolor: 'rgba(122, 62, 72, 0.08)', color: 'primary.main', fontWeight: 500, fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>

              {watchlistLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Skeleton variant="circular" width={28} height={28} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="40%" height={14} />
                        <Skeleton width="70%" height={12} sx={{ mt: 0.25 }} />
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : watchlist.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <BookmarkBorderIcon sx={{ fontSize: 28, color: '#e2e8f0', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    No stocks saved
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Add stocks to your watchlist to track them here.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 280, overflowY: 'auto' }}>
                  {watchlist.map(({ symbol, name }) => (
                    <Box
                      key={symbol}
                      role="button"
                      tabIndex={0}
                      aria-label={`View ${symbol}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#fafafa' },
                        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 },
                        borderRadius: 1,
                        px: 0.5,
                      }}
                      onClick={() => handleClickWatchlistItem({ symbol, name })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleClickWatchlistItem({ symbol, name });
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: 'rgba(122, 62, 72, 0.08)',
                            color: 'text.secondary',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                          }}
                        >
                          {symbol[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600} lineHeight={1.2}>{symbol}</Typography>
                          <Typography variant="caption" color="text.secondary">{name}</Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handleRemoveFromWatchlist(symbol); }}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              {watchlistError && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {watchlistError}
                </Typography>
              )}

              {/* Add current stock to watchlist */}
              {stock && (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleAddToWatchlist}
                  disabled={isInWatchlist}
                  sx={{
                    mt: 2,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontSize: '0.8rem',
                    '&:hover': { bgcolor: 'rgba(122, 62, 72, 0.04)' },
                  }}
                >
                  {isInWatchlist ? `${stock.symbol} saved` : `+ Add ${stock.symbol} to Watchlist`}
                </Button>
              )}
            </Paper>

            {/* Recent Orders */}
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
              <Typography variant="body1" fontWeight={600} mb={2}>
                Recent Orders
              </Typography>
              <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                {ordersLoading ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {[1, 2, 3].map((i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                        <Skeleton variant="circular" width={28} height={28} />
                        <Box sx={{ flex: 1 }}>
                          <Skeleton width="30%" height={14} />
                          <Skeleton width="60%" height={12} sx={{ mt: 0.25 }} />
                        </Box>
                        <Skeleton width={70} height={14} />
                      </Box>
                    ))}
                  </Box>
                ) : recentOrders.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <ReceiptLongIcon sx={{ fontSize: 28, color: '#e2e8f0', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      No orders yet
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      Your recent orders will appear here once you start trading.
                    </Typography>
                  </Box>
                ) : (
                  recentOrders.map((trade) => (
                    <RecentOrderRow key={trade._id} trade={trade} />
                  ))
                )}
              </Box>
            </Paper>

          </Box>
        </Grid>

      </Grid>
    </Container>
  );
}


export default TradePage;
