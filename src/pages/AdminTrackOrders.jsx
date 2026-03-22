import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { getAllOrders, updateOrderStatusWithStock } from '../services/orderService.js';

const AdminTrackOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
    
    // Listen for order cancellation events from UserTrackOrders
    const handleOrderCancellation = (event) => {
      console.log('📦 Admin received order cancellation event:', event.detail);
      
      // Update the specific order in local state
      setOrders(prevOrders => 
        prevOrders.map(order => {
          const orderId = event.detail.orderId;
          const orderKey = order.orderId || order._id || order.id;
          
          if (orderKey === orderId) {
            console.log('📦 Updating order status to cancelled:', orderKey);
            return {
              ...order,
              status: 'cancelled',
              cancelledAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          }
          return order;
        })
      );
    };
    
    // Listen for admin notifications
    const handleAdminNotification = (event) => {
      console.log('📦 Admin received notification:', event.detail);
      
      // Refresh orders to get the latest status
      fetchOrders();
    };
    
    // Add event listeners
    window.addEventListener('orderCancellation', handleOrderCancellation);
    window.addEventListener('adminNotification', handleAdminNotification);
    
    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('orderCancellation', handleOrderCancellation);
      window.removeEventListener('adminNotification', handleAdminNotification);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📦 Fetching all orders for admin...');
      
      const response = await getAllOrders();
      console.log('📦 Orders response:', response);
      
      if (response.success && response.orders) {
        setOrders(response.orders);
        console.log('📦 Loaded orders:', response.orders.length);
      } else if (response.orders) {
        setOrders(response.orders);
        console.log('📦 Loaded orders:', response.orders.length);
      } else {
        console.warn('📦 Unexpected response format:', response);
        setOrders([]);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('📦 Error fetching orders:', error);
      
      if (error.code === 'NETWORK_ERROR') {
        setError('Network error. Unable to connect to server.');
      } else if (error.response?.status === 401) {
        setError('Unauthorized. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        const errorMessage = error.message || 'Failed to load orders. Please try again.';
        setError(errorMessage);
      }
      
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      console.log('📦 Updating order status:', orderId, 'to:', newStatus);
      console.log('📦 Order ID type:', typeof orderId);
      console.log('📦 Order ID length:', orderId?.length);
      
      // Find the current order to get previous status and details
      const currentOrder = orders.find(order => (order.orderId || order._id) === orderId);
      const previousStatus = currentOrder?.status;
      
      console.log('📦 Previous status:', previousStatus);
      console.log('📦 Order details:', currentOrder);
      
      // Use the new stock-aware status update function
      const response = await updateOrderStatusWithStock(orderId, newStatus, previousStatus, currentOrder);
      console.log('📦 Update response:', response);
      
      // Update local state with stock processing info
      setOrders(orders.map(order => {
        const orderKey = order.orderId || order._id;
        if (orderKey === orderId) {
          return { 
            ...order, 
            status: newStatus, 
            updatedAt: new Date().toISOString(),
            stockProcessed: response.stockUpdate?.success ? true : order.stockProcessed,
            lastStockUpdate: response.stockUpdate ? new Date().toISOString() : order.lastStockUpdate
          };
        }
        return order;
      }));
      
      // Show success message with stock update info
      if (response.stockUpdate?.success) {
        console.log('📦 Stock updated successfully:', response.stockUpdate.message);
        console.log('📦 Stock updates performed:', response.stockUpdate.updates);
        
        // Show detailed stock reduction info
        response.stockUpdate.updates?.forEach((update, index) => {
          console.log(`📦 Item ${index + 1}: ${update.productName} - Quantity: ${update.quantity}`);
        });
        
        // You could add a toast notification here
        alert(`✅ Order status updated to ${newStatus}\n📦 Stock reduced for ${response.stockUpdate.updates?.length || 0} products`);
      } else {
        console.log('📦 Order status updated (no stock changes needed)');
        alert(`✅ Order status updated to ${newStatus}`);
      }
      
      console.log('📦 Order status updated successfully');
    } catch (error) {
      console.error('📦 Error updating order status:', error);
      console.error('📦 Error response:', error.response);
      
      // Show more specific error messages
      let errorMessage = 'Failed to update order status. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'placed':
        return '#007bff'; // blue
      case 'processing':
        return '#ffc107'; // yellow
      case 'shipped':
        return '#17a2b8'; // cyan
      case 'delivered':
        return '#28a745'; // green
      case 'cancelled':
        return '#dc3545'; // red
      default:
        return '#6c757d'; // gray
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout active="track-orders" title="Track Orders">
      <div className="admin-table">
        <div className="admin-table-head">
          <div>
            <div className="kicker">Order management</div>
            <h2>Track All Orders</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={fetchOrders}>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem', padding: '1rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>No orders found</div>
            <div style={{ color: '#666', fontSize: '1rem' }}>No orders have been placed yet.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Order ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Customer</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Products</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Total</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Date</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#333' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                      #{order.orderId || order._id?.slice(-8)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#555' }}>
                      {order.customerName || order.userName || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#555' }}>
                      {order.customerEmail || order.userEmail || 'N/A'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#555' }}>
                      {order.items?.length || 0} items
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                      ₹{order.totalAmount || order.total || 0}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        backgroundColor: getStatusColor(order.status),
                        color: 'white'
                      }}
                    >
                      {order.status || 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#555', fontSize: '0.9rem' }}>
                      {formatDate(order.createdAt)}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.orderId || order._id, e.target.value)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        border: '1px solid #dee2e6',
                        borderRadius: '0.25rem',
                        fontSize: '0.875rem',
                        minWidth: '120px'
                      }}
                    >
                      <option value="placed">Placed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {updatingOrderId === (order.orderId || order._id) && (
                      <div style={{ color: '#007bff', fontSize: '0.8rem' }}>Updating...</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTrackOrders;
