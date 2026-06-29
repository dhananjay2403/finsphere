import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../utils/constants';


/**
 * Route guard for all protected pages.
 *
 * Behaviour:
 *  - While AuthContext is validating the stored JWT, shows a centred spinner
 *    so the user doesn't see an incorrect /login redirect.
 *  - If the JWT is invalid/missing, redirects to /login with state={{ from }}
 *    so the user lands back on the originally requested page after logging in.
 *  - Authenticated users (including demo users, who now obtain a real JWT)
 *    pass through to their destination.
 *
 * Note: DEMO_MODE bypass has been removed. The "Explore Demo" flow in
 * LoginPage now obtains a real JWT for the shared demo account, so demo users
 * are fully authenticated and no special guard bypass is needed.
 */
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
