import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { getUserOrders, updateOrderStatusWithStock } from '../services/orderService.js';
import { PageWrapper, PageContent } from '../components/Layout.jsx';
import UserNavbar from '../components/UserNavbar.jsx';
import './UserTrackOrders.css';

const UserTrackOrders = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null); // Newly added for smooth expand
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    // Clear any test data from localStorage
    localStorage.removeItem('orders');

    loadOrders();
    // Check if user is admin
    setIsAdmin(user?.role === 'admin');
  }, [user?.id]);

  const loadOrders = async () => {
    try {
      console.log('🔍 UserTrackOrders: Fetching orders for user:', user.id);

      if (!user?.id) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await getUserOrders(user.id);
      console.log('🔍 UserTrackOrders: API Response:', response);
      console.log('🔍 UserTrackOrders: Orders from API:', response.orders);

      // Debug: Log each order's status
      if (response.orders) {
        response.orders.forEach((order, index) => {
          console.log(`🔍 Order ${index}:`, {
            id: order.id || order._id || order.orderId,
            status: order.status,
            customerName: order.customerName,
            rawOrder: order
          });
        });
      }

      setOrders(response.orders || []);
      setLoading(false);
    } catch (error) {
      console.error('🔍 UserTrackOrders: Error loading orders from API:', error);
      console.warn('🔍 UserTrackOrders: Backend not available, using localStorage fallback');

      // Fallback to localStorage when backend is not available
      try {
        const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        console.log('🔍 UserTrackOrders: Loaded orders from localStorage:', localOrders.length);

        // Filter orders for current user
        const userOrders = localOrders.filter(order =>
          order.userId === user.id || order.customerId === user.id || order.userEmail === user.email
        );

        console.log('🔍 UserTrackOrders: Filtered orders for current user:', userOrders.length);

        // Debug: Log each order's status
        if (userOrders) {
          userOrders.forEach((order, index) => {
            console.log(`🔍 [LOCAL] Order ${index}:`, {
              id: order.id || order._id || order.orderId,
              status: order.status,
              customerName: order.customerName,
              rawOrder: order
            });
          });
        }

        setOrders(userOrders);
        setLoading(false);

        if (userOrders.length === 0) {
          console.log('🔍 UserTrackOrders: No orders found in localStorage, creating sample data');
          // Create sample order data for testing
          const sampleOrders = [
            {
              id: 'ORD-001',
              orderId: 'ORD-001',
              userId: user.id,
              customerName: user.name || 'Test User',
              customerPhone: '9876543210',
              customerEmail: user.email || 'test@example.com',
              status: 'placed',
              orderDate: new Date().toISOString(),
              deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              deliveryTime: '10:30 AM',
              deliveryAddress: '123 Main St, Chennai, TamilNadu',
              total: 750,
              totalAmount: 750,
              items: [
                {
                  name: 'Rice 5kg',
                  productName: 'Rice 5kg',
                  quantity: 2,
                  price: 250,
                  unitPrice: 250
                },
                {
                  name: 'Sugar 1kg',
                  productName: 'Sugar 1kg',
                  quantity: 3,
                  price: 150,
                  unitPrice: 50
                },
                {
                  name: 'Oil 1L',
                  productName: 'Oil 1L',
                  quantity: 1,
                  price: 120,
                  unitPrice: 120
                }
              ]
            },
            {
              id: 'ORD-002',
              orderId: 'ORD-002',
              userId: user.id,
              customerName: user.name || 'Test User',
              customerPhone: '9876543210',
              customerEmail: user.email || 'test@example.com',
              status: 'processing',
              orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              deliveryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
              deliveryTime: '2:00 PM',
              deliveryAddress: '456 Oak Ave, Chennai, TamilNadu',
              total: 520,
              totalAmount: 520,
              items: [
                {
                  name: 'Wheat Flour 2kg',
                  productName: 'Wheat Flour 2kg',
                  quantity: 1,
                  price: 120,
                  unitPrice: 120
                },
                {
                  name: 'Dal 1kg',
                  productName: 'Dal 1kg',
                  quantity: 4,
                  price: 80,
                  unitPrice: 20
                }
              ]
            },
            {
              id: 'ORD-003',
              orderId: 'ORD-003',
              userId: user.id,
              customerName: user.name || 'Test User',
              customerPhone: '9876543210',
              customerEmail: user.email || 'test@example.com',
              status: 'shipped',
              orderDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
              deliveryDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString().split('T')[0],
              deliveryTime: '11:00 AM',
              deliveryAddress: '789 Pine St, Chennai, TamilNadu',
              total: 380,
              totalAmount: 380,
              items: [
                {
                  name: 'Tea Powder 250g',
                  productName: 'Tea Powder 250g',
                  quantity: 2,
                  price: 190,
                  unitPrice: 95
                }
              ]
            }
          ];

          console.log('🔍 UserTrackOrders: Created sample orders for testing');
          setOrders(sampleOrders);
          setLoading(false);
        }

      } catch (localError) {
        console.error('🔍 UserTrackOrders: Error loading from localStorage:', localError);
        setError('Failed to load orders. Please refresh the page.');
        setOrders([]);
        setLoading(false);
      }
    }
  };

  const handleUpdateOrderStatus = async () => {
    if (!selectedOrder || !updateStatus) {
      alert('Please select a status');
      return;
    }

    try {
      setError('');
      const orderId = selectedOrder.orderId || selectedOrder._id || selectedOrder.id;
      const previousStatus = selectedOrder.status;

      console.log('📦 User updating order status:', orderId, 'to:', updateStatus);
      console.log('📦 Previous status:', previousStatus);

      // Use the stock-aware status update function
      const response = await updateOrderStatusWithStock(orderId, updateStatus, previousStatus, selectedOrder);
      console.log('📦 Update response:', response);

      // Update local state with stock processing info
      const updatedOrder = {
        ...selectedOrder,
        status: updateStatus,
        updatedAt: new Date().toISOString(),
        stockProcessed: response.stockUpdate?.success ? true : selectedOrder.stockProcessed,
        lastStockUpdate: response.stockUpdate ? new Date().toISOString() : selectedOrder.lastStockUpdate
      };

      setOrders(orders.map(order =>
        (order.orderId || order._id || order.id) === orderId ? updatedOrder : order
      ));

      // Update selected order
      setSelectedOrder(updatedOrder);

      // Close status update modal
      setShowStatusUpdate(false);
      setUpdateStatus('');

      // Show success message with stock update info
      let successMessage = `Order #${orderId} status updated to ${updateStatus}`;
      if (response.stockUpdate?.success) {
        successMessage += `. ${response.stockUpdate.message}`;
      }
      alert(successMessage);

    } catch (error) {
      console.error('📦 Error updating order status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update order status';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleCancelOrder = async () => {
    console.log('📦 [DEBUG] handleCancelOrder called');
    console.log('📦 [DEBUG] orderToCancel:', orderToCancel);
    console.log('📦 [DEBUG] typeof orderToCancel:', typeof orderToCancel);

    if (!orderToCancel) {
      console.error('🔍 [ERROR] No order to cancel - orderToCancel is undefined');
      alert('Error: No order selected for cancellation. Please try again.');
      return;
    }

    // Additional validation
    if (!orderToCancel.id && !orderToCancel._id && !orderToCancel.orderId) {
      console.error('🔍 [ERROR] Order has no valid ID:', orderToCancel);
      alert('Error: Invalid order data. Please refresh the page and try again.');
      return;
    }

    if (!orderToCancel.status) {
      console.error('🔍 [ERROR] Order has no status:', orderToCancel);
      alert('Error: Order status is missing. Please refresh the page and try again.');
      return;
    }

    console.log('📦 [DEBUG] All validations passed, proceeding with cancellation');

    try {
      setError('');
      const orderId = orderToCancel.orderId || orderToCancel._id || orderToCancel.id;
      const previousStatus = orderToCancel.status;

      console.log('📦 User cancelling order:', orderId);
      console.log('📦 Previous status:', previousStatus);
      console.log('📦 Order details:', orderToCancel);

      // Check if order can be cancelled before proceeding
      const canCancel = canCancelOrder(orderToCancel);
      console.log('📦 Can cancel this order:', canCancel);

      if (!canCancel) {
        const status = (orderToCancel.status || '').toLowerCase().trim();
        alert(`Cannot cancel order with status: "${status}". Orders can only be cancelled when status is "pending", "placed", or "processing".`);
        return;
      }

      const currentStatus = (orderToCancel.status || '').toLowerCase().trim();
      const newStatus = currentStatus === 'pending' ? 'cancelled' : 'cancellation_requested';

      console.log(`📦 [DEBUG] About to call updateOrderStatusWithStock`);

      // Try to use the stock-aware status update function first
      try {
        console.log(`📦 Attempting to cancel order via API... Status: ${newStatus}`);
        const response = await updateOrderStatusWithStock(orderId, newStatus, previousStatus, orderToCancel);
        console.log('📦 Cancel response (API):', response);

        if (!response.success) {
          throw new Error(response.message || 'Failed to cancel order');
        }

        console.log('📦 [DEBUG] API call successful, updating local state');

        // Update local state with stock processing info
        const updatedOrder = {
          ...orderToCancel,
          status: newStatus,
          ...(newStatus === 'cancelled' ? { cancelledAt: new Date().toISOString() } : {}),
          stockProcessed: response.stockUpdate?.success ? true : orderToCancel.stockProcessed,
          lastStockUpdate: response.stockUpdate ? new Date().toISOString() : orderToCancel.lastStockUpdate
        };

        console.log('📦 Updating local state for order:', orderId);
        console.log('📦 Updated order object:', updatedOrder);

        setOrders(prevOrders => {
          const updatedOrders = prevOrders.map(order => {
            const currentOrderId = order.id || order._id || order.orderId;
            console.log(`📦 Checking order ${currentOrderId} against cancelled order ${orderId}`);
            if (currentOrderId === orderId) {
              console.log('📦 Found matching order, updating status to cancelled');
              return updatedOrder;
            }
            return order;
          });

          console.log('📦 Orders after update:', updatedOrders);
          return updatedOrders;
        });

        console.log('📦 [DEBUG] Local state updated successfully');

        // Create admin notification for order cancellation
        const adminNotification = {
          id: `NOTIF-${Date.now()}`,
          type: newStatus === 'cancelled' ? 'order_cancelled' : 'cancellation_requested',
          title: newStatus === 'cancelled' ? 'Order Cancelled' : 'Cancellation Requested',
          message: newStatus === 'cancelled'
            ? `Order #${orderId} has been cancelled by customer`
            : `Customer requested cancellation for Order #${orderId}`,
          orderId: orderId,
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

        console.log('📦 [DEBUG] About to close modal and reset state');

        // Close modal and reset state
        setShowCancelConfirm(false);
        setOrderToCancel(null);

        // Show success message with stock restoration info
        let successMessage = newStatus === 'cancelled'
          ? `✅ Order #${orderId} has been cancelled successfully!\n\n`
          : `✅ Cancellation request for Order #${orderId} has been sent to Admin!\n\n`;
        successMessage += `📋 Order Details:\n`;
        successMessage += `• Customer: ${orderToCancel.customerName}\n`;
        successMessage += `• Total Amount: ₹${orderToCancel.total || orderToCancel.totalAmount || 0}\n`;
        successMessage += `• Items: ${orderToCancel.items?.length || 0} items\n`;
        successMessage += `• Status: Changed to "${newStatus === 'cancelled' ? 'Cancelled' : 'Cancellation Requested'}"\n`;

        if (response.stockUpdate?.success) {
          successMessage += `\n📦 Stock Management:\n`;
          successMessage += `• ${response.stockUpdate.message}\n`;
          if (response.stockUpdate.updates) {
            successMessage += `• Stock restored for ${response.stockUpdate.updates.length} products\n`;
          }
        }

        successMessage += `\n📧 Admin has been notified about this cancellation.`;

        console.log('📦 [DEBUG] Showing success message');
        alert(successMessage);

      } catch (apiError) {
        console.warn('📦 Backend API not available, using localStorage fallback:', apiError.message);

        // Fallback to localStorage when backend is not available
        console.log('📦 Using localStorage fallback for order cancellation');

        // Update order in localStorage
        const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        console.log('📦 LocalStorage orders before update:', localOrders.length);

        const updatedLocalOrders = localOrders.map(order => {
          const currentOrderId = order.id || order._id || order.orderId;
          console.log(`📦 [LOCAL] Checking order ${currentOrderId} against cancelled order ${orderId}`);

          if (currentOrderId === orderId) {
            console.log(`📦 [LOCAL] Found matching order, updating status to ${newStatus}`);
            return { ...order, status: newStatus, ...(newStatus === 'cancelled' ? { cancelledAt: new Date().toISOString() } : {}) };
          }
          return order;
        });

        localStorage.setItem('orders', JSON.stringify(updatedLocalOrders));
        console.log('📦 [LOCAL] Updated orders in localStorage:', updatedLocalOrders.length);

        // Update local state
        console.log('📦 [LOCAL] Updating React state with cancelled orders');
        setOrders(updatedLocalOrders);

        // Create admin notification
        const adminNotification = {
          id: `NOTIF-${Date.now()}`,
          type: newStatus === 'cancelled' ? 'order_cancelled' : 'cancellation_requested',
          title: newStatus === 'cancelled' ? 'Order Cancelled' : 'Cancellation Requested',
          message: newStatus === 'cancelled'
            ? `Order #${orderId} has been cancelled by customer (Local Mode)`
            : `Customer requested cancellation for Order #${orderId} (Local Mode)`,
          orderId: orderId,
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
        let successMessage = newStatus === 'cancelled'
          ? `✅ Order #${orderId} has been cancelled successfully!\n\n`
          : `✅ Cancellation request for Order #${orderId} has been sent to Admin!\n\n`;
        successMessage += `📋 Order Details:\n`;
        successMessage += `• Customer: ${orderToCancel.customerName}\n`;
        successMessage += `• Total Amount: ₹${orderToCancel.total || orderToCancel.totalAmount || 0}\n`;
        successMessage += `• Items: ${orderToCancel.items?.length || 0} items\n`;
        successMessage += `• Status: Changed to "${newStatus === 'cancelled' ? 'Cancelled' : 'Cancellation Requested'}"\n`;
        successMessage += `\n📦 Note: Running in offline mode - backend not available`;
        successMessage += `\n📧 Admin has been notified about this cancellation.`;

        alert(successMessage);

      }

    } catch (error) {
      console.error('📦 [ERROR] Error cancelling order:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to cancel order';
      console.log('📦 [ERROR] Error details:', {
        message: errorMessage,
        stack: error.stack,
        response: error.response?.data
      });

      setError(errorMessage);
      alert(`Error: ${errorMessage}\n\nPlease check the console (F12) for more details.`);
    }
  };

  const openStatusUpdate = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.status);
    setShowStatusUpdate(true);
  };

  const openCancelConfirm = (order) => {
    console.log('📦 Opening cancel confirmation for order:', order);
    setOrderToCancel(order);
    setShowCancelConfirm(true);
  };

  const closeCancelConfirm = () => {
    setShowCancelConfirm(false);
    setOrderToCancel(null);
  };

  const canEditOrCancel = (order) => {
    // Allow edit/cancel only for 'placed' and 'processing' statuses
    return order.status === 'placed' || order.status === 'processing';
  };

  const canCancelOrder = (order) => {
    // Specific function for cancellation - pending, placed and processing
    const status = (order.status || '').toLowerCase().trim();
    const orderId = order.id || order._id || order.orderId;

    console.log(`🔍 [DEBUG] Checking cancellation for order ${orderId}:`);
    console.log(`🔍 [DEBUG] - Raw status: "${order.status}"`);
    console.log(`🔍 [DEBUG] - Normalized status: "${status}"`);
    console.log(`🔍 [DEBUG] - Order object:`, order);

    const canCancel = status === 'pending' || status === 'placed' || status === 'processing';
    console.log(`🔍 [DEBUG] - Can cancel: ${canCancel}`);
    console.log(`🔍 [DEBUG] - Status check: "${status}" === "pending" = ${status === 'pending'}`);
    console.log(`🔍 [DEBUG] - Status check: "${status}" === "placed" = ${status === 'placed'}`);
    console.log(`🔍 [DEBUG] - Status check: "${status}" === "processing" = ${status === 'processing'}`);

    return canCancel;
  };

  const getNormalizedStatus = (order) => {
    // Normalize status to handle various formats
    let status = order.status || 'placed'; // Default to 'placed' if no status

    // Handle various status formats
    if (typeof status === 'string') {
      status = status.toLowerCase().trim();

      // Map common variations to standard statuses
      const statusMap = {
        'confirmed': 'processing',
        'preparing': 'processing',
        'ready': 'shipped',
        'on the way': 'shipped',
        'out for delivery': 'shipped',
        'complete': 'delivered',
        'finished': 'delivered'
      };

      if (statusMap[status]) {
        status = statusMap[status];
      }
    }

    console.log(`🔍 Normalized status for order ${order.id || order._id}: "${order.status}" → "${status}"`);
    return status;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '#28a745';
      case 'processing': return '#ffc107';
      case 'shipped': return '#17a2b8';
      case 'cancelled': return '#dc3545';
      case 'placed': return '#007bff';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return '✅';
      case 'processing': return '⏳';
      case 'shipped': return '🚚';
      case 'cancelled': return '❌';
      case 'placed': return '📝';
      case 'pending': return '⏳';
      default: return '📦';
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'Delivered';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'cancelled': return 'Cancelled';
      case 'placed': return 'Placed';
      case 'pending': return 'Pending';
      default: return status || 'Unknown';
    }
  };

  const filteredOrders = orders.filter(order => {
    const normalizedStatus = getNormalizedStatus(order);
    const matchesStatus = filterStatus === 'all' || normalizedStatus === filterStatus;

    // Improved search logic
    let query = searchQuery.toLowerCase().trim();
    if (!query) return matchesStatus;

    // Handle leading '#' commonly used in the UI
    if (query.startsWith('#')) query = query.slice(1);

    const orderIdFull = (order.orderId || order._id || order.id || '').toString().toLowerCase();
    const customerName = (order.customerName || '').toLowerCase();
    const customerPhone = (order.customerPhone || '').toLowerCase();

    // Check if any product name matches
    const matchesProducts = order.items?.some(item =>
      (item.name || item.productName || '').toLowerCase().includes(query)
    );

    const matchesSearch =
      orderIdFull.includes(query) ||
      customerName.includes(query) ||
      customerPhone.includes(query) ||
      matchesProducts;

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
            <p>Loading your logistics data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Visual Stepper Render Engine
  const renderStepper = (currentStatus) => {
    const statusSequence = ['pending', 'placed', 'processing', 'shipped', 'delivered'];

    // Normalize mapping
    let nStatus = currentStatus?.toLowerCase() || 'pending';
    if (nStatus === 'confirmed') nStatus = 'processing';
    if (nStatus === 'ready' || nStatus === 'on the way' || nStatus === 'out for delivery') nStatus = 'shipped';

    // Check if cancelled
    if (nStatus === 'cancelled') {
      return (
        <div className="stepper-cancelled-flag">
          <span className="fail-icon">✕</span>
          Order Cancelled
        </div>
      );
    }

    let currentIndex = statusSequence.indexOf(nStatus);
    if (currentIndex === -1) currentIndex = 1; // fallback to placed

    return (
      <div className="modern-stepper">
        {statusSequence.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;
          const isLast = idx === statusSequence.length - 1;

          return (
            <div key={step} className={`step-segment ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
              <div className="step-point">
                <div className="step-circle">{isCompleted ? '✓' : ''}</div>
                {!isLast && <div className="step-line"></div>}
              </div>
              <span className="step-label">{step.charAt(0).toUpperCase() + step.slice(1)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <PageWrapper>
      <UserNavbar />
      <PageContent>
        <div className="modern-tracking-layout">
          <div className="tracking-header-sec">
            <h1>Logistics Tracker</h1>
            <p className="subtitle">Real-time mapping of your wholesale pipeline</p>
          </div>

          <div className="tracking-toolbar slide-fade-in">
            <div className="search-pill">
              <span className="s-icon">🔍</span>
              <input
                type="text"
                placeholder="Search order ID or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filter-pill">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Global Pipeline (All)</option>
                <option value="placed">Newly Placed</option>
                <option value="processing">In Processing</option>
                <option value="shipped">In Transit (Shipped)</option>
                <option value="delivered">Completed (Delivered)</option>
                <option value="cancelled">Voided (Cancelled)</option>
              </select>
            </div>
          </div>

          <div className="tracking-stack">
            {filteredOrders.length === 0 ? (
              <div className="empty-tracking-state">
                <div className="ghost-box">📦</div>
                <h3>No Shipments Found</h3>
                <p>Try adjusting your filters or search query.</p>
              </div>
            ) : (
              filteredOrders.map(order => {
                const orderId = order.id || order._id || order.orderId;
                const isExpanded = expandedOrderId === orderId;
                const normalizedStatus = getNormalizedStatus(order);
                const canCancel = canCancelOrder(order);

                return (
                  <div key={orderId} className={`tracking-card ${isExpanded ? 'expanded' : ''}`}>
                    {/* Always visible header */}
                    <div className="t-card-header" onClick={() => setExpandedOrderId(isExpanded ? null : orderId)}>
                      <div className="t-identity">
                        <div className="t-identifier">#{orderId.slice(-8).toUpperCase()}</div>
                        <div className="t-datetime">{formatDate(order.orderDate)} • {formatTime(order.orderDate)}</div>
                      </div>
                      <div className="t-state">
                        {renderStepper(normalizedStatus)}
                      </div>
                      <div className="t-money-action">
                        <div className="t-total">₹{parseFloat(order.total || order.totalAmount || 0).toLocaleString()}</div>
                        <button className="t-expand-btn">
                          {isExpanded ? '▲' : '▼'}
                        </button>
                      </div>
                    </div>

                    {/* Smooth Expandable Details */}
                    <div className="t-card-body-wrapper">
                      <div className="t-card-body">
                        <div className="t-grid-split">
                          <div className="t-delivery-info">
                            <h4>Delivery Context</h4>
                            <p><strong>To:</strong> {order.customerName}</p>
                            <p><strong>Phone:</strong> {order.customerPhone}</p>
                            <p className="address-block"><strong>Dest:</strong> {order.deliveryAddress}</p>
                            <p><strong>Target:</strong> {formatDate(order.deliveryDate)} ({order.deliveryTime})</p>
                          </div>
                          <div className="t-items-manifest">
                            <h4>Manifest ({order.items?.length || 0} items)</h4>
                            <div className="manifest-scroller">
                              {(order.items || []).map((item, idx) => (
                                <div key={idx} className="manifest-row">
                                  <div className="m-left">
                                    <span className="m-name">{item.name || item.productName}</span>
                                    <span className="m-qty">x{item.quantity}</span>
                                  </div>
                                  <div className="m-right">
                                    ₹{(item.price * item.quantity).toLocaleString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer Actions */}
                        <div className="t-card-footer">
                          {canCancel && (
                            <button className="tracker-btn cancel-btn" onClick={() => openCancelConfirm(order)}>
                              Request Cancellation
                            </button>
                          )}
                          {isAdmin && (
                            <button className="tracker-btn admin-override" onClick={() => openStatusUpdate(order)}>
                              [Admin] Override Status
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Keeping original cancel confirmation modal context */}
        {showCancelConfirm && orderToCancel && (
          <div className="tracker-modal-overlay">
            <div className="tracker-modal-card bounce-in">
              <h3>Confirm Void Request</h3>
              <p>Voiding Order <strong>#{orderToCancel.id || orderToCancel.orderId}</strong>. This action is irreversible.</p>
              <div className="t-modal-actions">
                <button className="tracker-btn neutral" onClick={closeCancelConfirm}>Maintain Shipment</button>
                <button className="tracker-btn danger" onClick={() => handleCancelOrder()}>Void Shipment</button>
              </div>
            </div>
          </div>
        )}

        {/* Status Update Modal (Admin) */}
        {showStatusUpdate && selectedOrder && (
          <div className="tracker-modal-overlay">
            <div className="tracker-modal-card bounce-in">
              <h3>Admin Identity: Override Status</h3>
              <p>Override pipeline sequence for <strong>#{selectedOrder.id || selectedOrder.orderId}</strong></p>
              <select
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value)}
                style={{ width: '100%', padding: '10px', margin: '15px 0', borderRadius: '8px' }}
              >
                <option value="">Select new status</option>
                <option value="placed">Placed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="t-modal-actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button className="tracker-btn neutral" onClick={() => setShowStatusUpdate(false)}>Abort</button>
                <button className="tracker-btn" onClick={handleUpdateOrderStatus} style={{ background: '#3b82f6', color: 'white' }}>Execute Transfer</button>
              </div>
            </div>
          </div>
        )}

      </PageContent>
    </PageWrapper>
  );
};

export default UserTrackOrders;
