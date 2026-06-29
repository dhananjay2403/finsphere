import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import { ROUTES } from '../utils/constants';


// ---------------------------------------------------------------------------
// Demo account credentials
// These are intentionally non-secret — the demo account is a shared account
// visible to all visitors. No personal data is ever stored on it.
// ---------------------------------------------------------------------------
const DEMO_EMAIL    = 'demo@finsphere.com';
const DEMO_PASSWORD = 'Demo@finsphere1';
const DEMO_NAME     = 'Demo User';


function LoginPage() {
  const [formData, setFormData]     = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  // Navigate back to the page the user originally requested,
  // or fall back to the dashboard.
  const redirectTo = location.state?.from?.pathname || ROUTES.DASHBOARD;

  // ---------------------------------------------------------------------------
  // Demo login
  // ---------------------------------------------------------------------------
  // Obtains a REAL JWT for the shared demo account so the demo user works
  // exactly like a normal user (live stock quotes, trading, watchlist, etc.)
  //
  // Flow:
  //   1. Try POST /api/auth/login with demo credentials
  //   2. If the account doesn't exist yet (409/404), auto-register it first
  //   3. Store the real JWT → navigate to the app
  //
  // The demo account is shared between all visitors. Its trades and watchlist
  // ARE saved in the database (intentional — makes the demo feel real).
  // Sessions persist for 7 days (JWT expiry) then require re-authentication.
  // ---------------------------------------------------------------------------
  const handleDemoLogin = async () => {
    setIsDemoLoading(true);
    setError('');

    try {
      // ── Step 1: wipe the shared demo account so this session starts clean ──
      // Deletes all prior trades, holdings, watchlist items and resets the
      // cash balance to $100,000.  Runs before login so the JWT we receive
      // reflects the freshly-reset account immediately.
      await authService.resetDemo();

      // ── Step 2: obtain a real JWT for the demo account ──
      let result;
      try {
        // Attempt direct login first (account already exists)
        result = await authService.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
      } catch (loginErr) {
        // 401 = wrong password (shouldn't happen), anything else = account missing
        // Attempt to register the demo account, then login
        if (loginErr.response?.status !== 401) {
          await authService.register({
            name:     DEMO_NAME,
            email:    DEMO_EMAIL,
            password: DEMO_PASSWORD,
          });
          result = await authService.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
        } else {
          throw loginErr;
        }
      }

      login(result.user, result.token);
      navigate(redirectTo, { replace: true });

    } catch (err) {
      setError('Demo access is temporarily unavailable. Please try again or create a free account.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Auto-trigger demo login when the URL contains ?demo=true
  // Useful for sharing a one-click demo link in portfolio READMEs.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true') {
      handleDemoLogin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { user, token } = await authService.login(formData);
      login(user, token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 400,
        p: { xs: 3, sm: 4 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: '#FFFDFB',
      }}
    >
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h5" fontWeight={700} letterSpacing="-0.025em" mb={0.5}>
          Welcome back
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sign in to your FinSphere account
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError('')}
          sx={{ mb: 2.5, fontSize: '0.85rem' }}
        >
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            autoFocus
            fullWidth
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting || isDemoLoading}
          />
          <TextField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting || isDemoLoading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <VisibilityOffIcon fontSize="small" />
                    ) : (
                      <VisibilityIcon fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isSubmitting || isDemoLoading}
          sx={{ mt: 3, py: 1.25 }}
        >
          {isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Sign in'
          )}
        </Button>
      </Box>

      <Button
        variant="outlined"
        color="primary"
        fullWidth
        size="large"
        onClick={handleDemoLogin}
        disabled={isDemoLoading || isSubmitting}
        sx={{ mt: 2, py: 1.25 }}
      >
        {isDemoLoading ? (
          <CircularProgress size={20} color="inherit" />
        ) : (
          'Explore Demo'
        )}
      </Button>
      <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{ mt: 1 }}>
        Preview FinSphere without creating an account.
      </Typography>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">
          or
        </Typography>
      </Divider>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Don&apos;t have an account?{' '}
        <Link
          to={ROUTES.REGISTER}
          style={{ color: '#7A3E48', textDecoration: 'none', fontWeight: 500 }}
        >
          Create one free
        </Link>
      </Typography>
    </Paper>
  );
}


export default LoginPage;
