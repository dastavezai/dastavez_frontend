import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  // Not logged in → go to department login
  if (!user) {
    return <Navigate to="/department/login" />;
  }

  // Non-admin trying to access an admin-only route
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/department" />;
  }

  // All authenticated users (including admins) can access any non-adminOnly route
  return children;
};

export default ProtectedRoute;