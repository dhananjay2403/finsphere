import { Outlet, Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { ROUTES } from '../utils/constants';


function AuthLayout() {

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F8F4EF',
      }}
    >
      <Box
        component="header"
        sx={{
          px: { xs: 3, md: 4 },
          py: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: '#FFFDFB',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Link
          to={ROUTES.HOME}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <TrendingUpIcon sx={{ color: 'primary.main', fontSize: 22 }} />
          <Typography variant="body1" fontWeight={700} color="text.primary" letterSpacing="-0.02em">
            FinSphere
          </Typography>
        </Link>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 6,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}


export default AuthLayout;
