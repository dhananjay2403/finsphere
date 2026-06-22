import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import SchoolIcon from '@mui/icons-material/School';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { ROUTES } from '../utils/constants';


const FEATURES = [
  {
    icon: <ShowChartIcon fontSize="small" />,
    title: 'Paper Trading',
    description:
      'Buy and sell real stocks with $100,000 in virtual capital. Zero risk, real market data.',
  },
  {
    icon: <BarChartIcon fontSize="small" />,
    title: 'Portfolio Analytics',
    description:
      'Track holdings, monitor profit & loss, and understand your allocation in real time.',
  },
  {
    icon: <SchoolIcon fontSize="small" />,
    title: 'Learning Hub',
    description:
      'Structured guides on ETFs, risk management, technical and fundamental analysis.',
  },
  {
    icon: <NewspaperIcon fontSize="small" />,
    title: 'Market News',
    description:
      'Curated financial news feed so you understand the context behind price movements.',
  },
];

const PREVIEW_HOLDINGS = [
  { ticker: 'AAPL', name: 'Apple Inc.', change: '+1.24%', positive: true },
  { ticker: 'TSLA', name: 'Tesla Inc.', change: '-0.83%', positive: false },
  { ticker: 'MSFT', name: 'Microsoft', change: '+0.51%', positive: true },
];

const MINI_BARS = [40, 55, 35, 68, 58, 78, 62, 88, 72, 92, 84, 100];

const TRUST_ITEMS = [
  '$100,000 Virtual Capital',
  'No Real Money Required',
  'Beginner Friendly',
  'Free Learning Resources',
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Create Account', description: 'Sign up in seconds with just your email.' },
  { step: '2', title: 'Receive $100,000 Virtual Capital', description: 'Start with a generous paper trading balance.' },
  { step: '3', title: 'Learn & Build Confidence', description: 'Practice trading, track results, and grow your skills.' },
];

const SECURITY_ITEMS = [
  {
    icon: <ShowChartIcon />,
    title: 'Real Market Data',
    description: 'Practice with live stock prices and actual market conditions.',
  },
  {
    icon: <ShieldOutlinedIcon />,
    title: 'Risk-Free Practice',
    description: 'Trade with $100,000 virtual capital. No real money, no risk.',
  },
  {
    icon: <BarChartIcon />,
    title: 'Portfolio Tracking',
    description: 'Monitor your holdings, P&L, and allocation in real time.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'Is real money used?',
    answer: 'No. FinSphere is a paper trading platform. You trade with $100,000 in virtual capital. No real money is involved at any point.',
  },
  {
    question: 'How does paper trading work?',
    answer: 'Paper trading simulates real stock market trading using virtual money. You can buy and sell stocks at real market prices to practice investing without financial risk.',
  },
  {
    question: 'Who is FinSphere for?',
    answer: 'FinSphere is designed for students, beginners, and anyone who wants to learn investing fundamentals before committing real money.',
  },
  {
    question: 'What stocks can I trade?',
    answer: 'You can trade all major US-listed stocks. Search by company name or ticker symbol to find any stock and place a virtual trade.',
  },
  {
    question: 'Can I reset my portfolio?',
    answer: 'Yes. You can reset your virtual balance back to $100,000 at any time and start fresh with a clean portfolio.',
  },
  {
    question: 'Is the platform free?',
    answer: 'Yes, FinSphere is completely free to use. Create an account and start learning immediately.',
  },
];

const FOOTER_LINKS = [
  { label: 'Paper Trading', path: ROUTES.DASHBOARD },
  { label: 'Learning Hub', path: ROUTES.LEARN },
  { label: 'Market News', path: ROUTES.NEWS },
  { label: 'GitHub', href: 'https://github.com/dhananjay2403/finsphere' },
];

function HeroPreviewCard() {
  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        p: 3,
        bgcolor: '#FFFDFB',
        boxShadow: '0 8px 24px rgb(0 0 0 / 0.06)',
        maxWidth: 360,
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Portfolio Value
          </Typography>
          <Typography variant="h5" fontWeight={700} letterSpacing="-0.03em" lineHeight={1.2}>
            $103,241.80
          </Typography>
        </Box>
        <Chip
          label="+3.24%"
          size="small"
          sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: '0.72rem' }}
        />
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '3px',
          height: 56,
          mb: 2.5,
        }}
      >
        {MINI_BARS.map((height, i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: `${height}%`,
              bgcolor: i === MINI_BARS.length - 1 ? 'primary.main' : 'rgba(122, 62, 72, 0.15)',
              borderRadius: '2px 2px 0 0',
            }}
          />
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
        Holdings
      </Typography>
      {PREVIEW_HOLDINGS.map(({ ticker, name, change, positive }) => (
        <Box
          key={ticker}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
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
              {ticker[0]}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                {ticker}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {name}
              </Typography>
            </Box>
          </Box>
          <Typography
            variant="body2"
            fontWeight={500}
            color={positive ? 'success.main' : 'error.main'}
          >
            {change}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// Static mini-preview cards for Platform Overview section
function DashboardPreview() {
  return (
    <Box sx={{ p: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body2" fontWeight={600}>Portfolio Overview</Typography>
        <Chip label="Live" size="small" sx={{ bgcolor: '#dcfce7', color: '#15803d', fontWeight: 600, fontSize: '0.65rem', height: 20 }} />
      </Box>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
        {[
          { label: 'Value', val: '$103,241', icon: <AccountBalanceWalletIcon sx={{ fontSize: 14 }} /> },
          { label: 'Return', val: '+3.24%', icon: <TrendingUpIcon sx={{ fontSize: 14 }} /> },
        ].map(({ label, val, icon }) => (
          <Box key={label} sx={{ flex: 1, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: '#F8F4EF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, color: 'text.secondary' }}>
              {icon}
              <Typography variant="caption" color="text.secondary">{label}</Typography>
            </Box>
            <Typography variant="body2" fontWeight={700}>{val}</Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: 40 }}>
        {MINI_BARS.map((h, i) => (
          <Box key={i} sx={{ flex: 1, height: `${h}%`, bgcolor: i === MINI_BARS.length - 1 ? 'primary.main' : 'rgba(122, 62, 72, 0.12)', borderRadius: '2px 2px 0 0' }} />
        ))}
      </Box>
    </Box>
  );
}

function AnalyticsPreview() {
  const segments = [
    { label: 'Tech', pct: 45, color: '#7A3E48' },
    { label: 'Finance', pct: 25, color: '#C88C96' },
    { label: 'Health', pct: 20, color: '#B07A61' },
    { label: 'Other', pct: 10, color: '#E8DED5' },
  ];
  return (
    <Box sx={{ p: 2.5 }}>
      <Typography variant="body2" fontWeight={600} mb={2}>Sector Allocation</Typography>
      <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', mb: 2 }}>
        {segments.map(({ label, pct, color }) => (
          <Box key={label} sx={{ width: `${pct}%`, bgcolor: color }} />
        ))}
      </Box>
      {segments.map(({ label, pct, color }) => (
        <Box key={label} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
            <Typography variant="caption">{label}</Typography>
          </Box>
          <Typography variant="caption" fontWeight={600}>{pct}%</Typography>
        </Box>
      ))}
    </Box>
  );
}

function TradingPreview() {
  return (
    <Box sx={{ p: 2.5 }}>
      <Typography variant="body2" fontWeight={600} mb={2}>Trade Stocks</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: '#F8F4EF' }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(122, 62, 72, 0.08)', color: 'text.primary', fontSize: '0.65rem', fontWeight: 700 }}>A</Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={600} lineHeight={1.2}>AAPL</Typography>
          <Typography variant="caption" color="text.secondary">Apple Inc.</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight={600}>$189.84</Typography>
          <Typography variant="caption" color="success.main">+1.24%</Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Box sx={{ flex: 1, py: 1, textAlign: 'center', bgcolor: '#dcfce7', color: '#15803d', borderRadius: 1, fontSize: '0.75rem', fontWeight: 600 }}>Buy</Box>
        <Box sx={{ flex: 1, py: 1, textAlign: 'center', bgcolor: '#fee2e2', color: '#dc2626', borderRadius: 1, fontSize: '0.75rem', fontWeight: 600 }}>Sell</Box>
      </Box>
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">Transactions</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
          <SwapHorizIcon sx={{ fontSize: 14 }} />
          <Typography variant="caption">12 trades</Typography>
        </Box>
      </Box>
    </Box>
  );
}

function LearningPreview() {
  const modules = [
    { name: 'Getting Started', progress: 100 },
    { name: 'ETF Basics', progress: 60 },
    { name: 'Risk Management', progress: 0 },
  ];
  return (
    <Box sx={{ p: 2.5 }}>
      <Typography variant="body2" fontWeight={600} mb={2}>Your Progress</Typography>
      {modules.map(({ name, progress }) => (
        <Box key={name} sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption">{name}</Typography>
            <Typography variant="caption" fontWeight={600} color={progress === 100 ? 'success.main' : 'text.secondary'}>
              {progress === 100 ? 'Complete' : `${progress}%`}
            </Typography>
          </Box>
          <Box sx={{ height: 4, bgcolor: '#E8DED5', borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ height: '100%', width: `${progress}%`, bgcolor: progress === 100 ? 'success.main' : 'primary.main', borderRadius: 2 }} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

const PRODUCT_PREVIEWS = [
  { title: 'Portfolio Dashboard', description: 'Overview of portfolio value, daily P&L, and asset allocation at a glance.', preview: <DashboardPreview /> },
  { title: 'Portfolio Analytics', description: 'Detailed performance metrics, sector breakdown, and historical returns.', preview: <AnalyticsPreview /> },
  { title: 'Trading Interface', description: 'Buy and sell stocks with real-time prices and instant order execution.', preview: <TradingPreview /> },
  { title: 'Learning Hub', description: 'Structured courses from beginner basics to advanced portfolio strategies.', preview: <LearningPreview /> },
];

function FaqItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: '#FFFDFB',
        overflow: 'hidden',
      }}
    >
      <Box
        onClick={() => setOpen(!open)}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'rgba(122, 62, 72, 0.03)' },
        }}
      >
        <Typography variant="body1" fontWeight={600}>
          {question}
        </Typography>
        <ExpandMoreIcon
          sx={{
            color: 'text.secondary',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
            ml: 1,
          }}
        />
      </Box>
      {open && (
        <Box sx={{ px: 3, pb: 2.5 }}>
          <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
            {answer}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function ProductPreviewCard({ title, description, preview }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: '#FFFDFB',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#FFFDFB' }}>
        {preview}
      </Box>
      <Box sx={{ p: 2.5 }}>
        <Typography variant="body1" fontWeight={600} mb={0.5}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
          {description}
        </Typography>
      </Box>
    </Box>
  );
}

function LandingPage() {
  return (
    <Box sx={{ bgcolor: '#F8F4EF', minHeight: '100vh' }}>

      {/* Navbar */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'rgba(255, 253, 251, 0.95)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2, gap: 1 }}>
            <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            <Typography variant="body1" fontWeight={700} letterSpacing="-0.025em">
              FinSphere
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Button
              component={Link}
              to={ROUTES.LOGIN}
              size="small"
              sx={{ color: 'text.secondary', fontWeight: 400 }}
            >
              Sign in
            </Button>
            <Button
              component={Link}
              to={ROUTES.REGISTER}
              variant="contained"
              size="small"
              sx={{ px: 2.5 }}
            >
              Get started
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Hero */}
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: { xs: 4, md: 6 },
            alignItems: 'center',
            py: { xs: 6, md: 12 },
          }}
        >
          <Box>
            <Chip
              label="Paper trading · No real money required"
              size="small"
              sx={{
                mb: 2.5,
                bgcolor: 'rgba(122, 62, 72, 0.08)',
                color: 'primary.main',
                fontWeight: 500,
                border: '1px solid rgba(122, 62, 72, 0.15)',
                fontSize: '0.75rem',
              }}
            />

            <Typography
              component="h1"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                color: 'text.primary',
                mb: 2,
              }}
            >
              Learn to invest.
              <br />
              Without the risk.
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 440, mb: 3.5, fontSize: '1.05rem', lineHeight: 1.75 }}
            >
              FinSphere gives you $100,000 in virtual capital to practice stock trading,
              track your portfolio, and build real investing confidence.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                component={Link}
                to={ROUTES.REGISTER}
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{ px: 3 }}
              >
                Start trading free
              </Button>
              <Button
                component={Link}
                to={ROUTES.LEARN}
                variant="outlined"
                size="large"
                sx={{
                  px: 3,
                  borderColor: '#E8DED5',
                  color: 'text.secondary',
                  '&:hover': { borderColor: '#B07A61', bgcolor: 'rgba(176, 122, 97, 0.04)' },
                }}
              >
                Explore lessons
              </Button>
            </Box>

            <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', mt: 4 }}>
              <HeroPreviewCard />
            </Box>
          </Box>

          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <HeroPreviewCard />
          </Box>
        </Box>
      </Container>

      {/* Trust Bar */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: '#FFFDFB' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: { xs: 1.5, md: 4 },
              py: { xs: 2.5, md: 3.5 },
            }}
          >
            {TRUST_ITEMS.map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleOutlineIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography variant="body2" fontWeight={500} color="text.secondary">
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* How It Works */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Box sx={{ mb: { xs: 2.5, md: 4 }, textAlign: 'center' }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.1em', fontSize: '0.7rem' }}
            >
              Get started in minutes
            </Typography>
            <Typography
              variant="h3"
              sx={{
                mt: 1,
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '-0.025em',
              }}
            >
              How FinSphere Works
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {HOW_IT_WORKS.map(({ step, title, description }) => (
              <Grid item xs={12} md={4} key={step}>
                <Box
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#FFFDFB',
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: 'rgba(122, 62, 72, 0.08)',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      mb: 2,
                    }}
                  >
                    {step}
                  </Box>
                  <Typography variant="body1" fontWeight={600} mb={0.75}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    {description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Box sx={{ mb: { xs: 2.5, md: 4 }, textAlign: 'center' }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.1em', fontSize: '0.7rem' }}
            >
              Everything you need
            </Typography>
            <Typography
              variant="h3"
              sx={{
                mt: 1,
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '-0.025em',
              }}
            >
              Built for new investors
            </Typography>
          </Box>

          {/* Desktop grid */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {FEATURES.map(({ icon, title, description }) => (
                <Grid item xs={12} sm={6} key={title}>
                  <Box
                    sx={{
                      p: { xs: 2.5, md: 3.5 },
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: '#FFFDFB',
                      height: '100%',
                      transition: 'box-shadow 0.2s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgb(0 0 0 / 0.05)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'rgba(122, 62, 72, 0.08)',
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'primary.main',
                        mb: 2,
                      }}
                    >
                      {icon}
                    </Box>
                    <Typography variant="body1" fontWeight={600} mb={0.75}>
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                      {description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Mobile carousel */}
          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              gap: 2,
              pb: 1.5,
              mx: -2,
              pl: 2,
              pr: 2,
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              '&::after': { content: '""', flexShrink: 0, width: 1 },
            }}
          >
            {FEATURES.map(({ icon, title, description }) => (
              <Box
                key={title}
                sx={{
                  scrollSnapAlign: 'start',
                  flexShrink: 0,
                  width: '85%',
                }}
              >
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#FFFDFB',
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'rgba(122, 62, 72, 0.08)',
                      borderRadius: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                      mb: 2,
                    }}
                  >
                    {icon}
                  </Box>
                  <Typography variant="body1" fontWeight={600} mb={0.75}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    {description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Platform Overview */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Box sx={{ mb: { xs: 2.5, md: 4 }, textAlign: 'center' }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.1em', fontSize: '0.7rem' }}
            >
              See it in action
            </Typography>
            <Typography
              variant="h3"
              sx={{
                mt: 1,
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '-0.025em',
              }}
            >
              Platform Overview
            </Typography>
          </Box>

          {/* Desktop: 2x2 grid */}
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Grid container spacing={3}>
              {PRODUCT_PREVIEWS.map(({ title, description, preview }) => (
                <Grid item xs={12} sm={6} key={title}>
                  <ProductPreviewCard title={title} description={description} preview={preview} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Mobile: horizontal scroll-snap */}
          <Box
            sx={{
              display: { xs: 'flex', sm: 'none' },
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              gap: 2,
              pb: 1.5,
              mx: -2,
              pl: 2,
              pr: 2,
              // Hide scrollbar on mobile for cleaner look
              '&::-webkit-scrollbar': { display: 'none' },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              '&::after': { content: '""', flexShrink: 0, width: 1 },
            }}
          >
            {PRODUCT_PREVIEWS.map(({ title, description, preview }) => (
              <Box
                key={title}
                sx={{
                  scrollSnapAlign: 'start',
                  flexShrink: 0,
                  width: '85%',
                }}
              >
                <ProductPreviewCard title={title} description={description} preview={preview} />
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Security */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          <Box sx={{ mb: { xs: 2.5, md: 4 }, textAlign: 'center' }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.1em', fontSize: '0.7rem' }}
            >
              Built for learners
            </Typography>
            <Typography
              variant="h3"
              sx={{
                mt: 1,
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '-0.025em',
              }}
            >
              Why Choose FinSphere
            </Typography>
          </Box>

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {SECURITY_ITEMS.map(({ icon, title, description }) => (
              <Grid item xs={12} md={4} key={title}>
                <Box
                  sx={{
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: '#FFFDFB',
                    textAlign: 'center',
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      bgcolor: 'rgba(122, 62, 72, 0.08)',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {icon}
                  </Box>
                  <Typography variant="body1" fontWeight={600} mb={0.75}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
                    {description}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FAQ */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
          <Box sx={{ mb: { xs: 2.5, md: 4 }, textAlign: 'center' }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: '0.1em', fontSize: '0.7rem' }}
            >
              Common questions
            </Typography>
            <Typography
              variant="h3"
              sx={{
                mt: 1,
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '-0.025em',
              }}
            >
              Frequently Asked Questions
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {FAQ_ITEMS.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box sx={{ borderTop: '1px solid', borderColor: 'divider', bgcolor: '#FFFDFB' }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', py: { xs: 4, md: 6 } }}>
            <Typography
              variant="h3"
              sx={{ fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.025em', mb: 2 }}
            >
              Ready to start learning?
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3.5} lineHeight={1.7}>
              Join students building their investing foundation with FinSphere.
            </Typography>
            <Button
              component={Link}
              to={ROUTES.REGISTER}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 4 }}
            >
              Create free account
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          py: { xs: 3, md: 4 },
          px: { xs: 3, md: 4 },
        }}
      >
        <Container maxWidth="lg" disableGutters>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 18 }} />
              <Typography variant="body2" fontWeight={700}>
                FinSphere
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: { xs: 2, md: 3 }, flexWrap: 'wrap' }}>
              {FOOTER_LINKS.map(({ label, path, href }) =>
                href ? (
                  <Typography
                    key={label}
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="caption"
                    color="text.secondary"
                    sx={{ textDecoration: 'none', '&:hover': { color: 'text.primary' } }}
                  >
                    {label}
                  </Typography>
                ) : (
                  <Typography
                    key={label}
                    component={Link}
                    to={path}
                    variant="caption"
                    color="text.secondary"
                    sx={{ textDecoration: 'none', '&:hover': { color: 'text.primary' } }}
                  >
                    {label}
                  </Typography>
                )
              )}
            </Box>

            <Typography variant="caption" color="text.secondary">
              © FinSphere
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}


export default LandingPage;
