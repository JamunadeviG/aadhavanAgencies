import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Flex } from './Layout.jsx';

/**
 * Common Header Component
 * Standardized header for all pages with navigation
 */
export const CommonHeader = ({ 
  user = null, 
  showNavigation = true, 
  showUserMenu = true,
  title = 'Aadhavan Agencies',
  subtitle = 'Your Trusted Partner'
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <PageHeader>
      <Flex justify="between" align="center">
        {/* Brand Section */}
        <div className="brand-section">
          <Flex align="center" gap="3">
            <div className="brand-logo">
              <span className="logo-text">AA</span>
            </div>
            <div>
              <h1 className="brand-title">{title}</h1>
              <p className="brand-subtitle">{subtitle}</p>
            </div>
          </Flex>
        </div>

        {/* Navigation */}
        {showNavigation && (
          <nav className="main-navigation desktop-hidden">
            <Flex gap="2" align="center">
              <button 
                className="btn btn-ghost"
                onClick={() => navigate('/')}
              >
                Home
              </button>
              <button 
                className="btn btn-ghost"
                onClick={() => navigate('/about')}
              >
                About
              </button>
              <button 
                className="btn btn-ghost"
                onClick={() => navigate('/support')}
              >
                Support
              </button>
            </Flex>
          </nav>
        )}

        {/* User Section */}
        {showUserMenu && user && (
          <div className="user-section">
            <Flex align="center" gap="3">
              <div className="user-info">
                <p className="user-welcome">Welcome back,</p>
                <p className="user-name">{user.name || 'User'}</p>
              </div>
              <div className="user-avatar">
                {getInitials(user.name)}
              </div>
              <button 
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                Logout
              </button>
            </Flex>
          </div>
        )}

        {/* Login/Register buttons for non-authenticated users */}
        {showUserMenu && !user && (
          <div className="auth-buttons">
            <Flex gap="2" align="center">
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </Flex>
          </div>
        )}
      </Flex>
    </PageHeader>
  );
};

/**
 * Simple Header for public pages
 */
export const SimpleHeader = ({ 
  title = 'Aadhavan Agencies',
  showAuthButtons = true 
}) => {
  const navigate = useNavigate();

  return (
    <PageHeader>
      <Flex justify="between" align="center">
        <div className="brand">
          <Flex align="center" gap="3">
            <div className="brand-logo">
              <span className="logo-text">AA</span>
            </div>
            <div>
              <h1 className="brand-title">{title}</h1>
              <p className="brand-subtitle">Quality Service, Trusted Partner</p>
            </div>
          </Flex>
        </div>

        {showAuthButtons && (
          <div className="auth-buttons">
            <Flex gap="2" align="center">
              <button 
                className="btn btn-outline"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </Flex>
          </div>
        )}
      </Flex>
    </PageHeader>
  );
};
