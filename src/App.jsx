import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import About from './pages/About.jsx';
import Support from './pages/Support.jsx';
import UserHome from './pages/UserHome.jsx';
import AdminHome from './pages/AdminHome.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import AddOffer from './pages/AddOffer.jsx';
import TrackOrders from './pages/TrackOrders.jsx';
import Users from './pages/Users.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import Orders from './pages/Orders.jsx';
import Cart from './pages/Cart.jsx';
import UserTrackOrders from './pages/UserTrackOrders.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { isAuthenticated, getStoredUser } from './services/authService.js';
import './App.css';

function App() {
  const user = getStoredUser();

  return (
    <Router>
      <Routes>
        {/* Public home page - shown when no user is logged in */}
        <Route 
          path="/" 
          element={
            isAuthenticated() 
              ? <Navigate to={user?.role === 'admin' ? '/admin-home' : '/user-home'} replace />
              : <Home />
          } 
        />
        
        {/* User home page - protected route for logged-in users */}
        <Route
          path="/user-home"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserHome />
            </ProtectedRoute>
          }
        />
        
        {/* Admin home page - protected route for logged-in admins */}
        <Route
          path="/admin-home"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        
        {/* About page - public route */}
        <Route path="/about" element={<About />} />
        
        {/* Support page - public route */}
        <Route path="/support" element={<Support />} />
        
        {/* Public route - redirect to home page if already logged in */}
        <Route
          path="/login"
          element={
            isAuthenticated()
              ? <Navigate to={(getStoredUser()?.role === 'admin' ? '/admin-home' : '/user-home')} replace />
              : <Login />
          }
        />
        
        {/* Register page - public route - redirect to home page if already logged in */}
        <Route
          path="/register"
          element={
            isAuthenticated()
              ? <Navigate to={(getStoredUser()?.role === 'admin' ? '/admin-home' : '/user-home')} replace />
              : <Register />
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
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track-orders"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <UserTrackOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-track-orders"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <TrackOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute allowedRoles={['user', 'admin']}>
              <Support />
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
