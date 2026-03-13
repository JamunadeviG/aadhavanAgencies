import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, logout } from '../services/authService.js';

/**
 * Exact User Navigation Component
 * Navigation exactly matching the reference image design
 */
export const ExactUserNavigation = ({ user }) => {
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
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="exact-user-navigation">
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
            <button 
              className={`category-link ${location.pathname === '/user-home' ? 'active' : ''}`}
              onClick={() => navigate('/user-home')}
            >
              Home
            </button>
            <button 
              className={`category-link ${location.pathname === '/products' ? 'active' : ''}`}
              onClick={() => navigate('/products')}
            >
              Products
            </button>
            <button 
              className={`category-link ${location.pathname === '/cart' ? 'active' : ''}`}
              onClick={() => navigate('/cart')}
            >
              Cart
            </button>
            <button 
              className={`category-link ${location.pathname === '/track-orders' ? 'active' : ''}`}
              onClick={() => navigate('/track-orders')}
            >
              Track Orders
            </button>
            <button 
              className={`category-link ${location.pathname === '/edit-profile' ? 'active' : ''}`}
              onClick={() => navigate('/edit-profile')}
            >
              My Account
            </button>
          </nav>
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
                className={`mobile-nav-link ${location.pathname === '/products' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/products');
                  setMobileMenuOpen(false);
                }}
              >
                Products
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
                Track Orders
              </button>
              <button
                className={`mobile-nav-link ${location.pathname === '/edit-profile' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/edit-profile');
                  setMobileMenuOpen(false);
                }}
              >
                My Account
              </button>
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

export default ExactUserNavigation;
