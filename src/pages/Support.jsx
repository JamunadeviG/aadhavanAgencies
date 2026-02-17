import { useNavigate } from 'react-router-dom';
import ShopHeader from '../components/ShopHeader.jsx';
import './Support.css';

const Support = () => {
  const navigate = useNavigate();

  return (
    <div className="support-page">
      <ShopHeader />

      <main className="support-main">
        <section className="support-hero">
          <div className="container hero-grid card">
            <div className="hero-copy">
              <div className="pill">We're here to help</div>
              <h1>Support & Contact</h1>
              <p>
                Reach out to us for orders, deliveries, returns, or any questions about our products and services.
              </p>
            </div>
          </div>
        </section>

        <section className="contact-section">
          <div className="container contact-grid">
            <div className="contact-card card">
              <h2>Get in Touch</h2>
              <div className="contact-item">
                <strong>Customer Care</strong>
                <span>+91 97909 48214</span>
              </div>
              <div className="contact-item">
                <strong>Email</strong>
                <span>support@aadhavanagencies.com</span>
              </div>
              <div className="contact-item">
                <strong>Head Office</strong>
                <span>No. 35,Thalagiriyar Street, Thiruvannamalai, TamilNadu  – 606601 </span>
              </div>
              <div className="contact-item">
                <strong>Office Hours</strong>
                <span>Mon - Sat: 6:00 AM - 8:00 PM</span>
                <span>Closed on public holidays</span>
              </div>
            </div>

            <div className="contact-card card">
              <h2>Quick Links</h2>
              <button className="support-link" onClick={() => navigate('/register')}>
                Create Account
              </button>
              <button className="support-link" onClick={() => navigate('/login')}>
                Partner Login
              </button>
              <button className="support-link" onClick={() => navigate('/about')}>
                About Us
              </button>
              <button className="support-link" onClick={() => navigate('/')}>
                Home
              </button>
            </div>
          </div>
        </section>

        <section className="faq-section">
          <div className="container">
            <h2 className="section-heading">Frequently Asked Questions</h2>
            <div className="faq-grid">
              <div className="faq-card card">
                <h3>How do I place an order?</h3>
                <p>Log in to your dashboard, browse products, and add items to your cart. Proceed to checkout to confirm delivery details.</p>
              </div>
              <div className="faq-card card">
                <h3>What are the delivery hours?</h3>
                <p>We deliver within 24 hours across Tamil Nadu. Orders placed before 2 PM are usually delivered the same day.</p>
              </div>
              <div className="faq-card card">
                <h3>How can I track my order?</h3>
                <p>Visit the Track Orders section in your dashboard to see real-time status and estimated delivery time.</p>
              </div>
              <div className="faq-card card">
                <h3>What is the return policy?</h3>
                <p>If you receive damaged or incorrect items, contact us within 24 hours for a replacement or refund.</p>
              </div>
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
              <li><strong>HQ:</strong> <span>17/4 Sivanandha Colony, Coimbatore, TN 641012</span></li>
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

export default Support;
