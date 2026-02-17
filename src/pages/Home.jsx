import { useNavigate } from 'react-router-dom';
import ShopHeader from '../components/ShopHeader.jsx';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <ShopHeader />

      <main className="home-main">
        <section className="hero">
          <div className="container hero-grid card">
            <div className="hero-copy">
              <div className="pill">Wholesale grocery partner since 1995</div>
              <h1>Aadhavan Agencies</h1>
              <p>Your trusted wholesale supply partner for quality groceries and essentials.</p>
            </div>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Sign in
              </button>
              <button className="btn ghost" onClick={() => navigate('/register')}>
                Create account
              </button>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container features-grid">
            <div className="feature-card card">
              <div className="feature-icon">🚚</div>
              <h3>Fast Delivery</h3>
              <p>Same-day delivery for orders placed before 12 PM</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">📦</div>
              <h3>Wide Selection</h3>
              <p>Over 1200+ SKUs across all grocery categories</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">💰</div>
              <h3>Competitive Pricing</h3>
              <p>Best wholesale prices in the region</p>
            </div>
            <div className="feature-card card">
              <div className="feature-icon">🏪</div>
              <h3>Quality Assured</h3>
              <p>Fresh products with quality guarantee</p>
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="container cta-card card">
            <div>
              <div className="kicker">Get Started</div>
              <h2>Ready to grow your business?</h2>
              <p>Join hundreds of retailers who trust Aadhavan Agencies for their wholesale needs.</p>
            </div>
            <div className="cta-actions">
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Sign in to Your Account
              </button>
              <button className="btn ghost" onClick={() => navigate('/register')}>
                Register Your Business
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">AA</div>
            <div>
              <p className="footer-name">Aadhavan Agencies</p>
              <p className="footer-tagline">Wholesale supply partner for modern retailers.</p>
            </div>
          </div>

          <div className="footer-links">
            <p className="footer-heading">Explore</p>
            <button className="footer-link" onClick={() => navigate('/')}>Home</button>
            <button className="footer-link" onClick={() => navigate('/products')}>Products</button>
            <button className="footer-link" onClick={() => navigate('/about')}>About</button>
            <button className="footer-link" onClick={() => navigate('/offers')}>Offers</button>
          </div>

          <div className="footer-contact">
            <p className="footer-heading">Get in touch</p>
            <ul>
              <li><strong>Customer Care:</strong> <span>+91 97909 48214</span></li>
              <li><strong>Email:</strong> <span>support@aadhavanagencies.com</span></li>
              <li><strong>HQ:</strong> <span>No. 35,Thalagiriyar Street, Thiruvannamalai, TamilNadu  – 606601 </span></li>
            </ul>
          </div>

          <div className="footer-hours">
            <p className="footer-heading">Office hours</p>
            <p>Mon - Sat: 6:00 AM - 8:00 PM</p>
            <p>Closed on public holidays.</p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Partner Login
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <span>© {new Date().getFullYear()} Aadhavan Agencies. All rights reserved.</span>
            <span>GST: 33AABCU9603R1Z5 • CIN: U15400TZ2010PTC033500</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
