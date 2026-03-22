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
      
      console.log('📦 [DEBUG] About to call updateOrderStatusWithStock');
      
      // Try to use the stock-aware status update function first
      try {
        console.log('📦 Attempting to cancel order via API...');
        const response = await updateOrderStatusWithStock(orderId, 'cancelled', previousStatus, orderToCancel);
        console.log('📦 Cancel response (API):', response);
        
        if (!response.success) {
          throw new Error(response.message || 'Failed to cancel order');
        }
        
        console.log('📦 [DEBUG] API call successful, updating local state');
        
        // Update local state with stock processing info
        const updatedOrder = { 
          ...orderToCancel, 
          status: 'cancelled', 
          cancelledAt: new Date().toISOString(),
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
          type: 'order_cancelled',
          title: 'Order Cancelled',
          message: `Order #${orderId} has been cancelled by customer`,
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
        let successMessage = `✅ Order #${orderId} has been cancelled successfully!\n\n`;
        successMessage += `📋 Order Details:\n`;
        successMessage += `• Customer: ${orderToCancel.customerName}\n`;
        successMessage += `• Total Amount: ₹${orderToCancel.total || orderToCancel.totalAmount || 0}\n`;
        successMessage += `• Items: ${orderToCancel.items?.length || 0} items\n`;
        successMessage += `• Status: Changed to "Cancelled"\n`;
        
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
            console.log('📦 [LOCAL] Found matching order, updating status to cancelled');
            return { ...order, status: 'cancelled', cancelledAt: new Date().toISOString() };
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
          type: 'order_cancelled',
          title: 'Order Cancelled',
          message: `Order #${orderId} has been cancelled by customer (Local Mode)`,
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
        let successMessage = `✅ Order #${orderId} has been cancelled successfully!\n\n`;
        successMessage += `📋 Order Details:\n`;
        successMessage += `• Customer: ${orderToCancel.customerName}\n`;
        successMessage += `• Total Amount: ₹${orderToCancel.total || orderToCancel.totalAmount || 0}\n`;
        successMessage += `• Items: ${orderToCancel.items?.length || 0} items\n`;
        successMessage += `• Status: Changed to "Cancelled"\n`;
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
    const matchesSearch = searchQuery === '' || 
      (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerPhone || '').includes(searchQuery);
    
    console.log(`🔍 [FILTER] Order ${order.id || order._id || order.orderId}:`);
    console.log(`🔍 [FILTER]   - Normalized Status: "${normalizedStatus}"`);
    console.log(`🔍 [FILTER]   - Filter Status: "${filterStatus}"`);
    console.log(`🔍 [FILTER]   - Matches Status: ${matchesStatus}`);
    console.log(`🔍 [FILTER]   - Search Query: "${searchQuery}"`);
    console.log(`🔍 [FILTER]   - Matches Search: ${matchesSearch}`);
    console.log(`🔍 [FILTER]   - Final Include: ${matchesStatus && matchesSearch}`);
    
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
    <PageWrapper>
      <UserNavbar />
      <PageContent>
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
              <option value="placed">Placed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button 
            className="btn btn-outline"
            onClick={() => {
              console.log('🔍 [DEBUG] Current Orders Analysis:');
              console.log('🔍 [DEBUG] Total orders:', orders.length);
              
              orders.forEach((order, index) => {
                const status = (order.status || '').toLowerCase().trim();
                const canCancel = status === 'pending' || status === 'placed' || status === 'processing';
                const orderId = order.id || order._id || order.orderId || 'NO_ID';
                
                console.log(`🔍 [DEBUG] Order ${index}:`);
                console.log(`🔍 [DEBUG]   - ID: ${orderId}`);
                console.log(`🔍 [DEBUG]   - Status: "${order.status}"`);
                console.log(`🔍 [DEBUG]   - Normalized: "${status}"`);
                console.log(`🔍 [DEBUG]   - Can Cancel: ${canCancel}`);
                console.log(`🔍 [DEBUG]   - Should show cancel button: ${canCancel}`);
              });
              
              alert(`Debug: Check console (F12) for detailed order analysis.\n\nTotal Orders: ${orders.length}\n\nLook for "Should show cancel button: true" messages.`);
            }}
          >
            🔍 Debug Cancellation
          </button>
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
            
            {filteredOrders.map((order) => {
              const normalizedStatus = getNormalizedStatus(order);
              const canCancel = canCancelOrder(order);
              const orderId = order.id || order._id || order.orderId;
              
              console.log(`🔍 [RENDER] Order ${orderId}:`);
              console.log(`🔍 [RENDER] - Raw status: "${order.status}"`);
              console.log(`🔍 [RENDER] - Normalized status: "${normalizedStatus}"`);
              console.log(`🔍 [RENDER] - Can cancel: ${canCancel}`);
              console.log(`🔍 [RENDER] - Show cancel button: ${canCancel}`);
              console.log(`🔍 [RENDER] - Show disabled button: ${!canCancel && normalizedStatus !== 'delivered' && normalizedStatus !== 'cancelled'}`);
              
              return (
              <div key={orderId} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3>Order #{orderId}</h3>
                    <p className="order-date">
                      Placed on {formatDate(order.orderDate)} at {formatTime(order.orderDate)}
                    </p>
                  </div>
                  <div className="order-status-info">
                    <span className={`status-badge ${normalizedStatus}`}>
                      {getStatusIcon(normalizedStatus)} {getStatusText(normalizedStatus)}
                    </span>
                    {normalizedStatus !== 'cancelled' && normalizedStatus !== 'delivered' && (
                      <span className={`cancellation-status ${canCancel ? 'can-cancel' : 'cannot-cancel'}`}>
                        {canCancel ? '📝 Can be cancelled' : '🚫 Cannot be cancelled'}
                      </span>
                    )}
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
                  {canCancelOrder(order) && (
                    <button 
                      className="btn btn-danger"
                      onClick={() => openCancelConfirm(order)}
                    >
                      Cancel Order
                    </button>
                  )}
                  {!canCancelOrder(order) && normalizedStatus !== 'delivered' && normalizedStatus !== 'cancelled' && (
                    <button 
                      className="btn btn-disabled"
                      disabled
                      title="Order cannot be cancelled once shipped"
                    >
                      Cannot Cancel
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
              );
            })}
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
                  <p><strong>Order #{orderToCancel.id || orderToCancel.orderId || orderToCancel._id}</strong></p>
                  <p>This action cannot be undone and your order will be permanently cancelled.</p>
                </div>
              </div>
              
              <div className="order-details-section">
                <h5>Order Details</h5>
                <div className="order-summary">
                  <div className="summary-item">
                    <span>Customer Name:</span>
                    <span>{orderToCancel.customerName || 'N/A'}</span>
                  </div>
                  <div className="summary-item">
                    <span>Phone Number:</span>
                    <span>{orderToCancel.customerPhone || 'N/A'}</span>
                  </div>
                  <div className="summary-item">
                    <span>Email:</span>
                    <span>{orderToCancel.customerEmail || 'N/A'}</span>
                  </div>
                  <div className="summary-item">
                    <span>Order Date:</span>
                    <span>{formatDate(orderToCancel.orderDate || orderToCancel.createdAt || orderToCancel.date)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Delivery Date:</span>
                    <span>{formatDate(orderToCancel.deliveryDate)} at {orderToCancel.deliveryTime || 'N/A'}</span>
                  </div>
                  <div className="summary-item">
                    <span>Delivery Address:</span>
                    <span>{orderToCancel.deliveryAddress || orderToCancel.address || 'N/A'}</span>
                  </div>
                  <div className="summary-item total">
                    <span>Total Amount:</span>
                    <span><strong>₹{orderToCancel.total || orderToCancel.totalAmount || orderToCancel.amount || 0}</strong></span>
                  </div>
                </div>
              </div>

              <div className="order-items-section">
                <h5>Order Items ({orderToCancel.items?.length || 0} items)</h5>
                <div className="items-list">
                  {orderToCancel.items && orderToCancel.items.length > 0 ? (
                    orderToCancel.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <div className="item-info">
                          <span className="item-name">{item.name || item.productName || 'Unknown Product'}</span>
                          <span className="item-quantity">× {item.quantity || 1}</span>
                        </div>
                        <span className="item-price">₹{item.price || item.unitPrice || 0}</span>
                      </div>
                    ))
                  ) : (
                    <p className="no-items">No items found in this order</p>
                  )}
                </div>
              </div>

              <div className="cancellation-implications">
                <div className="implication-icon">📝</div>
                <div className="implication-text">
                  <h6>What happens when you cancel:</h6>
                  <ul>
                    <li>Order status will be changed to "Cancelled"</li>
                    <li>Any deducted stock will be restored (if applicable)</li>
                    <li>You will need to place a new order if you change your mind</li>
                    <li>Admin will be notified about this cancellation</li>
                  </ul>
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
                onClick={() => {
                  console.log('📦 [DEBUG] Cancel Order button clicked');
                  console.log('📦 [DEBUG] orderToCancel:', orderToCancel);
                  console.log('📦 [DEBUG] handleCancelOrder function:', typeof handleCancelOrder);
                  handleCancelOrder();
                }}
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
                    <option value="placed">📝 Placed</option>
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
      </PageContent>
    </PageWrapper>
  );
};

export default UserTrackOrders;
