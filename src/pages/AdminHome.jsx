import { useEffect, useState } from 'react';
import { getOffers } from '../utils/offerStorage.js';
import { getStoredUser } from '../services/authService.js';
import { PageWrapper, PageContent, Section, Card, CardBody, Grid, Flex } from '../components/Layout.jsx';
import { AdminNavigation } from '../components/AdminNavigation.jsx';
import { CommonFooter } from '../components/CommonFooter.jsx';
import './AdminHome.css';

const AdminHome = () => {
  const user = getStoredUser();
  const [offers, setOffers] = useState([]);
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    totalUsers: 0,
    recentOrders: 0
  });

  useEffect(() => {
    const offersData = getOffers();
    setOffers(offersData);
    
    // Calculate stats from offers data
    const activeOffers = offersData.filter(offer => new Date(offer.validTill) > new Date()).length;
    
    setStats({
      totalOffers: offersData.length,
      activeOffers: activeOffers.length,
      totalUsers: Math.floor(Math.random() * 50) + 10, // Mock data - in real app, this would come from database
      recentOrders: Math.floor(Math.random() * 20) + 5 // Mock data - in real app, this would come from database
    });
  }, []);

  return (
    <PageWrapper>
      <AdminNavigation user={user} />

      <PageContent>
        <Section spacing="large">
          <Card className="admin-hero-card">
            <CardBody>
              <div className="admin-hero-content">
                <div className="admin-badge">Admin Dashboard</div>
                <h1 className="heading-1">Welcome back, {user?.name || 'Admin'}</h1>
                <p className="text-body">Manage your wholesale business operations, track performance, and oversee customer activities.</p>
                <div className="admin-hero-actions">
                  <button className="btn btn-primary btn-lg" onClick={() => window.location.href = '/dashboard'}>
                    Full Dashboard
                  </button>
                  <button className="btn btn-outline btn-lg" onClick={() => window.location.href = '/products'}>
                    Manage Products
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </Section>

        <Section spacing="large">
          <div className="section-header">
            <h2 className="heading-2">Business Overview</h2>
          </div>
          <Grid cols={4} gap="6">
            <Card hover className="stat-card">
              <CardBody className="text-center">
                <div className="stat-icon">📊</div>
                <h3 className="heading-3">{stats.totalOffers}</h3>
                <p className="text-small">Total Offers</p>
              </CardBody>
            </Card>
            <Card hover className="stat-card">
              <CardBody className="text-center">
                <div className="stat-icon">🎯</div>
                <h3 className="heading-3">{stats.activeOffers}</h3>
                <p className="text-small">Active Offers</p>
              </CardBody>
            </Card>
            <Card hover className="stat-card">
              <CardBody className="text-center">
                <div className="stat-icon">👥</div>
                <h3 className="heading-3">{stats.totalUsers}</h3>
                <p className="text-small">Total Users</p>
              </CardBody>
            </Card>
            <Card hover className="stat-card">
              <CardBody className="text-center">
                <div className="stat-icon">📦</div>
                <h3 className="heading-3">{stats.recentOrders}</h3>
                <p className="text-small">Recent Orders</p>
              </CardBody>
            </Card>
          </Grid>
        </Section>

        <Section spacing="large">
          <div className="section-header">
            <div>
              <div className="section-kicker">Offer Management</div>
              <h2 className="heading-2">Recent Promotions</h2>
              <p className="text-body">Monitor and manage your promotional campaigns</p>
            </div>
            <button className="btn btn-primary" onClick={() => window.location.href = '/add-offer'}>
              + Create New Offer
            </button>
          </div>

          {offers.length > 0 ? (
            <Grid cols={3} gap="6">
              {offers.map((offer, index) => (
                <Card key={offer.id} hover className="admin-offer-card">
                  <div
                    className="admin-offer-media"
                    style={{ 
                      backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.35)), url(https://images.unsplash.com/photo-${1504674900247 + index}-0877df9cc836?auto=format&fit=crop&w=800&q=60)`
                    }}
                  />
                  <CardBody>
                    <div className="tag hot">{offer.discount}% OFF</div>
                    <h3 className="heading-4">{offer.title}</h3>
                    <p className="text-small">{offer.description}</p>
                    <div className="admin-offer-meta">
                      <span className="text-muted">Valid till {new Date(offer.validTill).toLocaleDateString()}</span>
                      {offer.productName && (
                        <span className="admin-offer-product">Product: {offer.productName}</span>
                      )}
                      {offer.category && (
                        <span className="admin-offer-category">Category: {offer.category}</span>
                      )}
                    </div>
                    <div className="admin-offer-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => window.location.href = '/add-offer'}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => {
                        if (window.confirm('Delete this offer?')) {
                          const updatedOffers = offers.filter(o => o.id !== offer.id);
                          setOffers(updatedOffers);
                        }
                      }}>
                        Delete
                      </button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          ) : (
            <Card className="admin-no-offers">
              <CardBody className="text-center">
                <p className="text-body">No offers created yet. Start by creating your first promotional offer!</p>
                <button className="btn btn-primary" onClick={() => window.location.href = '/add-offer'}>
                  Create First Offer
                </button>
              </CardBody>
            </Card>
          )}
        </Section>

        <Section spacing="large">
          <div className="section-header">
            <h2 className="heading-2">Quick Actions</h2>
          </div>
          <Grid cols={4} gap="6">
            <Card hover className="admin-action-card">
              <CardBody className="text-center">
                <div className="admin-action-icon">📦</div>
                <h3 className="heading-4">Manage Products</h3>
                <p className="text-small">Add, edit, and manage your product catalog</p>
                <button className="btn btn-primary" onClick={() => window.location.href = '/products'}>
                  Manage Products
                </button>
              </CardBody>
            </Card>
            <Card hover className="admin-action-card">
              <CardBody className="text-center">
                <div className="admin-action-icon">👥</div>
                <h3 className="heading-4">User Management</h3>
                <p className="text-small">View and manage customer accounts and permissions</p>
                <button className="btn btn-primary" onClick={() => window.location.href = '/users'}>
                  Manage Users
                </button>
              </CardBody>
            </Card>
            <Card hover className="admin-action-card">
              <CardBody className="text-center">
                <div className="admin-action-icon">📋</div>
                <h3 className="heading-4">Track Orders</h3>
                <p className="text-small">Monitor order status and delivery logistics</p>
                <button className="btn btn-primary" onClick={() => window.location.href = '/track-orders'}>
                  Track Orders
                </button>
              </CardBody>
            </Card>
            <Card hover className="admin-action-card">
              <CardBody className="text-center">
                <div className="admin-action-icon">📊</div>
                <h3 className="heading-4">Analytics</h3>
                <p className="text-small">View business insights and performance metrics</p>
                <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard'}>
                  View Analytics
                </button>
              </CardBody>
            </Card>
          </Grid>
        </Section>
      </PageContent>

      <CommonFooter />
    </PageWrapper>
  );
};

export default AdminHome;
