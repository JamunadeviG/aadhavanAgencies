import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { getUserOrders } from '../services/orderService.js';
import { PageWrapper, PageContent, Card, CardBody, Grid, LoadingState } from '../components/Layout.jsx';
import UserNavbar from '../components/UserNavbar.jsx';
import './UserDashboard.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const [userStats, setUserStats] = useState({
    totalOrders: 0,
    ordersInProgress: 0,
    deliveredOrders: 0,
    totalAmountSpent: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
    lastOrderDate: null,
    favoriteProducts: [],
    recentActivity: []
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserDashboardData();
  }, []);

  const fetchUserDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!currentUser?.id) {
        throw new Error('User not found. Please login again.');
      }

      console.log('🔍 UserDashboard: Fetching data for user:', currentUser.id);

      // Fetch user's orders
      const ordersResponse = await getUserOrders(currentUser.id);
      console.log('🔍 UserDashboard: Orders response:', ordersResponse);

      const ordersData = ordersResponse.orders || [];
      console.log('🔍 UserDashboard: Orders data:', ordersData);

      setOrders(ordersData);

      // Calculate user-specific statistics
      const totalOrders = ordersData.length;
      const ordersInProgress = ordersData.filter(order =>
        order.status === 'pending' || order.status === 'processing' || order.status === 'shipped'
      ).length;
      const deliveredOrders = ordersData.filter(order => order.status === 'delivered').length;
      const pendingOrders = ordersData.filter(order => order.status === 'pending').length;
      const cancelledOrders = ordersData.filter(order => order.status === 'cancelled').length;

      // Calculate total amount spent (from delivered orders)
      const totalAmountSpent = ordersData
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => {
          const orderTotal = parseFloat(order.total) || parseFloat(order.amount) || 0;
          return sum + orderTotal;
        }, 0);

      // Calculate average order value
      const averageOrderValue = deliveredOrders > 0 ? totalAmountSpent / deliveredOrders : 0;

      // Find last order date
      const lastOrderDate = ordersData.length > 0
        ? new Date(Math.max(...ordersData.map(order => new Date(order.createdAt || order.orderDate))))
        : null;

      // Find favorite products (most ordered)
      const productFrequency = {};
      ordersData.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const productName = item.name || item.productName || 'Unknown Product';
            productFrequency[productName] = (productFrequency[productName] || 0) + (item.quantity || 1);
          });
        }
      });

      const favoriteProducts = Object.entries(productFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, quantity]) => ({ name, quantity }));

      // Create recent activity timeline
      const recentActivity = ordersData
        .sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
        .slice(0, 5)
        .map(order => ({
          id: order._id || order.id,
          type: 'order',
          title: `Order #${order.orderId || order._id?.slice(-6) || 'Unknown'}`,
          description: `₹${order.total || order.amount || 0} - ${order.status || 'pending'}`,
          date: new Date(order.createdAt || order.orderDate),
          status: order.status || 'pending'
        }));

      // Update all stats
      setUserStats({
        totalOrders,
        ordersInProgress,
        deliveredOrders,
        totalAmountSpent,
        pendingOrders,
        cancelledOrders,
        averageOrderValue,
        lastOrderDate,
        favoriteProducts,
        recentActivity
      });

      console.log('✅ UserDashboard: Stats calculated:', {
        totalOrders,
        ordersInProgress,
        deliveredOrders,
        totalAmountSpent,
        favoriteProducts: favoriteProducts.length
      });

    } catch (error) {
      console.error('❌ UserDashboard: Error loading dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <PageWrapper>
        <UserNavbar />
        <PageContent>
          <div className="user-dashboard">
            <LoadingState message="Loading your dashboard..." />
          </div>
        </PageContent>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <UserNavbar />
        <PageContent>
          <div className="user-dashboard">
            <div className="error-message">
              {error}
            </div>
          </div>
        </PageContent>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <UserNavbar />
      <PageContent>
        <div className="user-dashboard">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <h1>My Dashboard</h1>
            <p>Welcome back, {currentUser?.name || currentUser?.username || 'User'}!</p>
          </div>

          {/* Main Statistics Cards */}
          <div className="stats-grid">
            <Card className="stat-card">
              <CardBody>
                <div className="stat-content">
                  <div className="stat-icon total-orders">
                    📦
            <div>
              <p className="user-kicker">Retail partner workspace</p>
              <h1>Welcome back, {user.name}</h1>
              <p className="user-tagline">Here is a snapshot of your store profile and quick actions.</p>
            </div>
          </div>

          {actionMessage && (
            <div className="user-action-toast card">
              <div>
                <p className="user-kicker">Action center</p>
                <h4>{actionMessage.title}</h4>
                <p>{actionMessage.body}</p>
              </div>
              <button className="btn" onClick={() => setActionMessage(null)}>
                Dismiss
              </button>
            </div>
          )}

          <section className="user-grid">
            <article className="user-card card">
              <div className="user-card-head">
                <div>
                  <p className="user-kicker">Registered Store</p>
                  <h2>{storeInfo.storeName || 'Store details'}</h2>
                </div>
                <span className="pill">ID: {user.userId || 'Auto'}</span>
              </div>
              <p className="user-address">{fullAddress || 'Address details will appear once provided.'}</p>
              {error && <div className="user-action-message">{error}</div>}
              <div className="user-info-grid">
                {infoItems.map((item) => (
                  <div key={item.label} className="user-info-item">
                    <p className="label">{item.label}</p>
                    <p className="value">{item.value || '—'}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
      </PageContent>
    </PageWrapper>
  );
};

export default UserDashboard;
