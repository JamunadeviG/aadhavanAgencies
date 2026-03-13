import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, logout } from '../services/authService.js';

/**
 * Admin Style User Navigation Component
 * Exact copy of admin dashboard navbar but for user home
 */
export const AdminStyleUserNavigation = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const safeNavigate = (path) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // User-specific navigation items (same structure as admin)
  const navItems = [
    { label: 'Dashboard', path: '/user-dashboard', active: location.pathname === '/user-dashboard' },
    { label: 'Home', path: '/user-home', active: location.pathname === '/user-home' },
    { label: 'Products', path: '/products', active: location.pathname === '/products' },
    { label: 'Cart', path: '/cart', active: location.pathname === '/cart' },
    { label: 'Track Orders', path: '/track-orders', active: location.pathname === '/track-orders' },
    { label: 'My Account', path: '/edit-profile', active: location.pathname === '/edit-profile' },
  ];

  return (
    <div className="admin-navigation">
      {/* Main Navigation Bar */}
      <div className="nav-main">
        <div className="container">
          <div className="nav-content">
            {/* Brand */}
            <div className="nav-brand">
              <div className="brand-logo">
                <span>AA</span>
              </div>
              <span className="brand-name">AADHAVAN AGENCIES</span>
              <span className="user-badge">USER</span>
            </div>

            {/* Navigation Links */}
            <nav className="nav-links">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  className={`nav-link ${item.active ? 'active' : ''}`}
                  onClick={() => safeNavigate(item.path)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Actions */}
            <div className="nav-actions">
              {user && (
                <>
                  <div className="user-menu">
                    <div className="user-avatar">
                      {getInitials(user.name)}
                    </div>
                    <span className="user-name">{user.name}</span>
                  </div>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-brand">
                <div className="brand-logo">
                  <span>AA</span>
                </div>
                <span>AADHAVAN AGENCIES</span>
                <span className="user-badge">USER</span>
              </div>
              <button 
                className="mobile-menu-close"
                onClick={() => setMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>
            <nav className="mobile-nav-links">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  className={`mobile-nav-link ${item.active ? 'active' : ''}`}
                  onClick={() => {
                    safeNavigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
            {user && (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <div className="user-avatar">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="user-name">{user.name}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                </div>
                <button 
                  className="btn btn-danger btn-sm mobile-logout"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStyleUserNavigation;
