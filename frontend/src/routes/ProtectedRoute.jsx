import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';


// Guards every protected page. Shows a spinner while AuthContext is still
// validating the stored JWT (avoids a flash of the login redirect), then
// either sends unauthenticated users to /login — preserving where they were
// headed — or lets them through. Demo users get a real JWT now, so they're
// authenticated like anyone else; there's no separate demo bypass anymore.
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
    );
  }

  return children;
}


export default ProtectedRoute;
