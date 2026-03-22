import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Enhanced Navigation Component
 * Multi-layered navigation that adapts to page types and user states
 * Based on the reference design with utility bar, main navigation, and user actions
 */
export const EnhancedNavigation = ({ 
  user = null, 
  pageType = 'public', // 'public', 'user', 'admin'
  showSearch = true,
  showCategoryNav = true 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Safe navigation function
  const safeNavigate = (path) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Navigation items based on page type
  const getNavigationItems = () => {
    const baseItems = [
      { label: 'Home', path: '/', active: location.pathname === '/' },
      { label: 'About', path: '/about', active: location.pathname === '/about' },
      { label: 'Support', path: '/support', active: location.pathname === '/support' },
    ];

    if (pageType === 'user') {
      return [
        ...baseItems,
        { label: 'Dashboard', path: '/user-dashboard', active: location.pathname === '/user-dashboard' },
        { label: 'Orders', path: '/orders', active: location.pathname === '/orders' },
        { label: 'Cart', path: '/cart', active: location.pathname === '/cart' },
      ];
    }

    if (pageType === 'admin') {
      return [
        ...baseItems,
        { label: 'Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
        { label: 'Users', path: '/users', active: location.pathname === '/users' },
        { label: 'Track Orders', path: '/admin-track-orders', active: location.pathname === '/admin-track-orders' },
      ];
    }

    return baseItems;
  };

  const navItems = getNavigationItems();

  return (
    <div className="enhanced-navigation">
      {/* Thin Black Bar */}
      <div className="thin-black-bar" style={{
        backgroundColor: '#000000',
        height: '3px',
        width: '100%'
      }}></div>
      
      {/* Main Navigation Bar */}
      <div className="main-nav-bar">
        <div className="container">
          <div className="nav-content">
            {/* Logo Section */}
            <div className="nav-brand" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }} onClick={() => safeNavigate('/')}>
              <div className="brand-logo" style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#2d5016',
                color: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '16px'
              }}>
                <span>AA</span>
              </div>
              <div className="brand-info" style={{
                display: 'flex',
                flexDirection: 'column'
              }}>
                <h1 className="brand-name" style={{
                  margin: '0',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#2d5016'
                }}>AADHAVAN AGENCIES</h1>
                <p className="brand-tagline" style={{
                  margin: '0',
                  fontSize: '12px',
                  color: '#666'
                }}>Fresh wholesale delivery</p>
              </div>
            </div>

            {/* Search Section */}
            {showSearch && (
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
                    Search
                  </button>
                </form>
              </div>
            )}

            {/* Delivery Info */}
            <div className="nav-delivery">
              <span className="delivery-text">24H Delivery Across TN districts</span>
            </div>

            {/* User Actions */}
            <div className="nav-actions">
              {user ? (
                <>
                  {pageType !== 'public' && (
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => safeNavigate(pageType === 'admin' ? '/dashboard' : '/user-dashboard')}
                    >
                      Dashboard
                    </button>
                  )}
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
                  <button 
                    className="btn btn-ghost"
                    onClick={() => safeNavigate('/')}
                  >
                    Home
                  </button>
                  <button 
                    className="btn btn-ghost"
                    onClick={() => safeNavigate('/about')}
                  >
                    About
                  </button>
                  <button 
                    className="btn btn-ghost"
                    onClick={() => safeNavigate('/support')}
                  >
                    Support
                  </button>
                </>
              ) : (
                <div className="auth-buttons">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate('/login')}
                  >
                    Login
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate('/register')}
                  >
                    Register
                  </button>
                </div>
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

      {/* Category Navigation */}
      {showCategoryNav && (
        <div className="category-nav">
          <div className="container">
            <div className="category-content">
              {/* Shop by Category button removed */}
              <nav className="category-links">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    className={`category-link ${item.active ? 'active' : ''}`}
                    onClick={() => safeNavigate(item.path)}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Search Bar (for logged-in users) */}
      {user && (
        <div className="secondary-search-bar">
          <div className="container">
            <div className="secondary-search-content">
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="secondary-search-input"
                />
              </div>
              <div className="user-info-mini">
                <span className="user-greeting">Hello,</span>
                <span className="user-display-name">{user.name}</span>
                <div className="user-avatar-small">
                  {getInitials(user.name)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
