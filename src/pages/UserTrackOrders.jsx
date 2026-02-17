import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import './UserTrackOrders.css';

const UserTrackOrders = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    loadOrders();
    // Check if user is admin
    setIsAdmin(user?.role === 'admin');
  }, []);

  const loadOrders = () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      // Filter orders for current user (or show all if admin)
      const userOrders = isAdmin 
        ? savedOrders 
        : savedOrders.filter(order => 
            order.userId === user?.id || order.customerEmail === user?.email
          );
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = () => {
    if (!selectedOrder || !updateStatus) {
      alert('Please select a status');
      return;
    }

    try {
      // Update order in localStorage
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = savedOrders.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, status: updateStatus, updatedAt: new Date().toISOString() }
          : order
      );
      
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      // Update local state
      setOrders(updatedOrders);
      
      // Update selected order
      setSelectedOrder({ ...selectedOrder, status: updateStatus, updatedAt: new Date().toISOString() });
      
      // Close status update modal
      setShowStatusUpdate(false);
      setUpdateStatus('');
      
      // Show success message
      alert(`Order #${selectedOrder.id} status updated to ${updateStatus}`);
      
      // Create admin notification for status update
      if (isAdmin) {
        const adminNotification = {
          id: `NOTIF-${Date.now()}`,
          type: 'order_status_update',
          title: 'Order Status Updated',
          message: `Order #${selectedOrder.id} status changed to ${updateStatus}`,
          orderId: selectedOrder.id,
          oldStatus: selectedOrder.status,
          newStatus: updateStatus,
          updatedBy: user?.name || 'Admin',
          status: 'unread',
          createdAt: new Date().toISOString()
        };
        
        const existingNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        existingNotifications.unshift(adminNotification);
        localStorage.setItem('adminNotifications', JSON.stringify(existingNotifications));
        
        // Trigger admin notification event
        window.dispatchEvent(new CustomEvent('adminNotification', { detail: adminNotification }));
      }
      
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const openStatusUpdate = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setShowStatusUpdate(true);
  };

  const handleCancelOrder = () => {
    if (!orderToCancel) return;

    try {
      // Update order status to cancelled
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = savedOrders.map(order => 
        order.id === orderToCancel.id 
          ? { ...order, status: 'cancelled', cancelledAt: new Date().toISOString() }
          : order
      );
      
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      
      // Update local state
      setOrders(updatedOrders);
      
      // Create admin notification for order cancellation
      const adminNotification = {
        id: `NOTIF-${Date.now()}`,
        type: 'order_cancelled',
        title: 'Order Cancelled',
        message: `Order #${orderToCancel.id} has been cancelled`,
        orderId: orderToCancel.id,
        customerName: orderToCancel.customerName,
        customerPhone: orderToCancel.customerPhone,
        total: orderToCancel.total,
        cancelledBy: user?.name || 'Customer',
        status: 'unread',
        createdAt: new Date().toISOString()
      };
      
      const existingNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      existingNotifications.unshift(adminNotification);
      localStorage.setItem('adminNotifications', JSON.stringify(existingNotifications));
      
      // Trigger admin notification event
      window.dispatchEvent(new CustomEvent('adminNotification', { detail: adminNotification }));
      
      // Close modal and reset state
      setShowCancelConfirm(false);
      setOrderToCancel(null);
      
      // Show success message
      alert(`Order #${orderToCancel.id} has been cancelled successfully`);
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order. Please try again.');
    }
  };

  const openCancelConfirm = (order) => {
    setOrderToCancel(order);
    setShowCancelConfirm(true);
  };

  const closeCancelConfirm = () => {
    setShowCancelConfirm(false);
    setOrderToCancel(null);
  };

  const canEditOrCancel = (order) => {
    return order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'cancelled';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '#28a745';
      case 'processing': return '#ffc107';
      case 'shipped': return '#17a2b8';
      case 'cancelled': return '#dc3545';
      case 'pending': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '✅';
      case 'processing': return '⏳';
      case 'shipped': return '🚚';
      case 'cancelled': return '❌';
      case 'pending': return '⏸';
      default: return '📦';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'Delivered';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      default: return status || 'Unknown';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="user-track-orders">
        <div className="container">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-track-orders">
      <div className="container">
        <div className="track-orders-header">
          <h1>Track Your Orders</h1>
          <p>View and track all your orders</p>
        </div>

        <div className="orders-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by Order ID, Name, or Phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-controls">
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-icon">📦</div>
            <h2>No Orders Found</h2>
            <p>
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'You haven\'t placed any orders yet. Start shopping to see your orders here!'
              }
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/user-home')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            <div className="orders-count">
              <p>Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</p>
            </div>
            
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">
                      Placed on {formatDate(order.orderDate)} at {formatTime(order.orderDate)}
                    </p>
                  </div>
                  <div className="order-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusIcon(order.status)} {getStatusText(order.status)}
                    </span>
                  </div>
                </div>

                <div className="order-actions">
                  {isAdmin && canEditOrCancel(order) && (
                    <button 
                      className="btn btn-outline"
                      onClick={() => openStatusUpdate(order)}
                    >
                      Edit
                    </button>
                  )}
                  {canEditOrCancel(order) && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => openCancelConfirm(order)}
                    >
                      Cancel Order
                    </button>
                  )}
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleViewOrderDetails(order)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Order Confirmation Modal */}
      {showCancelConfirm && orderToCancel && (
        <div className="modal-overlay">
          <div className="modal cancel-modal">
            <div className="modal-header">
              <h3>Cancel Order</h3>
              <button 
                className="close-btn"
                onClick={closeCancelConfirm}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="cancel-warning">
                <div className="warning-icon">⚠️</div>
                <div className="warning-message">
                  <h4>Are you sure you want to cancel this order?</h4>
                  <p>Order #{orderToCancel.id}</p>
                  <p>This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="order-summary">
                <div className="summary-item">
                  <span>Customer:</span>
                  <span>{orderToCancel.customerName}</span>
                </div>
                <div className="summary-item">
                  <span>Phone:</span>
                  <span>{orderToCancel.customerPhone}</span>
                </div>
                <div className="summary-item">
                  <span>Total:</span>
                  <span>₹{orderToCancel.total}</span>
                </div>
                <div className="summary-item">
                  <span>Delivery:</span>
                  <span>{formatDate(orderToCancel.deliveryDate)} at {orderToCancel.deliveryTime}</span>
                </div>
                <div className="summary-item">
                  <span>Items:</span>
                  <span>{orderToCancel.items?.length || 0} items</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={closeCancelConfirm}
              >
                Keep Order
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleCancelOrder}
              >
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusUpdate && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal status-update-modal">
            <div className="modal-header">
              <h3>Update Order Status</h3>
              <button 
                className="close-btn"
                onClick={() => setShowStatusUpdate(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="status-update-form">
                <div className="form-group">
                  <label>Order ID:</label>
                  <div className="order-id-display">#{selectedOrder.id}</div>
                </div>
                <div className="form-group">
                  <label>Current Status:</label>
                  <div className="current-status">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                    >
                      {getStatusIcon(selectedOrder.status)} {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label>New Status:</label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="status-select"
                  >
                    <option value="">Select new status</option>
                    <option value="pending">⏸ Pending</option>
                    <option value="processing">⏳ Processing</option>
                    <option value="shipped">🚚 Shipped</option>
                    <option value="delivered">✅ Delivered</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Order Details:</label>
                  <div className="order-summary">
                    <div className="summary-item">
                      <span>Customer:</span>
                      <span>{selectedOrder.customerName}</span>
                    </div>
                    <div className="summary-item">
                      <span>Phone:</span>
                      <span>{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="summary-item">
                      <span>Total:</span>
                      <span>₹{selectedOrder.total}</span>
                    </div>
                    <div className="summary-item">
                      <span>Delivery:</span>
                      <span>{formatDate(selectedOrder.deliveryDate)} at {selectedOrder.deliveryTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={() => setShowStatusUpdate(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateOrderStatus}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal order-details-modal">
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder.id}</h3>
              <button 
                className="close-btn"
                onClick={closeOrderDetails}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="order-summary">
                <div className="summary-section">
                  <h4>Order Information</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="label">Order ID:</span>
                      <span className="value">{selectedOrder.id}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Status:</span>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                      >
                        {getStatusIcon(selectedOrder.status)} {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                    <div>
                      <span className="label">Order Date:</span>
                      <span className="value">{formatDate(selectedOrder.orderDate)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Order Time:</span>
                      <span className="value">{formatTime(selectedOrder.orderDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Customer Information</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="label">Name:</span>
                      <span className="value">{selectedOrder.customerName}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Phone:</span>
                      <span className="value">{selectedOrder.customerPhone}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Email:</span>
                      <span className="value">{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Address:</span>
                      <span className="value">{selectedOrder.deliveryAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Delivery Information</h4>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <span className="label">Delivery Date:</span>
                      <span className="value">{formatDate(selectedOrder.deliveryDate)}</span>
                    </div>
                    <div className="summary-item">
                      <span className="label">Delivery Time:</span>
                      <span className="value">{selectedOrder.deliveryTime}</span>
                    </div>
                    {selectedOrder.notes && (
                      <div className="summary-item full-width">
                        <span className="label">Notes:</span>
                        <span className="value">{selectedOrder.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Order Items</h4>
                  <div className="items-list">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="order-item-detail">
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">x{item.quantity}</span>
                        </div>
                        <div className="item-price">
                          ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="summary-section total-section">
                  <div className="summary-item total">
                    <span className="label">Total Amount:</span>
                    <span className="value">₹{selectedOrder.total}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-outline"
                onClick={closeOrderDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTrackOrders;
