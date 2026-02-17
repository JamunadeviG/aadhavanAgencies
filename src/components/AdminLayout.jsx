import { useNavigate } from 'react-router-dom';
import { logout, getStoredUser } from '../services/authService.js';
import { getOffers } from '../utils/offerStorage.js';
import './AdminLayout.css';

const AdminLayout = ({ active, title, children }) => {
  const navigate = useNavigate();
  const user = getStoredUser();

  const go = (path) => navigate(path);

  const handleEdit = (offer) => {
    navigate('/add-offer', { state: { editingOffer: offer } });
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm('Delete this offer?');
    if (!confirmed) return;
    const updated = deleteOffer(id);
    setOffers(updated);
    if (editingId === id) {
      setEditingId(null);
      setForm({ title: '', description: '', discount: '', validTill: '', productName: '' });
    }
    setToast('Offer removed');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Simple reusable layout for all admin pages.
  // Keeps UI consistent and easier to scale later.
  const navLinks = [
    { label: 'Dashboard', key: 'dashboard', path: '/dashboard' },
    { label: 'Products', key: 'products', path: '/products' },
    { label: 'Track Order', key: 'track', path: '/track-orders' },
    { label: 'Users & Customers', key: 'users', path: '/users' }
  ];

  return (
    <div className="admin-page">
      <header className="admin-shell">
        <div className="admin-shell-inner">
          <div className="admin-brand" role="button" tabIndex={0} onClick={() => go('/dashboard')}>
            <div className="admin-logo">AA</div>
            <div>
              <div className="admin-brand-name">Aadhavan Agencies</div>
              <div className="admin-brand-sub">Wholesale Control Center</div>
            </div>
          </div>

          <nav className="admin-nav" aria-label="Admin navigation">
            {navLinks.map((link) => (
              <button
                key={link.key}
                className={`admin-nav-link ${active === link.key ? 'active' : ''}`}
                onClick={() => go(link.path)}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="admin-shell-actions">
            <button className="btn ghost" onClick={() => go('/')}>Storefront</button>
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="container admin-wrap">
        <aside className="admin-side card">
          <div className="admin-user">
            <div className="admin-avatar">{(user?.name || 'A').slice(0, 1).toUpperCase()}</div>
            <div>
              <div className="admin-user-name">{user?.name || 'Admin'}</div>
              <div className="admin-user-role">Administrator</div>
            </div>
          </div>

          <div className="admin-menu">
            {navLinks.map((link) => (
              <button
                key={link.key}
                className={`admin-link ${active === link.key ? 'active' : ''}`}
                onClick={() => go(link.path)}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="admin-note">
            Tip: Keep stock updated daily to avoid stockouts.
          </div>

          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </aside>

        <main className="admin-main card">
          <div className="admin-main-head">
            <div>
              <div className="admin-main-kicker">Admin workspace</div>
              <h1>{title}</h1>
            </div>
          </div>
          <div className="admin-main-body">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

