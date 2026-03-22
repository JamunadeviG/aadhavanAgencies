import React, { useState, useEffect } from 'react';
import { getLowStockProducts } from '../services/stockService.js';
import './StockMonitor.css';

const StockMonitor = () => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [threshold, setThreshold] = useState(10);

  useEffect(() => {
    fetchLowStockProducts();
  }, [threshold]);

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getLowStockProducts(threshold);
      console.log('📦 Low stock products:', response);
      
      if (response.success && response.products) {
        setLowStockProducts(response.products);
      } else {
        setLowStockProducts([]);
      }
    } catch (error) {
      console.error('📦 Error fetching low stock products:', error);
      setError(error.message || 'Failed to fetch low stock products');
      setLowStockProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getStockLevelColor = (stock, threshold) => {
    if (stock === 0) return '#dc3545'; // Red - Out of stock
    if (stock <= threshold / 2) return '#fd7e14'; // Orange - Critical
    return '#ffc107'; // Yellow - Low stock
  };

  const getStockLevelText = (stock, threshold) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= threshold / 2) return 'Critical Stock';
    return 'Low Stock';
  };

  // Demo function to show current stock levels
  const showCurrentStockLevels = () => {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    console.log('📦 Current Stock Levels:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}: ${product.stock || 0} units`);
    });
    alert(`📦 Current stock levels logged to console. Check F12 → Console to see all ${products.length} products.`);
  };

  return (
    <div className="stock-monitor">
      <div className="stock-monitor-header">
        <h3>📦 Stock Monitor</h3>
        <div className="threshold-control">
          <label>Low Stock Threshold:</label>
          <select 
            value={threshold} 
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="threshold-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={20}>20</option>
          </select>
          <button onClick={fetchLowStockProducts} className="refresh-btn">
            🔄 Refresh
          </button>
          <button onClick={showCurrentStockLevels} className="stock-btn">
            📊 Show Stock Levels
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading stock information...</p>
        </div>
      ) : lowStockProducts.length === 0 ? (
        <div className="no-low-stock">
          <div className="success-icon">✅</div>
          <h4>All Products In Stock</h4>
          <p>No products are below the low stock threshold of {threshold} units.</p>
        </div>
      ) : (
        <div className="low-stock-list">
          <div className="alert-header">
            <span className="alert-icon">⚠️</span>
            <span className="alert-text">
              {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} 
              {' '}below stock threshold
            </span>
          </div>

          <div className="products-grid">
            {lowStockProducts.map((product) => (
              <div key={product._id} className="stock-card">
                <div className="product-info">
                  <h4>{product.name}</h4>
                  <p className="product-id">ID: {product._id}</p>
                </div>
                
                <div className="stock-info">
                  <div 
                    className="stock-level"
                    style={{ 
                      backgroundColor: getStockLevelColor(product.stock, threshold),
                      color: 'white'
                    }}
                  >
                    <span className="stock-count">{product.stock}</span>
                    <span className="stock-text">units</span>
                  </div>
                  
                  <div className="stock-status">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStockLevelColor(product.stock, threshold),
                        color: 'white'
                      }}
                    >
                      {getStockLevelText(product.stock, threshold)}
                    </span>
                  </div>
                </div>

                <div className="stock-actions">
                  <button className="btn-reorder">
                    📦 Reorder
                  </button>
                  <button className="btn-details">
                    📊 View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="stock-summary">
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Critical Stock:</span>
                <span className="stat-value critical">
                  {lowStockProducts.filter(p => p.stock <= threshold / 2).length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Out of Stock:</span>
                <span className="stat-value out-of-stock">
                  {lowStockProducts.filter(p => p.stock === 0).length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Low Stock:</span>
                <span className="stat-value">
                  {lowStockProducts.reduce((sum, p) => sum + p.stock, 0)} units
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMonitor;
