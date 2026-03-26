import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Enhanced Navigation Component
 * Multi-layered navigation that adapts to page types and user states
 * Based on the reference design with utility bar, main navigation, and user actions
 */
export const EnhancedNavigation = ({
  user = null,
  pageType = 'public',
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
      navigate(`/user-products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const getNavigationItems = () => {
    const baseItems = [
      { label: 'Home', path: '/', active: location.pathname === '/' || location.pathname === '/user-home' },
      { label: 'About', path: '/about', active: location.pathname === '/about' },
      { label: 'Support', path: '/support', active: location.pathname === '/support' },
    ];

    if (pageType === 'user' || (user && user.role !== 'admin')) {
      return [
        { label: 'All Products', path: '/user-products', active: location.pathname === '/user-products' },
        { label: 'Dashboard', path: '/user-dashboard', active: location.pathname === '/user-dashboard' },
        { label: 'Track Orders', path: '/track-orders', active: location.pathname === '/track-orders' },
        { label: 'Cart', path: '/cart', active: location.pathname === '/cart' },
      ];
    }

    if (pageType === 'admin' || (user && user.role === 'admin')) {
      return [
        { label: 'Admin Dashboard', path: '/dashboard', active: location.pathname === '/dashboard' },
        { label: 'Inventory', path: '/products', active: location.pathname === '/products' },
        { label: 'Orders', path: '/orders', active: location.pathname === '/orders' },
      ];
    }

    return baseItems;
  };

  const navItems = getNavigationItems();

  return (
    <div className="enhanced-navigation">
      <style>{`
        .enhanced-navigation {
          width: 100%;
          z-index: 1100;
          background: white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .top-utility-bar {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 6px 0;
          font-size: 13px;
          color: #64748b;
        }

        .main-nav-bar {
          background: white;
          padding: 8px 0;
        }

        .nav-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          height: 48px;
        }

        .brand-logo-container {
          width: 48px;
          height: 48px;
          background: #22c55e;
          color: #ffffff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 20px;
          box-shadow: 0 4px 12px rgba(26, 60, 46, 0.2);
        }

        .brand-name {
          font-size: 22px;
          font-weight: 800;
          color: #22c55e;
          letter-spacing: -0.02em;
          line-height: 1;
        }

        .brand-tagline {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .search-form {
          display: flex;
          align-items: stretch;
          width: 100%;
          max-width: 500px;
          height: 42px;
          border: 1px solid #e2e8f0;
          border-radius: 30px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .search-form:focus-within {
          border-color: #22c55e;
        }

        .search-input {
          flex: 1;
          border: none;
          padding: 0 20px;
          font-size: 14px;
          outline: none;
          background: #f8fafc;
          height: 100%;
        }

        .search-btn {
          background: #22c55e;
          color: white;
          border: none;
          padding: 0 24px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-btn:hover {
          background: #16a34a;
        }

        .delivery-pill {
          background: #f0fdf4;
          color: #166534;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid #dcfce7;
        }

        .category-nav {
          background: #0f172a; /* Slate 900 */
          padding: 12px 0;
        }

        .category-links {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
        }

        .category-link {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 600;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 8px;
        }

        .category-link:hover {
          color: white;
          background: rgba(255,255,255,0.05);
        }

        .category-link.active {
          color: white;
          background: #22c55e;
          color: #052e16;
        }

        .auth-btns {
          display: flex;
          gap: 10px;
        }

        .nav-btn-outline {
          border: 1px solid #22c55e;
          color: #22c55e;
          background: transparent;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-btn-solid {
          background: #22c55e;
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .user-info-chip {
           display: flex;
           align-items: center;
           gap: 10px;
           background: #f1f5f9;
           padding: 6px 12px;
           border-radius: 30px;
           cursor: pointer;
        }

        .user-avatar-circle {
          width: 30px;
          height: 30px;
          background: #1a3c2e;
          color: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 800;
        }

        @media (max-width: 1024px) {
          .nav-delivery, .delivery-pill { display: none; }
          .search-form { max-width: 300px; }
        }

        @media (max-width: 768px) {
           .main-nav-bar { padding: 15px 0; }
           .nav-search { display: none; }
           .category-nav { display: none; }
        }
      `}</style>

      <div className="top-utility-bar">
        <div className="container">
          <div className="flex justify-between items-center">
            <span>Call us: +91 97901 78213</span>
            <span>Thiruvannamalai, TamilNadu</span>
          </div>
        </div>
      </div>

      <div className="main-nav-bar">
        <div className="container">
          <div className="nav-content">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => safeNavigate('/')}>
              <div className="brand-logo-container">AA</div>
              <div>
                <div className="brand-name">AADHAVAN AGENCIES</div>
                <div className="brand-tagline">Premium Wholesale Grocery</div>
              </div>
            </div>

            {showSearch && (
              <form onSubmit={handleSearch} className="search-form">
                <input
                  type="text"
                  placeholder="Search entire store..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-btn">Search</button>
              </form>
            )}

            <div className="nav-delivery">
              <div className="delivery-pill">24H Delivery TVN District</div>
            </div>

            <div className="nav-actions">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="user-info-chip" onClick={() => safeNavigate(user.role === 'admin' ? '/dashboard' : '/user-dashboard')}>
                    <div className="user-avatar-circle">{getInitials(user.name)}</div>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{user.name}</span>
                  </div>
                  <button className="nav-btn-outline" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={handleLogout}>Logout</button>
                </div>
              ) : (
                <div className="auth-btns">
                  <button className="nav-btn-outline" onClick={() => navigate('/login')}>Login</button>
                  <button className="nav-btn-solid" onClick={() => navigate('/register')}>Register</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCategoryNav && (
        <div className="category-nav">
          <div className="container">
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
      )}
    </div>
  );
};
