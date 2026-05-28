import { Navigate, useLocation } from 'react-router-dom';
import { Box, Spinner, VStack, Text } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="gray.50">
        <VStack spacing={3}>
          <Spinner size="lg" color="purple.500" />
          <Text fontSize="sm" color="gray.600">Loading…</Text>
        </VStack>
      </Box>
    );
  }

  // Not logged in → go to department login
  if (!user) {
    const from = `${location.pathname}${location.search || ''}`;
    return <Navigate to="/department/login" state={{ from }} replace />;
  }

  // Non-admin trying to access an admin-only route
  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/department" />;
  }

  // All authenticated users (including admins) can access any non-adminOnly route
  return children;
};

export default ProtectedRoute;