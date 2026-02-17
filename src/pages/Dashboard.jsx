import { useState, useEffect } from 'react';
import { getProducts } from '../services/productService.js';
import AdminLayout from '../components/AdminLayout.jsx';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0
  });
  const [loading, setLoading] = useState(true);

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

  return (
    <AdminLayout active="dashboard" title="Dashboard">
      <div className="dash-grid">
        <div className="dash-card dash-card-wide">
          <div className="dash-kicker">Summary</div>
          <div className="dash-title">Today at a glance</div>
          <div className="dash-note">
            This is a basic summary for the ERP starter. You can extend it later with sales,
            purchases, payments, GST and reports.
          </div>
        </div>

        <div className="dash-card">
          <div className="metric-label">Total Products</div>
          <div className="metric-value">{loading ? '—' : stats.totalProducts}</div>
          <div className="metric-hint">All items in your catalog</div>
        </div>

        <div className="dash-card">
          <div className="metric-label">Total Stock</div>
          <div className="metric-value">{loading ? '—' : stats.totalStock.toLocaleString()}</div>
          <div className="metric-hint">Sum of stock across products</div>
        </div>

        <div className="dash-card dash-card-wide">
          <div className="dash-kicker">Next</div>
          <div className="dash-title">Quick actions</div>
          <div className="dash-actions">
            <button className="btn btn-primary" onClick={() => (window.location.href = '/products')}>
              Manage Products
            </button>
            <button className="btn" onClick={fetchDashboardData}>
              Refresh
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
