import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getStoredUser } from '../services/authService.js';
import { getProducts } from '../services/productService.js';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = getStoredUser();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      
      // Calculate statistics
      const totalProducts = response.products?.length || 0;
      const totalStock = response.products?.reduce((sum, product) => {
        return sum + (product.stock || 0);
      }, 0) || 0;

      setStats({
        totalProducts,
        totalStock
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>AADHAVAN AGENCIES</h1>
          <p>Welcome, {user?.name || 'Admin'}</p>
        </div>
        <nav className="dashboard-nav">
          <button onClick={() => navigate('/dashboard')} className="nav-btn active">
            Dashboard
          </button>
          <button onClick={() => navigate('/products')} className="nav-btn">
            Products
          </button>
          <button onClick={handleLogout} className="nav-btn logout-btn">
            Logout
          </button>
        </nav>
      </header>

      <main className="dashboard-main">
        <h2>Dashboard Summary</h2>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>Total Products</h3>
                <p className="stat-value">{stats.totalProducts}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Total Stock Quantity</h3>
                <p className="stat-value">{stats.totalStock.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <button 
            onClick={() => navigate('/products')} 
            className="action-btn"
          >
            Manage Products
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
