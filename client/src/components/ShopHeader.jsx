import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/authService.js';
import './ShopHeader.css';

const quickNav = [
  { label: 'Home', path: '/' },
  { label: 'Products', path: '/products' },
  { label: 'Summary', path: '/dashboard' },
  { label: 'Offers', path: '/' },
  { label: 'Support', path: '/' }
];

const ShopHeader = () => {
  const navigate = useNavigate();
  const authed = isAuthenticated();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shop-shell">
      <div className="utility-bar">
        <div className="container utility-inner">
          <div className="utility-left">
            <span className="utility-pill">ENG</span>
            <span className="utility-pill ghost">INR</span>
            <span className="utility-contact">Need help? +91 97909 48214</span>
          </div>
          <div className="utility-right">
            <button className="utility-link" onClick={() => navigate('/login')}>
              My Account
            </button>
            <button className="utility-link" onClick={() => navigate('/products')}>
              Track Order
            </button>
            <button className="utility-link" onClick={() => navigate('/')}>
              Favourites
            </button>
          </div>
        </div>
      </div>

      <header className="shop-head">
        <div className="container head-inner">
          <div className="brand" onClick={() => navigate('/')} role="button" tabIndex={0}>
            <div className="logo-mark" aria-hidden="true">
              <span>AA</span>
            </div>
            <div>
              <div className="brand-name">AADHAVAN AGENCIES</div>
              <div className="brand-sub">Fresh wholesale delivery</div>
            </div>
          </div>

          <div className="search-wrap">
            <div className="search-icon" aria-hidden="true">🔍</div>
            <input
              type="text"
              placeholder="Search entire store…"
              aria-label="Search products"
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate('/products');
              }}
            />
            <button className="btn btn-primary" onClick={() => navigate('/products')}>
              Search
            </button>
          </div>

          <div className="head-actions">
            <div className="badge-card">
              <span className="badge-title">24H Delivery</span>
              <span className="badge-sub">Across TN districts</span>
            </div>
            {authed ? (
              <>
                <button className="btn ghost" onClick={() => navigate('/dashboard')}>
                  Dashboard
                </button>
                <button className="btn btn-danger" onClick={onLogout}>
                  Logout
                </button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <nav className="category-nav" aria-label="Primary navigation">
        <div className="container category-inner">
          <button className="category-pill" onClick={() => navigate('/products')}>
            <span aria-hidden="true">☰</span>
            Shop by Category
          </button>
          <div className="nav-links">
            {quickNav.map((item) => (
              <button key={item.label} className="nav-link" onClick={() => navigate(item.path)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default ShopHeader;

