import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, logout } from '../services/authService.js';

/**
 * Enhanced User Navigation Component
 * Multi-layered navigation for logged-in users matching the reference design
 */
export const EnhancedUserNavigation = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // User-specific navigation items
  const navItems = [
    { label: 'Dashboard', path: '/user-dashboard', active: location.pathname === '/user-dashboard' },
    { label: 'Home', path: '/user-home', active: location.pathname === '/user-home' },
    { label: 'Products', path: '/products', active: location.pathname === '/products' },
    { label: 'Cart', path: '/cart', active: location.pathname === '/cart' },
    { label: 'Track Orders', path: '/track-orders', active: location.pathname === '/track-orders' },
    { label: 'My Account', path: '/edit-profile', active: location.pathname === '/edit-profile' },
  ];

  return (
    <div className="enhanced-user-navigation">
      {/* Top Utility Bar */}
      <div className="nav-utility">
        <div className="container">
          <div className="utility-left">
            <select className="utility-select">
              <option>ENG</option>
              <option>TAM</option>
            </select>
            <select className="utility-select">
              <option>INR</option>
              <option>USD</option>
            </select>
          </div>
          <div className="utility-right">
            <span className="utility-contact">📞 +91 98765 43210</span>
            <button 
              className="utility-link"
              onClick={() => navigate('/edit-profile')}
            >
              My Account
            </button>
            <button 
              className="utility-link"
              onClick={() => navigate('/track-orders')}
            >
              Track Order
            </button>
            <button 
              className="utility-link"
              onClick={() => navigate('/cart')}
            >
              Favourites
            </button>
          </div>
        </div>
      </div>

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
            </div>

            {/* Search Bar */}
            <div className="nav-search">
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search entire store..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button type="submit" className="search-btn">
                  🔍
                </button>
              </form>
            </div>

            {/* User Actions */}
            <div className="nav-actions">
              <div className="user-menu">
                <div className="user-avatar">
                  {getInitials(user.name)}
                </div>
                <span className="user-name">{user.name}</span>
              </div>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/user-dashboard')}
              >
                Dashboard
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>

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

      {/* Category Navigation */}
      <div className="nav-category">
        <div className="container">
          <button className="category-btn">
            📦 Shop by Category
          </button>
          <nav className="category-links">
            {navItems.map((item) => (
              <button
                key={item.path}
                className={`category-link ${item.active ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Secondary Search Bar */}
      <div className="nav-secondary">
        <div className="container">
          <div className="secondary-content">
            <div className="user-greeting">
              <span className="greeting">Hello, {user.name}!</span>
            </div>
            <div className="secondary-search">
              <form onSubmit={handleSearch} className="secondary-search-form">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="secondary-search-input"
                />
                <button type="submit" className="secondary-search-btn">
                  🔍
                </button>
              </form>
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
                <span>AADHAVAN AGENCIES</span>
              </div>
              <button 
                className="mobile-menu-close"
                onClick={toggleMobileMenu}
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
                    navigate(item.path);
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

export default EnhancedUserNavigation;
