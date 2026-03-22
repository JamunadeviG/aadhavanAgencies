import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { logout, getStoredUser } from '../services/authService.js';

export default function UserNavbar() {

  // 🔹 Get dynamic user data (from login / backend)
  const currentUser = getStoredUser();
  const userName = currentUser?.name || currentUser?.username || 'User';
  const navigate = useNavigate();

  // 🔹 Active tab state
  const [active, setActive] = useState("Home");

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigation = (item) => {
    setActive(item);
    
    // Navigate based on the menu item
    switch(item) {
      case 'Home':
        navigate('/user-home');
        break;
      case 'Dashboard':
        navigate('/user-dashboard');
        break;
      case 'Track Orders':
        navigate('/track-orders');
        break;
      case 'Cart':
        navigate('/cart');
        break;
      case 'Edit Profile':
        navigate('/edit-profile');
        break;
      default:
        break;
    }
  };

  return (
    <>
      <style>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          background: linear-gradient(90deg, #0d3f2f, #0a2e22);
          color: white;
          font-family: Arial, sans-serif;
        }

        .left {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .logo {
          width: 55px;
          height: 55px;
          background: #b7e48b;
          color: #1b4332;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          font-size: 20px;
        }

        .title {
          font-size: 20px;
          font-weight: 600;
        }

        .subtitle {
          font-size: 13px;
          color: #c7f9cc;
        }

        .menu {
          display: flex;
          gap: 12px;
        }

        .menu-btn {
          padding: 8px 18px;
          border-radius: 25px;
          border: 1px solid rgba(255,255,255,0.3);
          background: transparent;
          color: white;
          cursor: pointer;
          font-size: 14px;
          transition: 0.3s;
        }

        .menu-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .active {
          background: #22c55e;
          border: none;
          color: #052e16;
          font-weight: 600;
        }

        .right {
          display: flex;
          align-items: center;
        }

        .logout {
          background: #ef4444;
          border: none;
          padding: 10px 20px;
          border-radius: 15px;
          color: white;
          font-weight: 500;
          cursor: pointer;
        }

        .logout:hover {
          background: #dc2626;
        }

        @media (max-width: 768px) {
          .navbar {
            flex-direction: column;
            padding: 15px 20px;
            gap: 15px;
          }

          .menu {
            flex-wrap: wrap;
            justify-content: center;
          }

          .menu-btn {
            font-size: 12px;
            padding: 6px 14px;
          }

          .logo {
            width: 45px;
            height: 45px;
            font-size: 18px;
          }

          .title {
            font-size: 18px;
          }

          .subtitle {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="navbar">

        {/* Left */}
        <div className="left">
          <div className="logo">AA</div>

          <div>
            <div className="title">Aadhavan Agencies</div>
            <div className="subtitle">Welcome, {userName}</div>
          </div>
        </div>

        {/* Center Menu */}
        <div className="menu">
          {["Home", "Dashboard", "Track Orders", "Cart", "Edit Profile"].map((item) => (
            <button
              key={item}
              className={`menu-btn ${active === item ? "active" : ""}`}
              onClick={() => handleNavigation(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="right">
          <button className="logout" onClick={handleLogout}>Logout</button>
        </div>

      </div>
    </>
  );
}
