import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageContent, Section, Card, CardBody, Grid, Flex } from '../components/Layout.jsx';
import { CommonFooter } from '../components/CommonFooter.jsx';
import { EnhancedNavigation } from '../components/EnhancedNavigation.jsx';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper className="home-page">
      <EnhancedNavigation pageType="public" />
      
      <PageContent>
        <Section className="hero-section">
          <Card hover className="hero-card">
            <CardBody className="text-center">
              <div className="hero-badge">Wholesale grocery partner since 1995</div>
              <h1 className="heading-1">Aadhavan Agencies</h1>
              <p className="text-body">Your trusted wholesale supply partner for quality groceries and essentials.</p>
              <div className="hero-actions">
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                  Sign in
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/register')}>
                  Create account
                </button>
              </div>
            </CardBody>
          </Card>
        </Section>

        <Section spacing="large">
          <Grid cols={4} gap="6">
            <Card hover className="feature-card">
              <CardBody className="text-center">
                <div className="feature-icon">🚚</div>
                <h3 className="heading-4">Fast Delivery</h3>
                <p className="text-small">Same-day delivery for orders placed before 12 PM</p>
              </CardBody>
            </Card>
            <Card hover className="feature-card">
              <CardBody className="text-center">
                <div className="feature-icon">📦</div>
                <h3 className="heading-4">Wide Selection</h3>
                <p className="text-small">Over 1200+ SKUs across all grocery categories</p>
              </CardBody>
            </Card>
            <Card hover className="feature-card">
              <CardBody className="text-center">
                <div className="feature-icon">💰</div>
                <h3 className="heading-4">Competitive Pricing</h3>
                <p className="text-small">Best wholesale prices in the region</p>
              </CardBody>
            </Card>
            <Card hover className="feature-card">
              <CardBody className="text-center">
                <div className="feature-icon">🏪</div>
                <h3 className="heading-4">Quality Assured</h3>
                <p className="text-small">Fresh products with quality guarantee</p>
              </CardBody>
            </Card>
          </Grid>
        </Section>

        <Section spacing="large">
          <Card className="cta-card">
            <CardBody>
              <Flex justify="between" align="center" className="cta-content">
                <div>
                  <div className="cta-badge">Get Started</div>
                  <h2 className="heading-2">Ready to grow your business?</h2>
                  <p className="text-body">Join hundreds of retailers who trust Aadhavan Agencies for their wholesale needs.</p>
                </div>
                <div className="cta-actions">
                  <button className="btn btn-primary btn-lg" onClick={() => navigate('/login')}>
                    Sign in to Your Account
                  </button>
                  <button className="btn btn-outline btn-lg" onClick={() => navigate('/register')}>
                    Register Your Business
                  </button>
                </div>
              </Flex>
            </CardBody>
          </Card>
        </Section>
      </PageContent>

      <CommonFooter 
        companyName="Aadhavan Agencies"
        companyTagline="Wholesale supply partner for modern retailers"
        showNewsletter={false}
      />
    </PageWrapper>
  );
};

export default Home;
