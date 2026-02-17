import { useEffect, useState } from 'react';
import { getOffers } from '../utils/offerStorage.js';
import { getStoredUser } from '../services/authService.js';
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
    <div className="admin-home-page">
      <main className="admin-home-main">
        <section className="admin-hero">
          <div className="container admin-hero-grid card">
            <div className="admin-hero-copy">
              <div className="pill">Admin Dashboard</div>
              <h1>Welcome back, {user?.name || 'Admin'}</h1>
              <p>Manage your wholesale business operations, track performance, and oversee customer activities.</p>
            </div>
            <div className="admin-hero-actions">
              <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard'}>
                Full Dashboard
              </button>
              <button className="btn ghost" onClick={() => window.location.href = '/products'}>
                Manage Products
              </button>
            </div>
          </div>
        </section>

        <section className="admin-stats">
          <div className="container">
            <div className="stats-grid">
              <div className="stat-card card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>{stats.totalOffers}</h3>
                  <p>Total Offers</p>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <h3>{stats.activeOffers}</h3>
                  <p>Active Offers</p>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card card">
                <div className="stat-icon">📦</div>
                <div className="stat-content">
                  <h3>{stats.recentOrders}</h3>
                  <p>Recent Orders</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-offers">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="kicker">Offer Management</div>
                <h2>Recent Promotions</h2>
                <p>Monitor and manage your promotional campaigns</p>
              </div>
              <div className="admin-offer-actions">
                <button className="btn btn-primary" onClick={() => window.location.href = '/add-offer'}>
                  + Create New Offer
                </button>
              </div>
            </div>

            {offers.length > 0 ? (
              <div className="admin-offers-grid">
                {offers.map((offer, index) => (
                  <article key={offer.id} className="admin-offer-card card">
                    <div
                      className="admin-offer-media"
                      style={{ 
                        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(0,0,0,0.35)), url(https://images.unsplash.com/photo-${1504674900247 + index}-0877df9cc836?auto=format&fit=crop&w=800&q=60)`
                      }}
                    />
                    <div className="admin-offer-body">
                      <div className="tag hot">{offer.discount}% OFF</div>
                      <h3>{offer.title}</h3>
                      <p>{offer.description}</p>
                      <div className="admin-offer-meta">
                        <span>Valid till {new Date(offer.validTill).toLocaleDateString()}</span>
                        {offer.productName && (
                          <span className="admin-offer-product">Product: {offer.productName}</span>
                        )}
                        {offer.category && (
                          <span className="admin-offer-category">Category: {offer.category}</span>
                        )}
                      </div>
                      <div className="admin-offer-actions">
                        <button className="btn ghost" onClick={() => window.location.href = '/add-offer'}>
                          Edit
                        </button>
                        <button className="btn btn-danger" onClick={() => {
                          if (window.confirm('Delete this offer?')) {
                            // In real app, this would call delete function
                            const updatedOffers = offers.filter(o => o.id !== offer.id);
                            setOffers(updatedOffers);
                          }
                        }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="admin-no-offers card">
                <p>No offers created yet. Start by creating your first promotional offer!</p>
                <button className="btn btn-primary" onClick={() => window.location.href = '/add-offer'}>
                  Create First Offer
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="admin-quick-actions">
          <div className="container admin-actions-grid">
            <div className="admin-action-card card">
              <div className="admin-action-icon">📦</div>
              <h3>Manage Products</h3>
              <p>Add, edit, and manage your product catalog</p>
              <button className="btn btn-primary" onClick={() => window.location.href = '/products'}>
                Manage Products
              </button>
            </div>
            <div className="admin-action-card card">
              <div className="admin-action-icon">👥</div>
              <h3>User Management</h3>
              <p>View and manage customer accounts and permissions</p>
              <button className="btn btn-primary" onClick={() => window.location.href = '/users'}>
                Manage Users
              </button>
            </div>
            <div className="admin-action-card card">
              <div className="admin-action-icon">📋</div>
              <h3>Track Orders</h3>
              <p>Monitor order status and delivery logistics</p>
              <button className="btn btn-primary" onClick={() => window.location.href = '/track-orders'}>
                Track Orders
              </button>
            </div>
            <div className="admin-action-card card">
              <div className="admin-action-icon">📊</div>
              <h3>Analytics</h3>
              <p>View business insights and performance metrics</p>
              <button className="btn btn-primary" onClick={() => window.location.href = '/dashboard'}>
                View Analytics
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminHome;
