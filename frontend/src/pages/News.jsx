import { Box, Container, Typography, Grid, Paper, Chip, Skeleton } from '@mui/material';
import NewspaperIcon from '@mui/icons-material/Newspaper';


const SKELETON_COUNT = 9;

function PlaceholderNewsCard() {
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
      {/* Thumbnail */}
      <Box sx={{ position: 'relative' }}>
        <Skeleton variant="rectangular" height={120} animation="wave" />
        <Chip
          label="Thumbnail"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            bgcolor: 'rgba(122, 62, 72, 0.08)',
            color: 'primary.main',
            fontWeight: 500,
            fontSize: '0.65rem',
            height: 18,
          }}
        />
      </Box>

      <Box sx={{ p: 2.5 }}>
        {/* Headline */}
        <Skeleton width="95%" height={18} animation="wave" />
        <Skeleton width="75%" height={18} sx={{ mt: 0.5 }} animation="wave" />

        {/* Source + Date */}
        <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'center' }}>
          <Skeleton width={60} height={14} animation="wave" sx={{ borderRadius: 1 }} />
          <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#cbd5e1', flexShrink: 0 }} />
          <Skeleton width={50} height={14} animation="wave" sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
    </Paper>
  );
}

function News() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <Box sx={{ textAlign: { xs: 'center', md: 'left' }, width: { xs: '100%', sm: 'auto' } }}>
          <Typography variant="h4" fontWeight={700} letterSpacing="-0.025em">
            Market News
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Stay updated with the latest financial headlines
          </Typography>
        </Box>
        <Chip
          label="In development"
          size="small"
          variant="outlined"
          sx={{ color: 'text.secondary', borderColor: '#e2e8f0', alignSelf: 'center' }}
        />
      </Box>

      <Grid container spacing={2}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <PlaceholderNewsCard />
          </Grid>
        ))}
      </Grid>

      <Box
        sx={{
          mt: 3,
          p: 2.5,
          borderRadius: 2,
          border: '1px dashed',
          borderColor: '#cbd5e1',
          textAlign: 'center',
        }}
      >
        <NewspaperIcon sx={{ fontSize: 28, color: '#cbd5e1', mb: 0.5 }} />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          News feed integration coming soon
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          Will connect to a financial news API with pagination and keyword filtering.
        </Typography>
      </Box>
    </Container>
  );
}


export default News;
