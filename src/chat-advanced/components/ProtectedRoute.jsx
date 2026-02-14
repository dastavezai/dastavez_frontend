import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthBridge';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // If route is admin-only and user is not admin, redirect to admin dashboard
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/admin/dashboard" />;
  }

  // If user is admin and trying to access non-admin routes (like chat), redirect to admin dashboard
  if (!adminOnly && user.isAdmin) {
    return <Navigate to="/admin/dashboard" />;
  }

  return children;
};

export default ProtectedRoute; 