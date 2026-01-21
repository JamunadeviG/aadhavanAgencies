import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService.js';

// Protected Route Component - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
