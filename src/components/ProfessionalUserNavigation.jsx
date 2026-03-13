import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, logout } from '../services/authService.js';

/**
 * Professional User Navigation Component
 * Clean navbar with username, logo, and essential components only
 */
export const ProfessionalUserNavigation = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="professional-user-navigation">
      {/* Top Navigation Bar */}
      <div className="nav-header">
        <div className="container">
          <div className="nav-content">
            {/* Company Logo */}
            <div className="nav-brand">
              <div className="brand-logo">
                <span>AA</span>
              </div>
              <span className="brand-name">Aadhavan Agencies</span>
            </div>

            {/* Navigation Components */}
            <div className="nav-components">
              <div className="user-info">
                <div className="user-avatar">
                  {getInitials(user.name)}
                </div>
                <span className="user-name">{user.name}</span>
              </div>

              <nav className="nav-links">
                <button 
                  className={`nav-link ${location.pathname === '/user-home' ? 'active' : ''}`}
                  onClick={() => navigate('/user-home')}
                >
                  Home
                </button>
                <button 
                  className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
                  onClick={() => navigate('/cart')}
                >
                  🛒 Cart
                </button>
                <button 
                  className={`nav-link ${location.pathname === '/track-orders' ? 'active' : ''}`}
                  onClick={() => navigate('/track-orders')}
                >
                  📦 Track Order
                </button>
                <button 
                  className={`nav-link ${location.pathname === '/edit-profile' ? 'active' : ''}`}
                  onClick={() => navigate('/edit-profile')}
                >
                  ✏️ Edit Information
                </button>
                <button 
                  className="nav-link logout-link"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </nav>

              {/* Mobile Menu Toggle */}
              <button 
                className="mobile-menu-toggle"
                onClick={toggleMobileMenu}
              >
                ☰
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMobileMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-brand">
                <div className="brand-logo">
                  <span>AA</span>
                </div>
                <span>Aadhavan Agencies</span>
              </div>
              <button 
                className="mobile-menu-close"
                onClick={toggleMobileMenu}
              >
                ✕
              </button>
            </div>
            <div className="mobile-user-info">
              <div className="user-avatar">
                {getInitials(user.name)}
              </div>
              <span className="user-name">{user.name}</span>
            </div>
            <nav className="mobile-nav-links">
              <button
                className={`mobile-nav-link ${location.pathname === '/user-home' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/user-home');
                  setMobileMenuOpen(false);
                }}
              >
                Home
              </button>
              <button
                className={`mobile-nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/cart');
                  setMobileMenuOpen(false);
                }}
              >
                🛒 Cart
              </button>
              <button
                className={`mobile-nav-link ${location.pathname === '/track-orders' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/track-orders');
                  setMobileMenuOpen(false);
                }}
              >
                📦 Track Order
              </button>
              <button
                className={`mobile-nav-link ${location.pathname === '/edit-profile' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/edit-profile');
                  setMobileMenuOpen(false);
                }}
              >
                ✏️ Edit Information
              </button>
              <button
                className="mobile-nav-link mobile-logout-link"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalUserNavigation;
