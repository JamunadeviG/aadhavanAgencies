import { useState, useEffect, useMemo } from 'react';
import { getProducts } from '../services/productService.js';
import { getAllOrders } from '../services/orderService.js';
import { getUsers } from '../services/userService.js';
import AdminLayout from '../components/AdminLayout.jsx';
import CountUp from 'react-countup';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    ordersTaken: 0,
    ordersShipped: 0,
    ordersDelivered: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    placedOrders: 0,
    lowStockProducts: 0,
    activeCustomers: 0
  });

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulated live order feed stream
  const [liveOrders, setLiveOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [productsResponse, ordersResponse, usersResponse] = await Promise.all([
        getProducts(),
        getAllOrders(),
        getUsers()
      ]);

      const productsData = productsResponse.products || [];
      const ordersData = ordersResponse.orders || [];
      const usersData = usersResponse.users || [];

      setProducts(productsData);
      setOrders(ordersData);
      setCustomers(usersData);

      // Pre-fill live orders with 5 recent ones
      const sortedOrders = [...ordersData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLiveOrders(sortedOrders.slice(0, 5));

      const totalProducts = productsData.length;
      const totalStock = productsData.reduce((sum, p) => sum + (p.stock || 0), 0);
      const ordersTaken = ordersData.length;
      const placedOrders = ordersData.filter(o => o.status === 'placed').length;
      const ordersDelivered = ordersData.filter(o => o.status === 'delivered').length;

      const allCustomers = usersData.filter(u => u.role !== 'admin');
      const activeCustomerIds = new Set(ordersData.filter(o => o.userId).map(o => o.userId));

      const totalRevenue = ordersData
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (Number(o.totalAmount || o.amount || o.total) || 0), 0);

      const lowStockProducts = productsData.filter(p => (p.stock || 0) < 10).length;

      setStats({
        totalProducts, totalStock, ordersTaken, ordersShipped: 0,
        ordersDelivered, totalCustomers: allCustomers.length,
        totalRevenue, placedOrders, lowStockProducts,
        activeCustomers: activeCustomerIds.size
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sparkline data generators based on arbitrary variations 
  // (In real apps, maps to weekly trends. Mocking recent 7 days interpolation for Sparklines)
  const generateSparkline = (baseVal, volatility) => {
    return Array.from({ length: 10 }).map((_, i) => ({ value: baseVal + (Math.random() * volatility - (volatility / 2)) }));
  };

  const revenueSparkline = useMemo(() => generateSparkline(stats.totalRevenue / 10, 5000), [stats.totalRevenue]);
  const orderSparkline = useMemo(() => generateSparkline(stats.ordersTaken, 10), [stats.ordersTaken]);
  const customerSparkline = useMemo(() => generateSparkline(stats.totalCustomers, 5), [stats.totalCustomers]);

  // Main Revenue Chart Formatter
  const revenueData = useMemo(() => {
    const monthlyRevenue = {};
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => monthlyRevenue[m] = 0);

    orders.filter(o => o.status === 'delivered' && new Date(o.createdAt).getFullYear() === currentYear)
      .forEach(order => {
        const m = months[new Date(order.createdAt).getMonth()];
        monthlyRevenue[m] += (order.totalAmount || order.amount || order.total || 0);
      });

    return months.map(name => ({ name, Revenue: monthlyRevenue[name] }));
  }, [orders]);

  // Distribution PIE
  const statusData = useMemo(() => {
    const counts = { Placed: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    orders.forEach(o => {
      const statusStr = (o.status || 'placed').toLowerCase();
      if (statusStr === 'shipped') counts.Shipped++;
      else if (statusStr === 'delivered') counts.Delivered++;
      else if (statusStr === 'cancelled') counts.Cancelled++;
      else counts.Placed++;
    });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  }, [orders]);

  const PIE_COLORS = ['#3498DB', '#F39C12', '#27AE60', '#E74C3C'];

  // Auto-refresh live orders via polling real API
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await getAllOrders();
        if (response.success || response.orders) {
          const ordersData = response.orders || [];
          if (ordersData.length > 0) {
            const sortedOrders = [...ordersData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setLiveOrders(sortedOrders.slice(0, 5));
          }
        }
      } catch (error) {
        console.error('Error fetching live orders:', error);
      }
    }, 15000); // Poll every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="recharts-custom-tooltip">
          <p className="val">₹{payload[0].value.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <AdminLayout active="dashboard" title="Analytics Overview">
      <div className="admin-analytics-container">
        {/* Animated KPI Header Cards with Recharts Sparklines */}
        <div className="kpi-card-grid">

          <div className="kpi-spark-card">
            <div className="kpi-card-content">
              <span className="kpi-title">Total Revenue</span>
              <h2 className="kpi-value">₹<CountUp end={stats.totalRevenue} duration={2} separator="," /></h2>
              <span className="kpi-indicator positive">▲ 12.5% this month</span>
            </div>
            <div className="kpi-sparkline">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueSparkline}>
                  <Line type="monotone" dataKey="value" stroke="#2bc657" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="kpi-spark-card">
            <div className="kpi-card-content">
              <span className="kpi-title">Wholesale Orders</span>
              <h2 className="kpi-value"><CountUp end={stats.ordersTaken} duration={2} separator="," /></h2>
              <span className="kpi-indicator positive">▲ 4.2% today</span>
            </div>
            <div className="kpi-sparkline">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orderSparkline}>
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="kpi-spark-card">
            <div className="kpi-card-content">
              <span className="kpi-title">Active B2B Clients</span>
              <h2 className="kpi-value"><CountUp end={stats.activeCustomers} duration={2} /></h2>
              <span className="kpi-indicator negative">▼ 1.5% this week</span>
            </div>
            <div className="kpi-sparkline">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={customerSparkline}>
                  <Line type="monotone" dataKey="value" stroke="#f5a623" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Middle Complex Area */}
        <div className="analytics-split">

          {/* Main Huge Area Chart */}
          <div className="chart-wrapper big-chart">
            <div className="chart-header">
              <h3>Revenue Generation Trend (YTD)</h3>
            </div>
            <div className="chart-canvas">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1a3c2e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1a3c2e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '3 3' }} />
                  <Area type="monotone" dataKey="Revenue" stroke="#1a3c2e" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Real-Time Order Stream */}
          <div className="realtime-feed-wrapper">
            <div className="feed-header">
              <h3>Live Order Feed</h3>
              <span className="live-dot-indicator"></span>
            </div>
            <div className="feed-list">
              {liveOrders.map((order, i) => {
                const orderId = order.orderId || order._id || '';
                return (
                  <div className="feed-item slide-in-top" key={orderId}>
                    <div className="feed-icon">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                    </div>
                    <div className="feed-meta">
                      <span className="feed-id">Order #{orderId.substring(orderId.length - 6).toUpperCase()}</span>
                      <span className="feed-time">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="feed-amount">₹{Number(order.totalAmount || order.amount || order.total || 0).toLocaleString()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lower Grid for Product Performance & Status distribution */}
        <div className="performance-grid">

          <div className="chart-wrapper">
            <h3>Order Logistics Distribution</h3>
            <div className="chart-canvas-pie">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="pie-legend">
              {statusData.map((d, i) => (
                <div className="legend-item" key={d.name}>
                  <span className="legend-color" style={{ background: PIE_COLORS[i] }}></span>
                  <span className="legend-text">{d.name} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-wrapper">
            <div className="status-grid-info">
              <h3>Inventory Alerts</h3>

              <div className="alert-card low-stock">
                <div className="alert-icon">⚠️</div>
                <div className="alert-body">
                  <h4>Low Stock Threshold Reached</h4>
                  <p>{stats.lowStockProducts} products require immediate massive restocking from suppliers.</p>
                </div>
              </div>

              <div className="alert-card stable">
                <div className="alert-icon">📦</div>
                <div className="alert-body">
                  <h4>Warehouse Stability</h4>
                  <p>{stats.totalStock.toLocaleString()} aggregate bulk units are active across active categories securely.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
