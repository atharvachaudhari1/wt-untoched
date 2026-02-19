import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, InputAdornment, IconButton, CircularProgress, Alert } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AuthLayout from '../../layouts/AuthLayout';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const roleConfig = {
  student:  { label: 'Student',        color: '#2196F3', hint: 'aarav.mehta@ecs.edu' },
  teacher:  { label: 'Teacher/Mentor', color: '#E91E63', hint: 'anita.sharma@ecs.edu' },
  parent:   { label: 'Parent',         color: '#4CAF50', hint: 'suresh.mehta@gmail.com' },
  admin:    { label: 'Admin',          color: '#7C4DFF', hint: 'admin@ecs.edu' },
};

export default function LoginPage({ role }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const config = roleConfig[role];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login({ email, password, role });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Box component={Link} to="/" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', fontSize: 13, mb: 2, '&:hover': { color: 'primary.main' } }}>
            <ArrowBackIcon fontSize="small" /> Back to role selection
          </Box>
          <Typography variant="h5" fontWeight={700}>
            {config.label} Login
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Sign in to access your portal
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            fullWidth
            placeholder={config.hint}
            InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" color="disabled" /></InputAdornment> }}
          />
          <TextField
            label="Password"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            fullWidth
            placeholder="password123"
            InputProps={{
              startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" color="disabled" /></InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
        </Button>

        <Box sx={{ mt: 2.5, p: 2, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" fontWeight={600} mb={0.5}>
            Demo Credentials
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Email: <strong>{config.hint}</strong> | Password: <strong>password123</strong>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
}
