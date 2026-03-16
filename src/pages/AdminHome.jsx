import { useEffect, useState } from 'react';
import { getStoredUser } from '../services/authService.js';
import { getDashboardData } from '../services/adminService.js';
import { PageWrapper, PageContent, Section, Card, CardBody, Grid, Flex, LoadingState } from '../components/Layout.jsx';
import { AdminNavigation } from '../components/AdminNavigation.jsx';
import { CommonFooter } from '../components/CommonFooter.jsx';
import './AdminHome.css';

const AdminHome = () => {
  const user = getStoredUser();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    totalUsers: 0,
    recentOrders: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Fetch real dashboard statistics
        const data = await getDashboardData();
        setDashboardData(data);
        
        // Update stats with real data
        setStats({
          totalOffers: 0,
          activeOffers: 0,
          totalUsers: data.users?.stats?.totalUsers || 0,
          recentOrders: data.orders?.stats?.recentOrders || 0,
          totalOrders: data.orders?.stats?.totalOrders || 0,
          pendingOrders: data.orders?.stats?.pendingOrders || 0,
          deliveredOrders: data.orders?.stats?.deliveredOrders || 0,
          totalRevenue: data.orders?.stats?.totalRevenue || 0,
          totalProducts: data.products?.stats?.totalProducts || 0,
          lowStockProducts: data.products?.stats?.lowStockProducts || 0
        });
        
        console.log('📊 Dashboard data loaded:', data);
      } catch (error) {
        console.error('📊 Error fetching dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
        
        // Fallback to basic stats
        setStats({
          totalOffers: 0,
          activeOffers: 0,
          totalUsers: 0,
          recentOrders: 0,
          totalOrders: 0,
          pendingOrders: 0,
          deliveredOrders: 0,
          totalRevenue: 0,
          totalProducts: 0,
          lowStockProducts: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
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
            {error && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          </div>
          
          {loading ? (
            <LoadingState message="Loading dashboard statistics..." />
          ) : (
            <>
              <Grid cols={4} gap="6">
                <Card hover className="stat-card">
                  <CardBody className="text-center">
                    <div className="stat-icon">👥</div>
                    <h3 className="heading-3">{stats.totalUsers}</h3>
                    <p className="text-small">Total Users</p>
                  </CardBody>
                </Card>
                <Card hover className="stat-card">
                  <CardBody className="text-center">
                    <div className="stat-icon">�</div>
                    <h3 className="heading-3">{stats.totalOrders}</h3>
                    <p className="text-small">Total Orders</p>
                  </CardBody>
                </Card>
                <Card hover className="stat-card">
                  <CardBody className="text-center">
                    <div className="stat-icon">⏳</div>
                    <h3 className="heading-3">{stats.pendingOrders}</h3>
                    <p className="text-small">Pending Orders</p>
                  </CardBody>
                </Card>
                <Card hover className="stat-card">
                  <CardBody className="text-center">
                    <div className="stat-icon">✅</div>
                    <h3 className="heading-3">{stats.deliveredOrders}</h3>
                    <p className="text-small">Delivered Orders</p>
                  </CardBody>
                </Card>
              </Grid>

              <Grid cols={3} gap="6">
                <Card hover className="stat-card">
                  <CardBody className="text-center">
                    <div className="stat-icon">💰</div>
                    <h3 className="heading-3">₹{stats.totalRevenue.toLocaleString()}</h3>
                    <p className="text-small">Total Revenue</p>
                  </CardBody>
                </Card>
                <Card hover className="stat-card">
                  <CardBody className="text-center">
                    <div className="stat-icon">🛍️</div>
                    <h3 className="heading-3">{stats.totalProducts}</h3>
                    <p className="text-small">Total Products</p>
                  </CardBody>
                </Card>
                <Card hover className="stat-card">
                  <CardBody className="text-center">
                    <div className="stat-icon">⚠️</div>
                    <h3 className="heading-3">{stats.lowStockProducts}</h3>
                    <p className="text-small">Low Stock Items</p>
                  </CardBody>
                </Card>
              </Grid>
            </>
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
