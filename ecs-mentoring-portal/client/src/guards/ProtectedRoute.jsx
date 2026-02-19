import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#FFF0F5' }}>
        <CircularProgress color="primary" size={48} />
      </Box>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
