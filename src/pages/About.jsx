import { useNavigate } from 'react-router-dom';
import ShopHeader from '../components/ShopHeader.jsx';
import './About.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <ShopHeader />

      <main className="about-main">
        <section className="about-hero">
          <div className="container hero-grid card">
            <div className="hero-copy">
              <div className="pill">Since 1995</div>
              <h1>About Aadhavan Agencies</h1>
              <p>
                We are a trusted wholesale grocery partner serving supermarkets, hotels, and Kirana stores across Tamil Nadu with fresh staples, vegetables, and essentials delivered within 24 hours.
              </p>
            </div>
          </div>
        </section>

        <section className="story-section">
          <div className="container story-grid">
            <div className="story-card card">
              <h2>Our Story</h2>
              <p>
                Founded in 1995 in Coimbatore, Aadhavan Agencies began as a small wholesale supplier with a mission to provide fresh, quality groceries to local retailers. Over three decades, we’ve grown into a regional leader, serving over 950+ stores with a commitment to reliability, freshness, and fair pricing.
              </p>
            </div>
            <div className="story-card card">
              <h2>Our Mission</h2>
              <p>
                To empower retailers with a seamless supply chain—delivering fresh products on time, every time—while building lasting partnerships rooted in trust and transparency.
              </p>
            </div>
            <div className="story-card card">
              <h2>Our Values</h2>
              <p>
                <strong>Freshness:</strong> Daily sourcing from trusted farms and producers.<br/>
                <strong>Reliability:</strong> 24‑hour delivery across 18 districts.<br/>
                <strong>Integrity:</strong> Fair pricing and honest business practices.<br/>
                <strong>Community:</strong> Supporting local retailers and growers.
              </p>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="container stats-grid">
            <div className="stat-card card">
              <strong>950+</strong>
              <span>Retail Partners</span>
            </div>
            <div className="stat-card card">
              <strong>18</strong>
              <span>Districts Served</span>
            </div>
            <div className="stat-card card">
              <strong>1200+</strong>
              <span>SKUs Stocked Daily</span>
            </div>
            <div className="stat-card card">
              <strong>24H</strong>
              <span>Delivery Promise</span>
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
            <button className="footer-link" onClick={() => navigate('/')}>Support</button>
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

export default About;
