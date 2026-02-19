import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RoleRoute = ({ allowedRoles, children }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user?.role || ''}`} replace />;
  }
  return children;
};

export default RoleRoute;
