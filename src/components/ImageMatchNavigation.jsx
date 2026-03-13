import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, logout } from '../services/authService.js';

/**
 * Image Match Navigation Component
 * Exact copy of the reference image design
 */
export const ImageMatchNavigation = ({ user }) => {
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

  return (
    <div className="image-match-navigation">
      <div className="navbar">
        <div className="navbar-container">
          {/* Left Side - Logo and Username */}
          <div className="navbar-left">
            <div className="logo-section">
              <div className="logo">
                <span className="logo-text">AA</span>
              </div>
              <span className="company-name">Aadhavan Agencies</span>
            </div>
            <div className="user-section">
              <span className="username">{user.name}</span>
            </div>
          </div>

          {/* Right Side - Navigation Links */}
          <div className="navbar-right">
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
                Cart
              </button>
              <button 
                className={`nav-link ${location.pathname === '/track-orders' ? 'active' : ''}`}
                onClick={() => navigate('/track-orders')}
              >
                Track Order
              </button>
              <button 
                className={`nav-link ${location.pathname === '/edit-profile' ? 'active' : ''}`}
                onClick={() => navigate('/edit-profile')}
              >
                Edit Information
              </button>
              <button 
                className="nav-link logout"
                onClick={handleLogout}
              >
                Logout
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={toggleMobileMenu}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-logo-section">
                <div className="logo">
                  <span className="logo-text">AA</span>
                </div>
                <span className="company-name">Aadhavan Agencies</span>
              </div>
              <button 
                className="mobile-menu-close"
                onClick={toggleMobileMenu}
              >
                ✕
              </button>
            </div>
            <div className="mobile-user-section">
              <span className="username">{user.name}</span>
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
                Cart
              </button>
              <button
                className={`mobile-nav-link ${location.pathname === '/track-orders' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/track-orders');
                  setMobileMenuOpen(false);
                }}
              >
                Track Order
              </button>
              <button
                className={`mobile-nav-link ${location.pathname === '/edit-profile' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/edit-profile');
                  setMobileMenuOpen(false);
                }}
              >
                Edit Information
              </button>
              <button
                className="mobile-nav-link logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageMatchNavigation;
