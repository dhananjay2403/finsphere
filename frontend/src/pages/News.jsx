import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Chip,
  Alert,
  Skeleton,
} from '@mui/material';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { timeAgo } from '../utils/helpers';
import stockService from '../services/stockService';


// Constants

const CATEGORIES = [
  { label: 'General', value: 'general' },
  { label: 'Forex', value: 'forex' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Mergers', value: 'merger' },
];

const SKELETON_COUNT = 9;


// Sub-components

/** Animated loading card */
function NewsCardSkeleton() {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'white',
      }}
    >
      <Skeleton variant="rectangular" height={120} animation="wave" />
      <Box sx={{ p: 2.5 }}>
        <Skeleton width="95%" height={18} animation="wave" />
        <Skeleton width="75%" height={18} sx={{ mt: 0.5 }} animation="wave" />
        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'center' }}>
          <Skeleton width={60} height={14} animation="wave" sx={{ borderRadius: 1 }} />
          <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#cbd5e1', flexShrink: 0 }} />
          <Skeleton width={50} height={14} animation="wave" sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
    </Paper>
  );
}

/** Live news card — clicking opens the article in a new tab */
function NewsCard({ article }) {
  const [imgFailed, setImgFailed] = useState(false);
  const hasImage = Boolean(article.image) && !imgFailed;
  const date = article.datetime
    ? timeAgo(new Date(article.datetime * 1000))
    : 'Recently';

  return (
    <Paper
      elevation={0}
      component="a"
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'white',
        textDecoration: 'none',
        cursor: 'pointer',
        height: '100%',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgb(0 0 0 / 0.08)',
          borderColor: 'rgba(122, 62, 72, 0.3)',
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          position: 'relative',
          height: 120,
          bgcolor: '#F8F4EF',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {hasImage ? (
          <Box
            component="img"
            src={article.image}
            alt={article.headline}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #F0E9E2 0%, #E8DED5 50%, #D4C5BA 100%)',
              gap: 0.75,
            }}
          >
            {/* Source initial monogram */}
            {article.source ? (
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  bgcolor: 'rgba(122, 62, 72, 0.15)',
                  border: '1.5px solid rgba(122, 62, 72, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#7A3E48',
                    lineHeight: 1,
                    userSelect: 'none',
                  }}
                >
                  {article.source.charAt(0).toUpperCase()}
                </Typography>
              </Box>
            ) : (
              <NewspaperIcon sx={{ fontSize: 28, color: 'rgba(122, 62, 72, 0.4)' }} />
            )}
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(122, 62, 72, 0.5)',
                fontSize: '0.6rem',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {article.source || 'News'}
            </Typography>
          </Box>
        )}

        {/* Source chip overlaid on the image */}
        {article.source && (
          <Chip
            label={article.source}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              bgcolor: 'rgba(255,255,255,0.92)',
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: '0.62rem',
              height: 18,
              backdropFilter: 'blur(4px)',
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box
        sx={{
          p: 2.5,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="body2"
            fontWeight={600}
            lineHeight={1.4}
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              color: 'text.primary',
              mb: 1,
            }}
          >
            {article.headline}
          </Typography>

          {article.summary && (
            <Typography
              variant="caption"
              color="text.secondary"
              lineHeight={1.4}
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {article.summary}
            </Typography>
          )}
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mt: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              {date}
            </Typography>
          </Box>
          <OpenInNewIcon sx={{ fontSize: 13, color: 'text.disabled', opacity: 0.5 }} />
        </Box>
      </Box>
    </Paper>
  );
}


// Main component

function News() {

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');


  const fetchNews = useCallback(async (category) => {
    setLoading(true);
    setError('');
    try {
      const data = await stockService.getMarketNews(category);
      setArticles(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not load news. Please try again.';
      setError(msg);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchNews(activeCategory);
  }, [activeCategory, fetchNews]);


  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      {/* Header — centered */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} letterSpacing="-0.025em">
          Market News
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Stay updated with the latest financial headlines
        </Typography>
        {!loading && articles.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Chip
              label={`${articles.length} articles`}
              size="small"
              sx={{
                bgcolor: 'rgba(122, 62, 72, 0.08)',
                color: 'primary.main',
                fontWeight: 600,
                fontSize: '0.72rem',
              }}
            />
          </Box>
        )}
      </Box>

      {/* Category filter — centered */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
        {CATEGORIES.map(({ label, value }) => (
          <Chip
            key={value}
            label={label}
            onClick={() => handleCategoryChange(value)}
            sx={{
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.78rem',
              height: 28,
              ...(activeCategory === value
                ? {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }
                : {
                  bgcolor: '#F8F4EF',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'rgba(122, 62, 72, 0.08)', color: 'primary.main' },
                }),
            }}
          />
        ))}
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}

      {/* News grid */}
      <Grid container spacing={2}>

        {/* Loading skeletons */}
        {loading &&
          Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <NewsCardSkeleton />
            </Grid>
          ))}

        {/* Live articles */}
        {!loading && !error && articles.length > 0 &&
          articles.map((article) => (
            <Grid item xs={12} sm={6} md={4} key={article.id ?? article.url}>
              <NewsCard article={article} />
            </Grid>
          ))}

        {/* Empty state */}
        {!loading && !error && articles.length === 0 && (
          <Grid item xs={12}>
            <Box
              sx={{
                mt: 2,
                p: 4,
                borderRadius: 2,
                border: '1px dashed',
                borderColor: '#cbd5e1',
                textAlign: 'center',
              }}
            >
              <NewspaperIcon sx={{ fontSize: 36, color: '#cbd5e1', mb: 1 }} />
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                No news available right now
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Try a different category or check back later.
              </Typography>
            </Box>
          </Grid>
        )}

      </Grid>

    </Container>
  );
}


export default News;
