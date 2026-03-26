import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { getAllOrders, updateOrderStatusWithStock } from '../services/orderService.js';
import './AdminTrackOrders.css';

const AdminTrackOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Sorting state
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  useEffect(() => {
    fetchOrders();

    const handleOrderCancellation = (event) => {
      setOrders(prevOrders =>
        prevOrders.map(order => {
          const orderId = event.detail.orderId;
          const orderKey = order.orderId || order._id || order.id;
          if (orderKey === orderId) {
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

    const handleAdminNotification = () => fetchOrders();

    window.addEventListener('orderCancellation', handleOrderCancellation);
    window.addEventListener('adminNotification', handleAdminNotification);

    return () => {
      window.removeEventListener('orderCancellation', handleOrderCancellation);
      window.removeEventListener('adminNotification', handleAdminNotification);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getAllOrders();
      if (response.success && response.orders) {
        setOrders(response.orders);
      } else if (response.orders) {
        setOrders(response.orders);
      } else {
        setOrders([]);
        setError('Invalid response format from server');
      }
    } catch (error) {
      if (error.code === 'NETWORK_ERROR') setError('Network error. Unable to connect to server.');
      else if (error.response?.status === 401) setError('Unauthorized. Please login again.');
      else if (error.response?.status === 403) setError('Access denied. Admin privileges required.');
      else setError(error.message || 'Failed to load orders.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const currentOrder = orders.find(order => (order.orderId || order._id) === orderId);
      const previousStatus = currentOrder?.status;

      const response = await updateOrderStatusWithStock(orderId, newStatus, previousStatus, currentOrder);

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

    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
      // Small timeout to let UI settle before removing loading state 
      setTimeout(() => setUpdatingOrderId(null), 500);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedOrders = useMemo(() => {
    let sortableItems = [...orders];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];

        // Handle nested or computed objects manually
        if (sortConfig.key === 'idDisplay') {
          aVal = a.orderId || a._id;
          bVal = b.orderId || b._id;
        } else if (sortConfig.key === 'customerName') {
          aVal = a.customerName || a.userName || '';
          bVal = b.customerName || b.userName || '';
        } else if (sortConfig.key === 'totalAmount') {
          aVal = parseFloat(a.totalAmount || a.total || 0);
          bVal = parseFloat(b.totalAmount || b.total || 0);
        } else if (sortConfig.key === 'createdAt') {
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [orders, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <span className="sort-icon neutral">↕</span>;
    return sortConfig.direction === 'asc' ?
      <span className="sort-icon active">↑</span> :
      <span className="sort-icon active">↓</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'placed') return 's-placed';
    if (s === 'processing') return 's-processing';
    if (s === 'shipped') return 's-shipped';
    if (s === 'delivered') return 's-delivered';
    if (s === 'cancelled') return 's-cancelled';
    if (s === 'cancellation_requested') return 's-cancellation-requested';
    return 's-pending';
  };

  return (
    <AdminLayout active="track-orders" title="Track Orders">
      <div className="admin-table-wrapper">
        <div className="orders-header-row">
          <div className="orders-title-block">
            <span className="orders-kicker">Order Database</span>
            <h2>Track All Orders</h2>
          </div>
          <button className="sync-orders-btn" onClick={fetchOrders} disabled={loading}>
            {loading ? 'Syncing...' : '↻ Sync Data'}
          </button>
        </div>

        {error && <div className="orders-error-alert">{error}</div>}

        <div className="table-responsive-container">
          {loading ? (
            <div className="orders-loader">Loading logistics data...</div>
          ) : orders.length === 0 ? (
            <div className="orders-empty-state">
              <h3>No Orders Found</h3>
              <p>The system has not logged any wholesale transactions yet.</p>
            </div>
          ) : (
            <table className="interactive-orders-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('idDisplay')}>Order ID {getSortIcon('idDisplay')}</th>
                  <th onClick={() => requestSort('customerName')}>Customer {getSortIcon('customerName')}</th>
                  <th>Email</th>
                  <th>Products</th>
                  <th onClick={() => requestSort('totalAmount')}>Total {getSortIcon('totalAmount')}</th>
                  <th onClick={() => requestSort('status')}>Status {getSortIcon('status')}</th>
                  <th onClick={() => requestSort('createdAt')}>Date {getSortIcon('createdAt')}</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => {
                  const idDisplay = order.orderId || order._id?.slice(-8);
                  const isUpdating = updatingOrderId === (order.orderId || order._id);

                  return (
                    <tr key={order._id} className={`table-row-hover ${isUpdating ? 'row-updating' : ''}`}>
                      <td className="fw-bold">#{idDisplay}</td>
                      <td>{order.customerName || order.userName || 'N/A'}</td>
                      <td className="text-muted">{order.customerEmail || order.userEmail || 'N/A'}</td>
                      <td><span className="item-count-badge">{order.items?.length || 0} items</span></td>
                      <td className="amount-col">₹{parseFloat(order.totalAmount || order.total || 0).toLocaleString()}</td>
                      <td>
                        <div className={`status-pill ${getStatusClass(order.status)}`}>
                          {order.status === 'cancellation_requested' ? 'Cancel Req.' : (order.status || 'Pending')}
                        </div>
                      </td>
                      <td className="date-col">{formatDate(order.createdAt)}</td>
                      <td className="action-col">
                        <div className="custom-select-wrapper">
                          <select
                            className={`status-dropdown ${getStatusClass(order.status)}`}
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.orderId || order._id, e.target.value)}
                            disabled={isUpdating}
                          >
                            <option value="placed" className="opt-placed">Placed</option>
                            <option value="pending" className="opt-pending">Pending</option>
                            <option value="processing" className="opt-processing">Processing</option>
                            <option value="shipped" className="opt-shipped">Shipped</option>
                            <option value="delivered" className="opt-delivered">Delivered</option>
                            <option value="cancellation_requested" className="opt-cancellation-requested">Cancel Req.</option>
                            <option value="cancelled" className="opt-cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTrackOrders;
