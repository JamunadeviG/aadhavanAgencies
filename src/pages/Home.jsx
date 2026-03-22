import { useNavigate } from 'react-router-dom';
import { PageWrapper, PageContent, Section, Card, CardBody, Grid, Flex } from '../components/Layout.jsx';
import { CommonFooter } from '../components/CommonFooter.jsx';
import { EnhancedNavigation } from '../components/EnhancedNavigation.jsx';
import HeroSection from '../components/HeroSection.jsx';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper className="home-page">
      <EnhancedNavigation pageType="public" />
      
      <PageContent>
        <HeroSection />
      </PageContent>

      <CommonFooter />
    </PageWrapper>
  );
};

export default Home;
