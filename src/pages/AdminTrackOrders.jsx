import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { getAllOrders, updateOrderStatus } from '../services/orderService.js';

const AdminTrackOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
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
      
      const response = await updateOrderStatus(orderId, newStatus);
      console.log('📦 Update response:', response);
      
      // Update local state regardless of response format
      setOrders(orders.map(order => {
        const orderKey = order.orderId || order._id;
        if (orderKey === orderId) {
          return { ...order, status: newStatus, updatedAt: new Date().toISOString() };
        }
        return order;
      }));
      console.log('📦 Order status updated successfully');
    } catch (error) {
      console.error('📦 Error updating order status:', error);
      console.error('📦 Error response:', error.response);
      setError('Failed to update order status. Please try again.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#ffc107'; // yellow
      case 'confirmed':
        return '#17a2b8'; // blue
      case 'processing':
        return '#6f42c1'; // purple
      case 'shipped':
        return '#fd7e14'; // orange
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
                      {order.products?.length || 0} items
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
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                      <select
                        value={order.status || 'pending'}
                        onChange={(e) => handleStatusUpdate(order.orderId || order._id, e.target.value)}
                        disabled={updatingOrderId === (order.orderId || order._id)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '0.25rem',
                          border: '1px solid #ddd',
                          fontSize: '0.9rem',
                          minWidth: '120px'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {updatingOrderId === (order.orderId || order._id) && (
                        <div style={{ color: '#007bff', fontSize: '0.8rem' }}>Updating...</div>
                      )}
                    </div>
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
