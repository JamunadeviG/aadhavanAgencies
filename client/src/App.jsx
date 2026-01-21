import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { isAuthenticated } from './services/authService.js';
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
            isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        
        {/* Protected routes - require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
