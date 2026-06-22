import { Link } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ROUTES } from '../utils/constants';


function NotFound() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: 8,
        }}
      >
        {/* Large ghost number */}
        <Typography
          sx={{
            fontSize: { xs: '6rem', md: '9rem' },
            fontWeight: 800,
            color: '#f1f5f9',
            letterSpacing: '-0.05em',
            lineHeight: 1,
            mb: 2,
            userSelect: 'none',
          }}
        >
          404
        </Typography>

        <Typography variant="h5" fontWeight={700} letterSpacing="-0.025em" mb={1}>
          Page not found
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          mb={4}
          sx={{ maxWidth: 340 }}
        >
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Typography>

        <Button
          component={Link}
          to={ROUTES.HOME}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          sx={{
            borderColor: '#e2e8f0',
            color: 'text.secondary',
            '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
          }}
        >
          Back to home
        </Button>
      </Box>
    </Container>
  );
}

export default NotFound;
