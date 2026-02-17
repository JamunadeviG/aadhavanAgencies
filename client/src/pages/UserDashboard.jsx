import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, logout, fetchProfile } from '../services/authService.js';
import './UserDashboard.css';

const sideNavLinks = [
  { label: 'Dashboard', key: 'dashboard' },
  { label: 'Orders', key: 'orders' },
  { label: 'Place Order', key: 'order' },
  { label: 'Track Order', key: 'track' },
  { label: 'Support', key: 'support' }
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getStoredUser());
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const freshUser = await fetchProfile();
        if (freshUser) {
          setUser(freshUser);
        }
      } catch (err) {
        setError(err.message || 'Unable to load profile');
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!actionMessage) return undefined;
    const timer = setTimeout(() => setActionMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [actionMessage]);

  if (loadingProfile && !user) {
    return (
      <div className="user-dashboard">
        <div className="user-hero card">
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-dashboard">
        <div className="user-hero card">
          <p className="user-kicker">Profile unavailable</p>
          <p>Please log in again to view your store information.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const storeInfo = user.storeInfo || {};
  const fullAddress = [
    storeInfo.addressLine1,
    storeInfo.addressLine2,
    storeInfo.city,
    storeInfo.state,
    storeInfo.pincode
  ]
    .filter(Boolean)
    .join(', ');

  const infoItems = [
    { label: 'Store Name', value: storeInfo.storeName },
    { label: 'Store Type', value: storeInfo.storeType },
    { label: 'GST Number', value: storeInfo.gstNumber || 'Not provided' },
    { label: 'Contact Number', value: storeInfo.contactNumber || 'Not provided' },
    { label: 'Registered Email', value: user.email },
    { label: 'Retail ID', value: user.userId || 'Assigned automatically' }
  ];

  const quickActions = [
    {
      key: 'order',
      title: 'Place an Order',
      body: 'Send us your requirement list and we will confirm availability and pricing.',
      button: 'Start Order'
    },
    {
      key: 'track',
      title: 'Track an Order',
      body: 'View confirmations, dispatch status and delivery proof for your recent orders.',
      button: 'Track'
    },
    {
      key: 'edit',
      title: 'Edit Your Information',
      body: 'Keep your billing email, GST and delivery address up to date to avoid delays.',
      button: 'Update'
    }
  ];

  const handleAction = (type) => {
    const messages = {
      order: 'Order desk notified. A sales executive will reach you within 30 minutes.',
      track: 'Tracking dashboard coming soon. Our support team will share live status on WhatsApp.',
      edit: 'Profile update feature is in progress. Please call support to change store info for now.'
    };
    const action = quickActions.find((item) => item.key === type);
    setActionMessage({
      title: action?.title || 'Action selected',
      body: messages[type] || 'We will reach out shortly.'
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="user-dashboard">
      <header className="user-topbar">
        <div className="user-brand">
          <div className="user-logo">AA</div>
          <div>
            <p className="user-brand-name">Aadhavan Agencies</p>
            <span className="user-brand-sub">Retail Partner Center</span>
          </div>
        </div>
        <div className="user-topnav-wrapper">
          <nav className="user-quicknav" aria-label="Quick actions">
            {quickActions.map((action) => (
              <button key={action.key} className="btn" onClick={() => handleAction(action.key)}>
                {action.title}
              </button>
            ))}
          </nav>
        </div>
        <div className="user-top-actions">
          <button className="btn ghost" onClick={() => navigate('/')}>Storefront</button>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="user-shell">
        <aside className="user-sidebar card">
          <div className="user-card-profile">
            <div className="user-avatar">{(user.name || 'U').slice(0, 1).toUpperCase()}</div>
            <div>
              <p className="user-name">{user.name}</p>
              <span className="user-role">Retail Partner</span>
            </div>
          </div>
          <div className="user-side-menu">
            {sideNavLinks.map((link) => (
              <button key={link.key} className="user-side-link">
                {link.label}
              </button>
            ))}
          </div>
          <div className="user-side-note">Your store ID: {user.userId || '—'}</div>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </aside>

        <main className="user-main card">
          <div className="user-main-head">
            <div>
              <p className="user-kicker">Retail partner workspace</p>
              <h1>Welcome back, {user.name}</h1>
              <p className="user-tagline">Here is a snapshot of your store profile and quick actions.</p>
            </div>
          </div>

          {actionMessage && (
            <div className="user-action-toast card">
              <div>
                <p className="user-kicker">Action center</p>
                <h4>{actionMessage.title}</h4>
                <p>{actionMessage.body}</p>
              </div>
              <button className="btn" onClick={() => setActionMessage(null)}>
                Dismiss
              </button>
            </div>
          )}

          <section className="user-grid">
            <article className="user-card card">
              <div className="user-card-head">
                <div>
                  <p className="user-kicker">Registered Store</p>
                  <h2>{storeInfo.storeName || 'Store details'}</h2>
                </div>
                <span className="pill">ID: {user.userId || 'Auto'}</span>
              </div>
              <p className="user-address">{fullAddress || 'Address details will appear once provided.'}</p>
              {error && <div className="user-action-message">{error}</div>}
              <div className="user-info-grid">
                {infoItems.map((item) => (
                  <div key={item.label} className="user-info-item">
                    <p className="label">{item.label}</p>
                    <p className="value">{item.value || '—'}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
