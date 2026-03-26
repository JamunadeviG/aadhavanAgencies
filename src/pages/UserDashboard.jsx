import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { getUserOrders } from '../services/orderService.js';
import { Tilt } from 'react-tilt';
import CountUp from 'react-countup';
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
  LineElement,
  Filler
} from 'chart.js';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import './UserDashboard.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
  ArcElement, PointElement, LineElement, Filler
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

  useEffect(() => {
    fetchUserDashboardData();
  }, []);

  const fetchUserDashboardData = async () => {
    try {
      setLoading(true);
      if (!currentUser?.id) throw new Error('User not found.');

      const ordersResponse = await getUserOrders(currentUser.id);
      const ordersData = ordersResponse.orders || [];
      setOrders(ordersData);

      const totalOrders = ordersData.length;
      const ordersInProgress = ordersData.filter(o => ['placed', 'processing', 'shipped'].includes(o.status)).length;
      const deliveredOrders = ordersData.filter(o => o.status === 'delivered').length;
      const cancelledOrders = ordersData.filter(o => o.status === 'cancelled').length;
      const pendingOrders = ordersData.filter(o => o.status === 'placed').length;

      const deliveredOrdersForAmount = ordersData.filter(o => o.status === 'delivered');
      const totalAmountSpent = deliveredOrdersForAmount.reduce((sum, o) => sum + (parseFloat(o.total) || parseFloat(o.amount) || parseFloat(o.totalAmount) || 0), 0);
      const averageOrderValue = deliveredOrders > 0 ? totalAmountSpent / deliveredOrders : 0;

      const lastOrderDate = ordersData.length > 0
        ? Math.max(...ordersData.map(o => new Date(o.createdAt || o.orderDate)))
        : null;

      const recentActivity = ordersData
        .sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
        .slice(0, 5)
        .map((order, idx) => ({
          id: order._id || order.id || idx,
          title: "Order #" + (order.orderId || order._id || '').slice(-6),
          amount: parseFloat(order.total || order.amount || 0),
          status: order.status || 'placed',
          date: new Date(order.createdAt || order.orderDate)
        }));

      setUserStats({
        totalOrders, ordersInProgress, deliveredOrders, totalAmountSpent,
        pendingOrders, cancelledOrders, averageOrderValue, lastOrderDate,
        favoriteProducts: [], recentActivity
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return '#10b981'; // green
      case 'processing': return '#3b82f6'; // blue
      case 'shipped': return '#8b5cf6'; // purple
      case 'cancelled': return '#ef4444'; // red
      default: return '#f59e0b'; // orange (placed/pending)
    }
  };

  // Monthly Spending Line Chart with smooth animation
  const monthlySpendingData = useMemo(() => {
    const monthlyData = {};
    const currentYear = new Date().getFullYear();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, new Date().getMonth() - i, 1).toLocaleDateString('en-US', { month: 'short' });
      monthlyData[month] = 0;
    }
    orders.filter(o => o.status === 'delivered').forEach(order => {
      const orderDate = new Date(order.createdAt || order.orderDate);
      if (orderDate.getFullYear() === currentYear) {
        const month = orderDate.toLocaleDateString('en-US', { month: 'short' });
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
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#ffffff',
      }]
    };
  }, [orders]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 2000,
      easing: 'easeOutQuart'
    },
    plugins: { legend: { display: false } },
    scales: {
      y: { border: { display: false }, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#64748b' } },
      x: { border: { display: false }, grid: { display: false }, ticks: { color: '#64748b' } }
    }
  };

  // Ring Progress for Delivery Success Rate
  const ringData = {
    labels: ['Delivered', 'Other'],
    datasets: [{
      data: [userStats.deliveredOrders, Math.max(1, userStats.totalOrders - userStats.deliveredOrders)],
      backgroundColor: ['#10b981', 'rgba(0,0,0,0.05)'],
      borderWidth: 0,
      cutout: '80%'
    }]
  };

  const ringOptions = {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 2500, animateRotate: true },
    plugins: { legend: { display: false }, tooltip: { enabled: false } }
  };

  const defaultTiltOptions = {
    max: 15,
    scale: 1.05,
    speed: 400,
    glare: true,
    "max-glare": 0.2,
  };

  if (loading) {
    return <div className="dash-loading">Loading Dashboard...</div>;
  }

  return (
    <div className="dash-layout">
      <UserNavbar />

      {/* Main Content Area */}
      <main className="dash-main">
        {/* Soft Navbar override for mobile/desktop top context */}
        <div className="dash-top-bar">
          <h2>Overview</h2>
          <div className="dash-profile">
            <span>{currentUser?.name || 'User'}</span>
            <div className="avatar">{(currentUser?.name || 'U').charAt(0)}</div>
          </div>
        </div>

        <div className="dash-content">

          {/* Animated 3D Stat Cards */}
          <div className="dash-stats-grid">
            <Tilt options={defaultTiltOptions} className="stat-tilt-wrapper">
              <div className="glass-stat-card">
                <div className="stat-info">
                  <p>Total Orders</p>
                  <h3>
                    <CountUp end={userStats.totalOrders} duration={2.5} separator="," />
                  </h3>
                </div>
                <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}>📦</div>
              </div>
            </Tilt>

            <Tilt options={defaultTiltOptions} className="stat-tilt-wrapper">
              <div className="glass-stat-card">
                <div className="stat-info">
                  <p>Active Orders</p>
                  <h3>
                    <CountUp end={userStats.ordersInProgress} duration={2.5} />
                  </h3>
                </div>
                <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>⏳</div>
              </div>
            </Tilt>

            <Tilt options={defaultTiltOptions} className="stat-tilt-wrapper">
              <div className="glass-stat-card">
                <div className="stat-info">
                  <p>Total Spent</p>
                  <h3>
                    ₹<CountUp end={userStats.totalAmountSpent} duration={2.5} separator="," />
                  </h3>
                </div>
                <div className="stat-icon" style={{ background: '#dcfce7', color: '#059669' }}>💰</div>
              </div>
            </Tilt>
          </div>

          <div className="dash-middle-grid">
            {/* Smooth Transition Chart */}
            <div className="glass-panel chart-panel">
              <div className="panel-header">
                <h3>Spending Analytics</h3>
              </div>
              <div className="chart-wrapper">
                <Line data={monthlySpendingData} options={lineOptions} />
              </div>
            </div>

            {/* Gradient Progress Ring */}
            <div className="glass-panel ring-panel">
              <div className="panel-header">
                <h3>Delivery Success Rate</h3>
              </div>
              <div className="ring-container">
                <div className="ring-chart">
                  <Doughnut data={ringData} options={ringOptions} />
                  <div className="ring-center-text">
                    {userStats.totalOrders > 0 ? Math.round((userStats.deliveredOrders / userStats.totalOrders) * 100) : 0}%
                  </div>
                </div>
                <p>Orders successfully delivered to storefront.</p>
              </div>
            </div>
          </div>

          {/* Timeline Recent Orders */}
          <div className="glass-panel timeline-panel">
            <div className="panel-header">
              <h3>Recent Activity</h3>
              <button
                onClick={() => navigate('/orders')}
                style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontWeight: 'bold' }}
              >
                View All
              </button>
            </div>

            {userStats.recentActivity.length === 0 ? (
              <p className="no-data">No recent orders found.</p>
            ) : (
              <div className="timeline">
                {userStats.recentActivity.map((activity, index) => (
                  <div className="timeline-item" key={activity.id + index}>
                    <div className="timeline-marker"></div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <h4>{activity.title}</h4>
                        <span className="timeline-date">{activity.date.toLocaleDateString()}</span>
                      </div>
                      <div className="timeline-body">
                        <span className="timeline-price">₹{activity.amount.toLocaleString()}</span>
                        <div className="status-badge-wrapper">
                          {/* Pulsing animation if active */}
                          {['placed', 'processing', 'shipped'].includes(activity.status) && (
                            <span className="pulse-ring" style={{ backgroundColor: getStatusColor(activity.status) }}></span>
                          )}
                          <span
                            className="status-badge"
                            style={{
                              color: getStatusColor(activity.status),
                              backgroundColor: getStatusColor(activity.status) + "15"
                            }}
                          >
                            {activity.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
