import React, { useState, useEffect } from 'react';
import { getStoredUser } from '../services/authService.js';
import { getUserOrders } from '../services/orderService.js';
import { PageWrapper, PageContent, Card, CardBody } from '../components/Layout.jsx';
import './TrackOrders.css';

const TrackOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getStoredUser();

  useEffect(() => {
    const fetchUserOrders = async () => {
      try {
        if (!user?.id) {
          setError('User not found. Please login again.');
          setLoading(false);
          return;
        }

        console.log('🔍 FRONTEND: Fetching orders for user:', user.id);
        console.log('🔍 FRONTEND: User email:', user.email);
        console.log('🔍 FRONTEND: Calling API endpoint: /orders/my');
        
        const response = await getUserOrders(user.id);
        
        console.log('🔍 FRONTEND: API Response:', response);
        console.log('🔍 FRONTEND: Orders from API:', response.orders);
        console.log('🔍 FRONTEND: Orders count:', response.orders?.length);
        
        // Log each order from frontend
        if (response.orders) {
          response.orders.forEach((order, index) => {
            console.log(`🔍 FRONTEND: Order ${index}:`, {
              orderId: order.orderId,
              customerName: order.customerName,
              total: order.total,
              userId: order.userId,
              userEmail: order.userEmail
            });
          });
        }
        
        setOrders(response.orders || []);
        setLoading(false);
      } catch (error) {
        console.error('🔍 FRONTEND: Failed to fetch user orders:', error);
        setError(error.message || 'Failed to load your orders');
        setLoading(false);
      }
    };

    fetchUserOrders();
  }, [user?.id]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return '#007bff';
      case 'processing':
        return '#ffc107';
      case 'shipped':
        return '#17a2b8';
      case 'delivered':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <PageWrapper>
        <PageContent>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </PageContent>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <PageContent>
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Error Loading Orders</h3>
            <p>{error}</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </PageContent>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PageContent>
        <div className="track-orders-container">
          <div className="orders-header">
            <div>
              <div className="kicker">Your order history</div>
              <h2>My Orders</h2>
              <p className="orders-count">
                {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
              </p>
            </div>
            <button 
              className="btn btn-outline"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="no-orders">
              <div className="no-orders-icon">📦</div>
              <h3>No Orders Found</h3>
              <p>You haven't placed any orders yet.</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/user-home'}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="orders-table">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Order Date</th>
                      <th>Delivery Date</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id || order.orderId}>
                        <td className="order-id">
                          <strong>{order.orderId || order._id}</strong>
                        </td>
                        <td>
                          <div className="date-info">
                            <span>{formatDate(order.orderDate)}</span>
                            <small>{formatTime(order.orderDate)}</small>
                          </div>
                        </td>
                        <td>
                          <div className="date-info">
                            <span>{formatDate(order.deliveryDate)}</span>
                            <small>{order.deliveryTime || 'N/A'}</small>
                          </div>
                        </td>
                        <td className="amount">
                          <strong>₹{order.total}</strong>
                        </td>
                        <td>
                          <span 
                            className="status-badge"
                            style={{ 
                              backgroundColor: getStatusColor(order.status),
                              color: 'white'
                            }}
                          >
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="items-count">
                          {order.items?.length || 0} items
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </PageContent>
    </PageWrapper>
  );
};

export default TrackOrders;
