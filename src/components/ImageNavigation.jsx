import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser, logout } from '../services/authService.js';

/**
 * New Navbar UI Component
 * Replaces the old ImageNavigation with the new design
 */
export const ImageNavigation = ({ user }) => {
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
    <>
      <style>{`
        .navbar{
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:15px 30px;
          background: linear-gradient(90deg,#0f3d2e,#0a2f23);
          color:white;
          font-family: Arial, sans-serif;
        }

        .left-section{
          display:flex;
          align-items:center;
          gap:15px;
        }

        .logo{
          width:45px;
          height:45px;
          background:#f59e0b;
          color:white;
          font-weight:bold;
          display:flex;
          align-items:center;
          justify-content:center;
          border-radius:10px;
          font-size:18px;
        }

        .title{
          font-size:16px;
          font-weight:600;
        }

        .username-display{
          font-size:18px;
          color:#ffffff;
          font-weight:700;
        }

        .menu{
          display:flex;
          gap:15px;
        }

        .menu-btn{
          background:rgba(255,255,255,0.08);
          border:1px solid rgba(255,255,255,0.2);
          padding:8px 18px;
          border-radius:20px;
          color:white;
          cursor:pointer;
          font-size:14px;
        }

        .menu-btn:hover{
          background:rgba(255,255,255,0.15);
        }

        .right-section{
          display:flex;
          gap:10px;
        }

        .logout-btn{
          background:#ef4444;
          border:none;
          padding:8px 16px;
          border-radius:20px;
          color:white;
          cursor:pointer;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            gap: 15px;
            padding: 15px 20px;
          }
          
          .left-section {
            width: 100%;
            justify-content: space-between;
          }
          
          .menu {
            flex-wrap: wrap;
            justify-content: center;
            gap: 10px;
          }
          
          .menu-btn {
            font-size: 12px;
            padding: 6px 12px;
          }
          
          .right-section {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div className="navbar">
        {/* Left Side */}
        <div className="left-section">
          <div className="logo">AA</div>
          <div>
            <div className="title">Aadhavan Agencies</div>
            <div className="username-display">{user?.name || 'Guest'}</div>
          </div>
        </div>

        {/* Center Menu */}
        <div className="menu">
          <button 
            className={`menu-btn ${location.pathname === '/user-home' ? 'active' : ''}`}
            onClick={() => navigate('/user-home')}
          >
            🏠 Home
          </button>
          <button 
            className={`menu-btn ${location.pathname === '/track-orders' ? 'active' : ''}`}
            onClick={() => navigate('/track-orders')}
          >
            📦 Track Orders
          </button>
          <button 
            className={`menu-btn ${location.pathname === '/edit-profile' ? 'active' : ''}`}
            onClick={() => navigate('/edit-profile')}
          >
            � Edit Profile
          </button>
          <button 
            className={`menu-btn ${location.pathname === '/cart' ? 'active' : ''}`}
            onClick={() => navigate('/cart')}
          >
            🛒 Cart
          </button>
        </div>

        {/* Right Side */}
        <div className="right-section">
          <button 
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default ImageNavigation;
