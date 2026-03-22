import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { getUserOrders } from '../services/orderService.js';
import { PageWrapper, PageContent, Card, CardBody, Grid, LoadingState } from '../components/Layout.jsx';
import UserNavbar from '../components/UserNavbar.jsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import './UserDashboard.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

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
        order.status === 'placed' || order.status === 'processing' || order.status === 'shipped'
      ).length;
      const deliveredOrders = ordersData.filter(order => order.status === 'delivered').length;
      const placedOrders = ordersData.filter(order => order.status === 'placed').length;
      const cancelledOrders = ordersData.filter(order => order.status === 'cancelled').length;
      
      // Calculate total amount spent (from delivered orders only)
      const deliveredOrdersForAmount = ordersData.filter(order => order.status === 'delivered');
      console.log('🔍 UserDashboard: Delivered orders for amount calculation:', deliveredOrdersForAmount);
      
      const totalAmountSpent = deliveredOrdersForAmount.reduce((sum, order) => {
        // Try multiple possible amount fields
        const orderTotal = parseFloat(order.total) || parseFloat(order.amount) || parseFloat(order.totalAmount) || 0;
        console.log(`🔍 Order ${order._id || order.orderId || 'unknown'}: ₹${orderTotal}`);
        return sum + orderTotal;
      }, 0);
      
      console.log('🔍 UserDashboard: Total amount spent calculation:', {
        deliveredOrdersCount: deliveredOrdersForAmount.length,
        totalAmountSpent,
        ordersChecked: deliveredOrdersForAmount.map(o => ({
          id: o._id || o.orderId,
          total: o.total || o.amount || o.totalAmount,
          status: o.status
        }))
      });

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
        .sort(([,a], [,b]) => b - a)
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
          description: `₹${order.total || order.amount || 0} - ${order.status || 'placed'}`,
          date: new Date(order.createdAt || order.orderDate),
          status: order.status || 'placed'
        }));

      // Update all stats
      setUserStats({
        totalOrders,
        ordersInProgress,
        deliveredOrders,
        totalAmountSpent,
        placedOrders,
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

  // Calculate order status distribution for pie chart
  const orderStatusData = useMemo(() => {
    const statusCounts = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      const status = order.status || 'pending';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });

    return {
      labels: Object.keys(statusCounts).map(status => 
        status.charAt(0).toUpperCase() + status.slice(1)
      ),
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          '#FFA500', // Orange for pending
          '#3498DB', // Blue for processing
          '#9B59B6', // Purple for shipped
          '#27AE60', // Green for delivered
          '#E74C3C'  // Red for cancelled
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };
  }, [orders]);

  // Calculate monthly spending trend for line chart
  const monthlySpendingData = useMemo(() => {
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, new Date().getMonth() - i, 1)
        .toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyData[month] = 0;
    }

    // Calculate spending per month (only delivered orders)
    orders
      .filter(order => order.status === 'delivered')
      .forEach(order => {
        const orderDate = new Date(order.createdAt || order.orderDate);
        if (orderDate.getFullYear() === currentYear) {
          const month = orderDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          if (monthlyData.hasOwnProperty(month)) {
            monthlyData[month] += parseFloat(order.total || order.amount || 0);
          }
        }
      });

    return {
      labels: Object.keys(monthlyData),
      datasets: [{
        label: 'Monthly Spending (₹)',
        data: Object.values(monthlyData),
        borderColor: '#27AE60',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#27AE60',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };
  }, [orders]);

  // Calculate favorite products for bar chart
  const favoriteProductsData = useMemo(() => {
    const productFrequency = {};
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const productName = item.name || item.productName || 'Unknown Product';
          productFrequency[productName] = (productFrequency[productName] || 0) + (item.quantity || 1);
        });
      }
    });

    const topProducts = Object.entries(productFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    return {
      labels: topProducts.map(p => p.name),
      datasets: [{
        label: 'Times Ordered',
        data: topProducts.map(p => p.quantity),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderWidth: 2
      }]
    };
  }, [orders]);

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Spending: ₹${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value;
          }
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
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
                  </div>
                  <div className="stat-details">
                    <h3>{userStats.totalOrders}</h3>
                    <p>Total Orders</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="stat-card">
              <CardBody>
                <div className="stat-content">
                  <div className="stat-icon in-progress">
                    ⏳
                  </div>
                  <div className="stat-details">
                    <h3>{userStats.ordersInProgress}</h3>
                    <p>Orders in Progress</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="stat-card">
              <CardBody>
                <div className="stat-content">
                  <div className="stat-icon delivered">
                    ✅
                  </div>
                  <div className="stat-details">
                    <h3>{userStats.deliveredOrders}</h3>
                    <p>Delivered Orders</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="stat-card">
              <CardBody>
                <div className="stat-content">
                  <div className="stat-icon amount-spent">
                    💰
                  </div>
                  <div className="stat-details">
                    <h3>{formatCurrency(userStats.totalAmountSpent)}</h3>
                    <p>Total Amount Spent</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Additional Statistics */}
          <div className="secondary-stats">
            <Grid cols="3" gap="6">
              <Card className="secondary-stat-card">
                <CardBody>
                  <div className="secondary-stat">
                    <span className="secondary-stat-label">Average Order Value</span>
                    <span className="secondary-stat-value">{formatCurrency(userStats.averageOrderValue)}</span>
                  </div>
                </CardBody>
              </Card>

              <Card className="secondary-stat-card">
                <CardBody>
                  <div className="secondary-stat">
                    <span className="secondary-stat-label">Pending Orders</span>
                    <span className="secondary-stat-value">{userStats.pendingOrders}</span>
                  </div>
                </CardBody>
              </Card>

              <Card className="secondary-stat-card">
                <CardBody>
                  <div className="secondary-stat">
                    <span className="secondary-stat-label">Last Order</span>
                    <span className="secondary-stat-value">{formatDate(userStats.lastOrderDate)}</span>
                  </div>
                </CardBody>
              </Card>
            </Grid>
          </div>

          {/* Charts and Analytics - Professional 4-Chart Grid */}
          <div className="analytics-section">
            <Grid cols="2" gap="6">
              {/* Order Status Pie Chart */}
              <Card className="chart-card">
                <CardBody>
                  <h3>Order Status Distribution</h3>
                  <div className="chart-container" style={{ height: '280px' }}>
                    {orders.length > 0 ? (
                      <Pie data={orderStatusData} options={pieChartOptions} />
                    ) : (
                      <div className="no-data">No orders yet</div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Monthly Spending Line Chart */}
              <Card className="chart-card">
                <CardBody>
                  <h3>Monthly Spending Trend</h3>
                  <div className="chart-container" style={{ height: '280px' }}>
                    {orders.length > 0 ? (
                      <Line data={monthlySpendingData} options={lineChartOptions} />
                    ) : (
                      <div className="no-data">No spending data yet</div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Favorite Products Bar Chart */}
              <Card className="chart-card">
                <CardBody>
                  <h3>Favorite Products</h3>
                  <div className="chart-container" style={{ height: '280px' }}>
                    {userStats.favoriteProducts.length > 0 ? (
                      <Bar data={favoriteProductsData} options={barChartOptions} />
                    ) : (
                      <div className="no-data">No favorite products yet</div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Order Frequency Chart */}
              <Card className="chart-card">
                <CardBody>
                  <h3>Order Frequency</h3>
                  <div className="chart-container" style={{ height: '280px' }}>
                    {orders.length > 0 ? (
                      <div className="frequency-stats">
                        <div className="frequency-item">
                          <div className="frequency-icon">📊</div>
                          <div className="frequency-details">
                            <div className="frequency-value">{userStats.totalOrders}</div>
                            <div className="frequency-label">Total Orders</div>
                          </div>
                        </div>
                        <div className="frequency-item">
                          <div className="frequency-icon">📈</div>
                          <div className="frequency-details">
                            <div className="frequency-value">{formatCurrency(userStats.averageOrderValue)}</div>
                            <div className="frequency-label">Avg Order Value</div>
                          </div>
                        </div>
                        <div className="frequency-item">
                          <div className="frequency-icon">🎯</div>
                          <div className="frequency-details">
                            <div className="frequency-value">{userStats.deliveredOrders > 0 ? Math.round((userStats.deliveredOrders / userStats.totalOrders) * 100) : 0}%</div>
                            <div className="frequency-label">Success Rate</div>
                          </div>
                        </div>
                        <div className="frequency-item">
                          <div className="frequency-icon">⭐</div>
                          <div className="frequency-details">
                            <div className="frequency-value">{userStats.favoriteProducts.length}</div>
                            <div className="frequency-label">Unique Products</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="no-data">No order frequency data yet</div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Grid>
          </div>
        </div>
      </PageContent>
    </PageWrapper>
  );
};

export default UserDashboard;
