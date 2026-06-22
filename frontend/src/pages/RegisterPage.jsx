import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import { ROUTES } from '../utils/constants';


function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Full name is required.';
    if (!formData.email.trim()) return 'Email address is required.';
    if (!formData.password) return 'Password is required.';
    if (formData.password.length < 6) return 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      const { user, token } = await authService.register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      login(user, token);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message ?? 'Registration failed. Please try again.');
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} letterSpacing="-0.025em" mb={0.5}>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Start with $100,000 in virtual capital
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
            label="Full name"
            name="name"
            autoComplete="name"
            autoFocus
            fullWidth
            value={formData.name}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <TextField
            label="Email address"
            name="email"
            type="email"
            autoComplete="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            disabled={isSubmitting}
            helperText="Minimum 6 characters"
          />
          <TextField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            fullWidth
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isSubmitting}
          sx={{ mt: 3, py: 1.25 }}
        >
          {isSubmitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Create account'
          )}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }}>
        <Typography variant="caption" color="text.secondary">
          or
        </Typography>
      </Divider>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          style={{ color: '#7A3E48', textDecoration: 'none', fontWeight: 500 }}
        >
          Sign in
        </Link>
      </Typography>
    </Paper>
  );
}

export default RegisterPage;
