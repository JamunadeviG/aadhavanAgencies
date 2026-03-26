import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { logout, getStoredUser } from '../services/authService.js';
import './AdminLayout.css';

const AdminLayout = ({ active, title, children }) => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const go = (path) => navigate(path);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data && res.data.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.log('Error fetching notifications count', err);
    }
  };

  const navLinks = [
    { label: 'Dashboard', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>, key: 'dashboard', path: '/dashboard' },
    { label: 'Products', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>, key: 'products', path: '/products' },
    { label: 'Price Approvals', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>, key: 'price-approvals', path: '/price-approvals' },
    { label: 'Manage Offers', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>, key: 'offers', path: '/offers' },
    { label: 'Track Order', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>, key: 'track-orders', path: '/admin-track-orders' },
    { label: 'Users & Customers', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>, key: 'users', path: '/users' }
  ];

  return (
    <div className={"admin-layout-wrapper " + (isSidebarCollapsed ? 'sidebar-collapsed' : '')}>
      {/* Dark Sidebar Navigation */}
      <aside className="admin-dark-sidebar">
        <div className="sidebar-top">
          <div className="admin-brand-zone" onClick={() => go('/dashboard')}>
            <div className="brand-logo-icon">AA</div>
            <div className="brand-text">
              <h2>Aadhavan</h2>
              <p>Control Center</p>
            </div>
          </div>
          <button className="collapse-toggle" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
            {isSidebarCollapsed ? '►' : '◀'}
          </button>
        </div>

        <nav className="sidebar-nav-menu">
          {navLinks.map((link) => (
            <div
              key={link.key}
              className={"nav-item-wrapper " + (active === link.key ? 'active-route-highlight' : '')}
              onClick={() => go(link.path)}
            >
              <div className="nav-icon-container">
                {link.icon}
                {/* Red Badge for Price Approvals */}
                {link.key === 'price-approvals' && unreadCount > 0 && (
                  <span className="nav-unread-badge pulsing-badge">{unreadCount}</span>
                )}
              </div>
              <span className="nav-label-text">{link.label}</span>

              {/* Tooltip on Hover when Collapsed */}
              <div className="nav-tooltip">{link.label}</div>

              {/* Active Route Highlight Animation */}
              {active === link.key && <div className="active-highlight-bar" />}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="nav-item-wrapper logout-wrapper" onClick={handleLogout}>
            <div className="nav-icon-container">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>
            <span className="nav-label-text">Logout</span>
            <div className="nav-tooltip">Logout</div>
          </div>
        </div>
      </aside>

      {/* Main Administrative Container */}
      <main className="admin-main-viewport">
        <header className="admin-top-header">
          <div className="header-breadcrumbs">
            <h1>{title}</h1>
          </div>
          <div className="header-actions">
            <div className="admin-profile-chip">
              <span className="admin-role-badge">Super Admin</span>
            </div>
          </div>
        </header>

        <div className="admin-viewport-content">
          <div className="admin-glass-panel">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
