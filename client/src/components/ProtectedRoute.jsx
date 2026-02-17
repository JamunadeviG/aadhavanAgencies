import { Navigate } from 'react-router-dom';
import { isAuthenticated, getStoredUser } from '../services/authService.js';

// Protected Route Component - redirects to login if not authenticated
// Optionally enforces role-based access via allowedRoles
const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const user = getStoredUser();
    if (!user || !allowedRoles.includes(user.role)) {
      const fallback = user?.role === 'admin' ? '/dashboard' : '/user-dashboard';
      return <Navigate to={fallback} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
