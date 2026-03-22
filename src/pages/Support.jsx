import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageContent, Section, Card, CardBody, Grid, Flex } from '../components/Layout.jsx';
import { CommonFooter } from '../components/CommonFooter.jsx';
import { EnhancedNavigation } from '../components/EnhancedNavigation.jsx';
import './Support.css';

const Support = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper className="support-page">
      <EnhancedNavigation pageType="public" />

      <PageContent>
        <Section className="support-hero">
          <Card hover className="hero-card">
            <CardBody className="text-center">
              <div className="hero-badge">We're here to help</div>
              <h1 className="heading-1">Support & Contact</h1>
              <p className="text-body">
                Reach out to us for orders, deliveries, returns, or any questions about our products and services.
              </p>
            </CardBody>
          </Card>
        </Section>

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
      </PageContent>
      
      <CommonFooter />
    </PageWrapper>
  );
};

export default Support;
