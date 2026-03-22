import { useState, useEffect, useMemo } from 'react';
import { getProducts } from '../services/productService.js';
import { getAllOrders } from '../services/orderService.js';
import { getUsers } from '../services/userService.js';
import AdminLayout from '../components/AdminLayout.jsx';
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
import './Dashboard.css';

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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
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

      // Calculate comprehensive statistics
      const totalProducts = productsData.length;
      const totalStock = productsData.reduce((sum, product) => sum + (product.stock || 0), 0);
      const ordersTaken = ordersData.length;
      const ordersShipped = ordersData.filter(order => order.status === 'shipped').length;
      const ordersDelivered = ordersData.filter(order => order.status === 'delivered').length;
      const placedOrders = ordersData.filter(order => order.status === 'placed').length;
      
      // Enhanced customer analytics
      const allCustomers = usersData.filter(user => user.role !== 'admin'); // Exclude admin users
      const totalCustomers = allCustomers.length;
      
      // Calculate active customers (customers who have placed at least one order)
      const activeCustomerIds = new Set();
      ordersData.forEach(order => {
        if (order.userId) {
          activeCustomerIds.add(order.userId);
        }
      });
      const activeCustomers = activeCustomerIds.size;
      
      // Calculate total revenue from delivered orders only
      const totalRevenue = ordersData
        .filter(order => order.status === 'delivered')
        .reduce((sum, order) => {
          // Handle different possible revenue fields
          const amount = order.totalAmount || order.amount || order.total || 0;
          return sum + (Number(amount) || 0);
        }, 0);

      // Find low stock products (less than 10 units)
      const lowStockProducts = productsData.filter(product => (product.stock || 0) < 10).length;

      setStats({
        totalProducts,
        totalStock,
        ordersTaken,
        ordersShipped,
        ordersDelivered,
        totalCustomers,
        totalRevenue,
        placedOrders,
        lowStockProducts,
        activeCustomers
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data preparations
  const orderStatusData = useMemo(() => {
    const statusCounts = {
      placed: orders.filter(order => order.status === 'placed').length,
      shipped: orders.filter(order => order.status === 'shipped').length,
      delivered: orders.filter(order => order.status === 'delivered').length,
      cancelled: orders.filter(order => order.status === 'cancelled').length
    };

    return {
      labels: ['Placed', 'Shipped', 'Delivered', 'Cancelled'],
      datasets: [{
        data: Object.values(statusCounts),
        backgroundColor: [
          '#007bff', // Blue for placed
          '#3498DB', // Blue for shipped
          '#27AE60', // Green for delivered
          '#E74C3C'  // Red for cancelled
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }, [orders]);

  const productCategoryData = useMemo(() => {
    const categoryCounts = {};
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return {
      labels: Object.keys(categoryCounts),
      datasets: [{
        label: 'Products by Category',
        data: Object.values(categoryCounts),
        backgroundColor: '#13432A',
        borderColor: '#0F2818',
        borderWidth: 1
      }]
    };
  }, [products]);

  const revenueData = useMemo(() => {
    // Group orders by month for revenue trend
    const monthlyRevenue = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize all months with 0
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, i, 1).toLocaleDateString('en-US', { month: 'short' });
      monthlyRevenue[month] = 0;
    }

    orders
      .filter(order => order.status === 'delivered' && new Date(order.createdAt).getFullYear() === currentYear)
      .forEach(order => {
        const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' });
        monthlyRevenue[month] += order.totalAmount || 0;
      });

    return {
      labels: Object.keys(monthlyRevenue),
      datasets: [{
        label: 'Monthly Revenue',
        data: Object.values(monthlyRevenue),
        borderColor: '#13432A',
        backgroundColor: 'rgba(19, 67, 42, 0.1)',
        borderWidth: 2,
        tension: 0.4
      }]
    };
  }, [orders]);

  const topSellingProducts = useMemo(() => {
    const productSales = {};
    
    orders
      .filter(order => order.status === 'delivered')
      .forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            const productName = item.name || item.productName || 'Unknown';
            productSales[productName] = (productSales[productName] || 0) + (item.quantity || 1);
          });
        }
      });

    return Object.entries(productSales)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));
  }, [orders]);

  const customerGrowthData = useMemo(() => {
    // Group customers by registration month (excluding admin users)
    const monthlyCustomers = {};
    const currentYear = new Date().getFullYear();
    
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, i, 1).toLocaleDateString('en-US', { month: 'short' });
      monthlyCustomers[month] = 0;
    }

    customers
      .filter(customer => customer.role !== 'admin' && new Date(customer.createdAt).getFullYear() === currentYear)
      .forEach(customer => {
        const month = new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short' });
        monthlyCustomers[month]++;
      });

    return {
      labels: Object.keys(monthlyCustomers),
      datasets: [{
        label: 'New Customers',
        data: Object.values(monthlyCustomers),
        backgroundColor: '#27AE60',
        borderColor: '#1E8449',
        borderWidth: 1
      }]
    };
  }, [customers]);

  const customerSegmentData = useMemo(() => {
    // Customer segmentation based on order activity (excluding admin users)
    const customerOrderCounts = {};
    
    // Count orders per customer
    orders.forEach(order => {
      if (order.userId) {
        customerOrderCounts[order.userId] = (customerOrderCounts[order.userId] || 0) + 1;
      }
    });

    // Segment customers
    const segments = {
      'New (0 orders)': 0,
      'Occasional (1-3 orders)': 0,
      'Regular (4-10 orders)': 0,
      'VIP (10+ orders)': 0
    };

    customers.forEach(customer => {
      if (customer.role === 'admin') return; // Exclude admin users
      
      const orderCount = customerOrderCounts[customer._id] || 0;
      
      if (orderCount === 0) {
        segments['New (0 orders)']++;
      } else if (orderCount <= 3) {
        segments['Occasional (1-3 orders)']++;
      } else if (orderCount <= 10) {
        segments['Regular (4-10 orders)']++;
      } else {
        segments['VIP (10+ orders)']++;
      }
    });

    return {
      labels: Object.keys(segments),
      datasets: [{
        data: Object.values(segments),
        backgroundColor: [
          '#3498DB', // Blue for new
          '#F39C12', // Orange for occasional
          '#27AE60', // Green for regular
          '#8E44AD'  // Purple for VIP
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }, [customers, orders]);

  return (
    <AdminLayout active="dashboard" title="Analytics Dashboard">
      <div className="dashboard-container">
        {/* Dashboard Header with Refresh */}
        <div className="dashboard-header">
          <h2>Real-Time Analytics</h2>
          <button className="refresh-btn" onClick={fetchDashboardData} disabled={loading}>
            {loading ? 'Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📦</div>
            <div className="metric-content">
              <div className="metric-value">{loading ? '—' : stats.totalProducts.toLocaleString()}</div>
              <div className="metric-label">Total Products</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <div className="metric-value">{loading ? '—' : stats.totalStock.toLocaleString()}</div>
              <div className="metric-label">Total Stock</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📋</div>
            <div className="metric-content">
              <div className="metric-value">{loading ? '—' : stats.ordersTaken.toLocaleString()}</div>
              <div className="metric-label">Total Orders</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">✅</div>
            <div className="metric-content">
              <div className="metric-value">{loading ? '—' : stats.ordersDelivered.toLocaleString()}</div>
              <div className="metric-label">Delivered</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">👥</div>
            <div className="metric-content">
              <div className="metric-value">{loading ? '—' : stats.totalCustomers.toLocaleString()}</div>
              <div className="metric-label">Total Customers</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">🟢</div>
            <div className="metric-content">
              <div className="metric-value">{loading ? '—' : stats.activeCustomers.toLocaleString()}</div>
              <div className="metric-label">Active Customers</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">💰</div>
            <div className="metric-content">
              <div className="metric-value">{loading ? '—' : `₹${stats.totalRevenue.toLocaleString()}`}</div>
              <div className="metric-label">Revenue (Delivered)</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">📝</div>
            <div className="metric-content">
              <div className="metric-value">{loading ? '—' : stats.placedOrders.toLocaleString()}</div>
              <div className="metric-label">Placed Orders</div>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon">⚠️</div>
            <div className="metric-content">
              <div className="metric-value">{loading ? '—' : stats.lowStockProducts.toLocaleString()}</div>
              <div className="metric-label">Low Stock Items</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          {/* Order Status Pie Chart */}
          <div className="chart-card">
            <h3>Order Status Distribution</h3>
            <div className="chart-container">
              <Pie 
                data={orderStatusData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Product Categories Bar Chart */}
          <div className="chart-card">
            <h3>Products by Category</h3>
            <div className="chart-container">
              <Bar 
                data={productCategoryData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
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
                }}
              />
            </div>
          </div>

          {/* Revenue Trend Line Chart */}
          <div className="chart-card wide">
            <h3>Monthly Revenue Trend</h3>
            <div className="chart-container">
              <Line 
                data={revenueData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      display: false
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          return `Revenue: ₹${context.parsed.y.toLocaleString()}`;
                        }
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: function(value) {
                          return '₹' + value.toLocaleString();
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Customer Growth Bar Chart */}
          <div className="chart-card">
            <h3>Customer Growth</h3>
            <div className="chart-container">
              <Bar 
                data={customerGrowthData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
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
                }}
              />
            </div>
          </div>

          {/* Customer Segmentation Pie Chart */}
          <div className="chart-card">
            <h3>Customer Segments</h3>
            <div className="chart-container">
              <Pie 
                data={customerSegmentData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="chart-card">
            <h3>Top Selling Products</h3>
            <div className="top-products-list">
              {topSellingProducts.length === 0 ? (
                <div className="no-data">No sales data available</div>
              ) : (
                topSellingProducts.map((product, index) => (
                  <div key={index} className="product-item">
                    <span className="product-rank">#{index + 1}</span>
                    <span className="product-name">{product.name}</span>
                    <span className="product-quantity">{product.quantity} sold</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
