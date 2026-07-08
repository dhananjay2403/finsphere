import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Grid, Paper, Chip } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { DIFFICULTY_STYLES } from '../utils/constants';


const MODULES = [
  {
    title: 'Investing Basics',
    slug: 'investing-basics',
    description: 'What are stocks, bonds, and index funds? Understand the building blocks before you trade.',
    summary: 'Stocks, bonds, index funds — the essentials.',
    difficulty: 'Beginner',
    readingTime: '8 min',
    topics: ['Stocks vs bonds', 'How markets work', 'What is an index'],
  },
  {
    title: 'Understanding ETFs',
    slug: 'understanding-etfs',
    description: 'How exchange-traded funds work, why they are popular, and how to evaluate one.',
    summary: 'How ETFs work and which to pick.',
    difficulty: 'Beginner',
    readingTime: '7 min',
    topics: ['ETF structure', 'Expense ratios', 'Index vs active'],
  },
  {
    title: 'Stocks vs Bonds',
    slug: 'stocks-vs-bonds',
    description: 'Compare the two most important asset classes — understand risk, returns, and when to use each.',
    summary: 'Compare risk, returns, and stability.',
    difficulty: 'Beginner',
    readingTime: '6 min',
    topics: ['Ownership vs lending', 'Risk comparison', 'Portfolio balance'],
  },
  {
    title: 'Power of Compounding',
    slug: 'power-of-compounding',
    description: 'How your money earns money on its own — the snowball effect that builds wealth over time.',
    summary: 'How money grows on its own over time.',
    difficulty: 'Beginner',
    readingTime: '7 min',
    topics: ['Rule of 72', 'Start early', 'Snowball effect'],
  },
  {
    title: 'Diversification',
    slug: 'diversification',
    description: 'Diversification is the single most powerful risk-reduction strategy available to every investor — and it\'s completely free.',
    summary: 'Spread risk across assets and geographies.',
    difficulty: 'Intermediate',
    readingTime: '8 min',
    topics: ['Asset classes', 'Correlation', 'Portfolio mix'],
  },
  {
    title: 'Risk Management',
    slug: 'risk-management',
    description: 'Diversification, volatility, position sizing, and how to protect a portfolio.',
    summary: 'Diversify, size positions, manage volatility.',
    difficulty: 'Intermediate',
    readingTime: '9 min',
    topics: ['Diversification', 'Stop-loss logic', 'Portfolio beta'],
  },
  {
    title: 'Technical Analysis',
    slug: 'technical-analysis',
    description: 'Reading price charts, identifying trends, and using indicators like RSI and MACD.',
    summary: 'Charts, trends, and trading indicators.',
    difficulty: 'Intermediate',
    readingTime: '10 min',
    topics: ['Candlestick charts', 'Support & resistance', 'Moving averages'],
  },
  {
    title: 'Market Psychology',
    slug: 'market-psychology',
    description: 'Markets are driven by human emotions — fear and greed. Understanding the emotional cycle helps you make rational decisions.',
    summary: 'Master your emotions in investing.',
    difficulty: 'Intermediate',
    readingTime: '9 min',
    topics: ['Fear & Greed', 'Behavioral biases', 'Emotion cycle'],
  },
  {
    title: 'Fundamental Analysis',
    slug: 'fundamental-analysis',
    description: 'Evaluating companies using financial statements, ratios, and earnings quality.',
    summary: 'Evaluate companies by their financials.',
    difficulty: 'Advanced',
    readingTime: '11 min',
    topics: ['P/E ratio', 'Revenue & margins', 'DCF basics'],
  },
  {
    title: 'Portfolio Construction',
    slug: 'portfolio-construction',
    description: 'Building a portfolio is more than picking good stocks. It\'s about creating a structured mix of assets that aligns with your goals.',
    summary: 'Build and rebalance your portfolio.',
    difficulty: 'Advanced',
    readingTime: '10 min',
    topics: ['Core-Satellite', 'Rebalancing', 'Tax efficiency'],
  },
  {
    title: 'Global Investing',
    slug: 'global-investing',
    description: 'Participate in growth happening anywhere on Earth, while further reducing your portfolio risk by investing globally.',
    summary: 'Invest in international markets and gold.',
    difficulty: 'Advanced',
    readingTime: '9 min',
    topics: ['US Stocks', 'Currency risk', 'Sovereign Gold Bonds'],
  },
  {
    title: 'Cryptocurrency Basics',
    slug: 'cryptocurrency-basics',
    description: 'Understand what cryptocurrency is, how blockchain works, and the real risks — without the hype or fear.',
    summary: 'Understand crypto, blockchain, and risks.',
    difficulty: 'Advanced',
    readingTime: '10 min',
    topics: ['Blockchain', 'Bitcoin & Ethereum', 'Regulatory risk'],
  },
];

const FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

// Desktop card
function ModuleCard({ title, slug, description, difficulty, topics }) {
  const badgeStyle = DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.Beginner;

  return (
    <Paper
      component={Link}
      to={`/learn/${slug}`}
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
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 12px rgb(0 0 0 / 0.05)',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'rgba(122, 62, 72, 0.08)',
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SchoolIcon sx={{ fontSize: 18, color: 'primary.main' }} />
        </Box>
      </Box>

      <Typography variant="body1" fontWeight={600} mb={0.75}>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" lineHeight={1.7} mb={2} sx={{ flex: 1 }}>
        {description}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2.5 }}>
        {topics.map((t) => (
          <Chip
            key={t}
            label={t}
            size="small"
            sx={{ bgcolor: '#f8fafc', color: 'text.secondary', fontSize: '0.7rem', height: 20 }}
          />
        ))}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Chip
          label={difficulty}
          size="small"
          sx={{ ...badgeStyle, fontWeight: 500, fontSize: '0.7rem' }}
        />
        <Chip
          label="Start learning →"
          size="small"
          sx={{
            bgcolor: 'rgba(122, 62, 72, 0.08)',
            color: 'primary.main',
            fontWeight: 500,
            fontSize: '0.7rem',
          }}
        />
      </Box>
    </Paper>
  );
}

// Mobile card (compact)
function MobileModuleCard({ title, slug, summary, difficulty }) {
  const badgeStyle = DIFFICULTY_STYLES[difficulty] ?? DIFFICULTY_STYLES.Beginner;

  return (
    <Paper
      component={Link}
      to={`/learn/${slug}`}
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'white',
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'border-color 0.15s ease',
        '&:active': { borderColor: 'primary.main' },
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          bgcolor: 'rgba(122, 62, 72, 0.08)',
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <SchoolIcon sx={{ fontSize: 16, color: 'primary.main' }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {title}
          </Typography>
          <Chip
            label={difficulty}
            size="small"
            sx={{ ...badgeStyle, fontWeight: 500, fontSize: '0.6rem', height: 18 }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
          {summary}
        </Typography>
      </Box>

      <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
    </Paper>
  );
}

function LearningHub() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredModules = activeFilter === 'All'
    ? MODULES
    : MODULES.filter((m) => m.difficulty === activeFilter);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {/* Title — centered */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.025em">
          Learning Hub
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Build your investing knowledge from fundamentals to advanced strategy
        </Typography>
      </Box>

      {/* Filters — centered */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={f}
            size="small"
            clickable
            onClick={() => setActiveFilter(f)}
            sx={{
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 28,
              ...(activeFilter === f
                ? { bgcolor: 'primary.main', color: '#fff', '&:hover': { bgcolor: 'primary.dark' } }
                : { bgcolor: 'rgba(122, 62, 72, 0.08)', color: 'primary.main', '&:hover': { bgcolor: 'rgba(122, 62, 72, 0.14)' } }
              ),
            }}
          />
        ))}
      </Box>

      {/* Desktop grid — preserved */}
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Grid container spacing={2}>
          {filteredModules.map((module) => (
            <Grid item xs={12} sm={6} md={4} key={module.title}>
              <ModuleCard {...module} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Mobile — vertical stacked compact cards */}
      <Box sx={{ display: { xs: 'flex', sm: 'none' }, flexDirection: 'column', gap: 1.5 }}>
        {filteredModules.map((module) => (
          <MobileModuleCard key={module.title} {...module} />
        ))}
      </Box>

      {/* Empty state */}
      {filteredModules.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <SchoolIcon sx={{ fontSize: 40, color: '#e2e8f0', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            No lessons match this filter
          </Typography>
        </Box>
      )}
    </Container>
  );
}


export default LearningHub;
