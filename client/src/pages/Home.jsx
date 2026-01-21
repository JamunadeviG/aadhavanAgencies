import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../services/authService.js';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <h1 className="company-name">🛒 AADHAVAN AGENCIES</h1>
          <p className="company-tagline">Quality Products | Trusted Wholesale Partner</p>
        </div>
        <nav className="header-nav">
          {isLoggedIn ? (
            <button onClick={() => navigate('/dashboard')} className="nav-btn">
              Dashboard
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="nav-btn">
              Admin Login
            </button>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Simplify Your Wholesale Grocery Business</h2>
          <p className="hero-description">
            Complete ERP solution for wholesale grocery management. Track inventory, manage products, 
            and grow your business with our easy-to-use system designed for wholesale dealers.
          </p>
          <button onClick={handleGetStarted} className="cta-button">
            {isLoggedIn ? 'Go to Dashboard' : 'Get Started'}
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h3>Why Choose Our ERP System?</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🍚</div>
            <h4>Product Management</h4>
            <p>Manage rice, dal, spices, oil, and all grocery items. Track categories, units (kg, liter, packet), pricing, and stock levels efficiently.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h4>Real-time Stock Tracking</h4>
            <p>Monitor stock levels in real-time. Prevent stockouts and optimize warehouse operations. Know exactly what you have.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h4>Secure & Trusted</h4>
            <p>Your business data is safe with enterprise-grade security. Role-based access ensures only authorized users can access.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h4>Business Analytics</h4>
            <p>Get instant insights with comprehensive dashboards. Track total products, stock quantities, and business performance.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h4>Fast & Scalable</h4>
            <p>Grows with your business. From small shops to large wholesale distributors - handles everything smoothly.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h4>Easy to Use</h4>
            <p>Simple interface designed for everyone. No technical knowledge needed. Start managing your business in minutes.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <h3>About AADHAVAN AGENCIES</h3>
          <div className="about-text">
            <p>
              <strong>AADHAVAN AGENCIES</strong> is a trusted wholesale grocery distributor based in Thiruvannamalai, Tamil Nadu. 
              We specialize in providing high-quality products including rice, dal, spices, cooking oils, pulses, 
              and all essential grocery items to retailers, restaurants, hotels, and institutions.
            </p>
            <p>
              Our commitment to quality, competitive pricing, and reliable service has made us a trusted partner 
              for businesses of all sizes. We understand the unique challenges of managing wholesale grocery operations, 
              which is why we've developed this ERP system to help streamline your business processes and grow your profits.
            </p>
            <p style={{fontStyle: 'italic', color: '#d97706'}}>
              "Quality Products, Fair Prices, Trusted Service"
            </p>
          </div>
          <div className="company-stats">
            <div className="stat-item">
              <div className="stat-number">15+</div>
              <div className="stat-label">Years Experience</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Products Catalog</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Happy Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h3>Get in Touch</h3>
        <div className="contact-info">
          <div className="contact-item">
            <strong>📍 Address:</strong>
            <p>
              No. 35, Thalagiriyar Street,<br />
              Thiruvannamalai, Tamil Nadu - 606601<br />
              India
            </p>
          </div>
          <div className="contact-item">
            <strong>📞 Cell:</strong>
            <p>
              97909 48214
            </p>
          </div>
          <div className="contact-item">
            <strong>🕒 Business Hours:</strong>
            <p>
              Monday - Saturday: 8:00 AM - 8:00 PM<br />
              Sunday: 9:00 AM - 6:00 PM
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <p>&copy; 2024 AADHAVAN AGENCIES. All rights reserved.</p>
        <p>Quality Service | Trusted Partner</p>
        <p>Powered by Modern ERP Technology</p>
      </footer>
    </div>
  );
};

export default Home;
