import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageContent, Section, Card, CardBody, Grid, Flex } from '../components/Layout.jsx';
import { CommonFooter } from '../components/CommonFooter.jsx';
import { EnhancedNavigation } from '../components/EnhancedNavigation.jsx';
import './About.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper className="about-page">
      <EnhancedNavigation pageType="public" />

      <PageContent>
        <Section className="about-hero">
          <Card hover className="hero-card">
            <CardBody className="text-center">
              <div className="hero-badge">Since 1995</div>
              <h1 className="heading-1">About Aadhavan Agencies</h1>
              <p className="text-body">
                We are a trusted wholesale grocery partner serving supermarkets, hotels, and Kirana stores across Tamil Nadu with fresh staples, vegetables, and essentials delivered within 24 hours.
              </p>
            </CardBody>
          </Card>
        </Section>

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
      </PageContent>
      
      <CommonFooter />
    </PageWrapper>
  );
};

export default About;
