import { useState } from 'react';
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
import { formatCurrency } from '../utils/helpers';
import { INITIAL_BALANCE } from '../utils/constants';


/* Mock data */

const PLACEHOLDER_STOCK = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  price: 189.84,
  change: +2.34,
  changePercent: +1.24,
  marketCap: '2.95T',
  peRatio: 31.2,
  high52w: 199.62,
  low52w: 124.17,
  volume: '54.2M',
  description:
    'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company also offers software and services including the App Store, Apple Music, iCloud, Apple Pay, and Apple TV+.',
};

// Mock chart data for different timeframes
const generateChartData = (points, basePrice, label) => {
  return Array.from({ length: points }, (_, i) => {
    const variation = Math.sin(i * 0.5) * 3 + Math.cos(i * 0.3) * 2 + (Math.random() - 0.5) * 2;
    const trend = (i / points) * 4;
    return {
      time: label === '1D' ? `${9 + Math.floor((i * 7) / points)}:${String((i * 13) % 60).padStart(2, '0')}` :
        label === '1W' ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i % 7] :
          `${i + 1}`,
      price: Math.round((basePrice + variation + trend) * 100) / 100,
    };
  });
};

const CHART_DATA = {
  '1D': generateChartData(24, 187, '1D'),
  '1W': generateChartData(7, 185, '1W'),
  '1M': generateChartData(30, 180, '1M'),
  '6M': generateChartData(26, 165, '6M'),
  '1Y': generateChartData(12, 150, '1Y'),
};

const TIMEFRAMES = ['1D', '1W', '1M', '6M', '1Y'];

const DEFAULT_WATCHLIST = [
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
];

const QUICK_QUANTITIES = [1, 5, 10];

/* Sub-components */

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
        ${payload[0].value.toFixed(2)}
      </Typography>
    </Box>
  );
}

/* Main component */

function TradePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [quantity, setQuantity] = useState('');
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1M');

  const stock = PLACEHOLDER_STOCK;
  const isPositive = stock.change >= 0;
  const chartData = CHART_DATA[selectedTimeframe];

  const handleRemoveFromWatchlist = (symbol) => {
    setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol));
  };

  const handleAddToWatchlist = () => {
    if (watchlist.some((item) => item.symbol === stock.symbol)) return;
    setWatchlist((prev) => [...prev, { symbol: stock.symbol, name: stock.name }]);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, width: { xs: '100%', sm: 'auto' } }}>
          <Typography variant="h4" fontWeight={700} letterSpacing="-0.025em">
            Trade
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Buy and sell stocks with virtual capital
          </Typography>
        </Box>
        <Chip
          label="Market Closed"
          size="small"
          sx={{
            bgcolor: '#fee2e2',
            color: '#dc2626',
            fontWeight: 600,
            fontSize: '0.72rem',
            height: 24,
            alignSelf: { xs: 'center', sm: 'center' },
          }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Left column */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search stocks by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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
              {/* Stock header */}
              <Box sx={{ p: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: 'rgba(122, 62, 72, 0.08)',
                      color: 'text.primary',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    {stock.symbol[0]}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {stock.symbol}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stock.name}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em">
                      ${stock.price.toFixed(2)}
                    </Typography>
                    <Chip
                      label={`${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%`}
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
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7A3E48" stopOpacity={0.15} />
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
              </Box>

              {/* Timeframe buttons */}
              <Box sx={{ display: 'flex', gap: 0.5, px: 3, pb: 2 }}>
                {TIMEFRAMES.map((tf) => (
                  <Button
                    key={tf}
                    size="small"
                    onClick={() => setSelectedTimeframe(tf)}
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
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                  Key Metrics
                </Typography>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'Market Cap', value: stock.marketCap },
                    { label: 'P/E Ratio', value: stock.peRatio },
                    { label: '52W High', value: `$${stock.high52w}` },
                    { label: '52W Low', value: `$${stock.low52w}` },
                    { label: 'Volume', value: stock.volume },
                    { label: 'Day Change', value: `${isPositive ? '+' : ''}$${stock.change.toFixed(2)}` },
                  ].map(({ label, value }) => (
                    <Grid item xs={4} key={label}>
                      <Box sx={{ p: 1.5, bgcolor: '#F8F4EF', borderRadius: 1.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', mb: 0.25 }}>
                          {label}
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.82rem' }}>
                          {value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Company Description */}
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', px: 3, py: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                  About
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7} sx={{ fontSize: '0.82rem' }}>
                  {stock.description}
                </Typography>
              </Box>
            </Paper>

            {/* Order card */}
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

              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                inputProps={{ min: 1 }}
                sx={{ mb: 1.5 }}
              />

              {/* Quick quantity buttons */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2.5 }}>
                {QUICK_QUANTITIES.map((qty) => (
                  <Button
                    key={qty}
                    size="small"
                    variant={String(quantity) === String(qty) ? 'contained' : 'outlined'}
                    onClick={() => setQuantity(String(qty))}
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

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    bgcolor: '#15803d',
                    '&:hover': { bgcolor: '#166534' },
                    fontWeight: 600,
                    py: 1.2,
                  }}
                >
                  Buy
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    bgcolor: '#dc2626',
                    '&:hover': { bgcolor: '#b91c1c' },
                    fontWeight: 600,
                    py: 1.2,
                  }}
                >
                  Sell
                </Button>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                Order execution will connect to the backend API in a future sprint.
              </Typography>
            </Paper>
          </Box>
        </Grid>

        {/* Right column */}
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
              <Typography variant="h5" fontWeight={700} letterSpacing="-0.025em">
                {formatCurrency(INITIAL_BALANCE)}
              </Typography>
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
                    label={`${watchlist.length} stocks`}
                    size="small"
                    sx={{ bgcolor: 'rgba(122, 62, 72, 0.08)', color: 'primary.main', fontWeight: 500, fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </Box>

              {watchlist.length === 0 ? (
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
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        py: 1,
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
                            bgcolor: 'rgba(122, 62, 72, 0.08)',
                            color: 'text.secondary',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                          }}
                        >
                          {symbol[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                            {symbol}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {name}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFromWatchlist(symbol)}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              <Button
                size="small"
                variant="outlined"
                onClick={handleAddToWatchlist}
                disabled={watchlist.some((item) => item.symbol === stock.symbol)}
                sx={{
                  mt: 2,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  fontSize: '0.8rem',
                  '&:hover': { bgcolor: 'rgba(122, 62, 72, 0.04)' },
                }}
              >
                + Add {stock.symbol} to Watchlist
              </Button>
            </Paper>

            {/* Recent orders */}
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
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <ReceiptLongIcon sx={{ fontSize: 28, color: '#e2e8f0', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    No orders yet
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Your recent orders will appear here once you start trading.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}


export default TradePage;
