import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import AddOffer from './pages/AddOffer.jsx';
import TrackOrders from './pages/TrackOrders.jsx';
import Users from './pages/Users.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { isAuthenticated, getStoredUser } from './services/authService.js';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home page - public route */}
        <Route path="/" element={<Home />} />
        
        {/* Public route - redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            isAuthenticated()
              ? <Navigate to={(getStoredUser()?.role === 'admin' ? '/dashboard' : '/user-dashboard')} replace />
              : <Login />
          }
        />
        
        {/* Protected routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-dashboard"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AddOffer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-orders"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TrackOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
