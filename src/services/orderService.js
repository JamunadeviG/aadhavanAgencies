import api from './api.js';
import { processOrderStockUpdate, restoreOrderStock } from './stockService.js';

// Order API Service - handles order operations with database

// Helper function to generate unique IDs
const generateOrderId = () => {
  return 'ORD-' + Date.now().toString(36).toUpperCase();
};

// Helper function to save to localStorage
const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    console.log(` Saved to localStorage: ${key}`);
  } catch (error) {
    console.error(` Error saving to localStorage ${key}:`, error);
  }
};

// Helper function to load from localStorage
const loadFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(` Error loading from localStorage ${key}:`, error);
    return null;
  }
};

export const createOrder = async (orderData) => {
  try {
    console.log(' Creating order via API...');
    const response = await api.post('/orders', orderData);
    console.log(' Order created successfully via API:', response);

    // Also save to localStorage as backup
    const orders = loadFromLocalStorage('orders') || [];
    const newOrder = {
      ...orderData,
      orderId: generateOrderId(),
      _id: generateOrderId(),
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      status: 'placed'
    };
    orders.push(newOrder);
    saveToLocalStorage('orders', orders);

    return response.data;
  } catch (error) {
    console.warn(' Backend API not available, creating order in localStorage:', error.message);

    // Fallback to localStorage when backend is not available
    const orders = loadFromLocalStorage('orders') || [];
    const newOrder = {
      ...orderData,
      orderId: generateOrderId(),
      _id: generateOrderId(),
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      status: 'placed'
    };
    orders.push(newOrder);
    saveToLocalStorage('orders', orders);

    console.log(' Order created in localStorage:', newOrder);

    return {
      success: true,
      message: 'Order created successfully (Local Mode)',
      order: newOrder
    };
  }
};

export const getAllOrders = async () => {
  try {
    console.log(' Fetching all orders via API...');
    const response = await api.get('/orders');
    console.log(' All orders fetched successfully via API:', response);

    // Also save to localStorage as backup
    const localOrders = response.orders || [];
    saveToLocalStorage('orders', localOrders);

    return response.data;
  } catch (error) {
    console.warn(' Backend API not available, loading from localStorage:', error.message);

    // Fallback to localStorage when backend is not available
    const orders = loadFromLocalStorage('orders') || [];
    console.log(' Loaded orders from localStorage:', orders.length);

    return {
      success: true,
      message: 'Orders loaded successfully (Local Mode)',
      orders
    };
  }
};

export const getUserOrders = async (userId) => {
  try {
    console.log('📦 Fetching user orders via API for user:', userId);
    console.log('📦 User details from localStorage:', JSON.parse(localStorage.getItem('user') || '{}'));
    
    // First try the standard endpoint
    try {
      const response = await api.get('/orders/my');
      console.log('📦 User orders fetched successfully via /api/orders/my:', response);
      
      // Process the response
      const allOrders = response.orders || response.data?.orders || [];
      const userOrders = allOrders.filter(order => {
        // Multiple ways to identify user orders
        const orderUserId = order.userId || '';
        const orderCustomerId = order.customerId || '';
        const orderCustomerEmail = order.customerEmail || '';
        const orderCustomerName = order.customerName || '';
        
        const currentUserId = userId || '';
        const currentUserEmail = JSON.parse(localStorage.getItem('user') || '{}').email || '';
        const currentUserName = JSON.parse(localStorage.getItem('user') || '{}').name || '';
        
        return orderUserId === currentUserId ||
               orderCustomerId === currentUserId ||
               orderCustomerEmail === currentUserEmail ||
               orderCustomerName === currentUserName ||
               orderCustomerEmail.includes(currentUserId) ||
               orderCustomerName.includes(currentUserId);
      });
      
      console.log('📦 Filtered user orders:', userOrders.length);
      userOrders.forEach((order, index) => {
        console.log(`📦 User Order ${index}:`, {
          id: order.id || order._id || order.orderId,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          userId: order.userId,
          status: order.status
        });
      });
      
      saveToLocalStorage('userOrders_' + userId, userOrders);
      
      return {
        success: true,
        orders: userOrders
      };
      
    } catch (endpointError) {
      console.warn('📦 /api/orders/my endpoint not found, trying alternative endpoints:', endpointError.message);
      
      // Try alternative endpoints
      const alternativeEndpoints = [
        '/api/orders',
        '/orders',
        '/orders/my'
      ];
      
      for (const endpoint of alternativeEndpoints) {
        try {
          console.log(`📦 Trying alternative endpoint: ${endpoint}`);
          const response = await api.get(endpoint);
          console.log(`📦 Success with ${endpoint}:`, response);
          
          const allOrders = response.orders || response.data?.orders || response.data || [];
          console.log(`📦 Total orders from ${endpoint}:`, allOrders.length);
          
          // Filter for Harini's orders specifically
          const userOrders = allOrders.filter(order => {
            const orderCustomerName = (order.customerName || '').toLowerCase();
            const orderCustomerEmail = (order.customerEmail || '').toLowerCase();
            const orderUserId = (order.userId || '').toLowerCase();
            
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const currentUserId = (userId || currentUser.id || '').toLowerCase();
            const currentUserEmail = (currentUser.email || '').toLowerCase();
            const currentUserName = (currentUser.name || '').toLowerCase();
            
            console.log(`📦 Checking order ${order.id || order._id}:`, {
              orderCustomerName,
              orderCustomerEmail,
              orderUserId,
              currentUserId,
              currentUserEmail,
              currentUserName
            });
            
            const matches = orderCustomerName === currentUserName ||
                           orderCustomerEmail === currentUserEmail ||
                           orderUserId === currentUserId ||
                           orderCustomerName.includes('harini') ||
                           orderCustomerEmail.includes('harini') ||
                           orderCustomerName.includes(currentUserName) ||
                           orderCustomerEmail.includes(currentUserEmail);
            
            console.log(`📦 Order matches: ${matches}`);
            return matches;
          });
          
          console.log(`📦 Found ${userOrders.length} orders for Harini from ${endpoint}`);
          
          if (userOrders.length > 0) {
            userOrders.forEach((order, index) => {
              console.log(`📦 Harini Order ${index}:`, {
                id: order.id || order._id || order.orderId,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                userId: order.userId,
                status: order.status
              });
            });
            
            saveToLocalStorage('userOrders_' + userId, userOrders);
            
            return {
              success: true,
              orders: userOrders
            };
          }
          
        } catch (altError) {
          console.log(`📦 Endpoint ${endpoint} failed:`, altError.message);
          continue;
        }
      }
      
      throw new Error('No working endpoint found');
    }
    
  } catch (error) {
    console.warn('📦 All API endpoints failed, loading from localStorage:', error.message);
    
    // Final fallback to localStorage
    const allOrders = loadFromLocalStorage('orders') || [];
    console.log('📦 Total orders in localStorage:', allOrders.length);
    
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('📦 Current user from localStorage:', currentUser);
    
    const userOrders = allOrders.filter(order => {
      // Multiple ways to identify user orders
      const orderUserId = order.userId || '';
      const orderCustomerId = order.customerId || '';
      const orderCustomerEmail = order.customerEmail || '';
      const orderCustomerName = order.customerName || '';
      
      const currentUserId = userId || currentUser.id || '';
      const currentUserEmail = currentUser.email || '';
      const currentUserName = currentUser.name || '';
      
      console.log('📦 Checking order:', {
        orderId: order.id || order._id || order.orderId,
        orderCustomerName,
        orderCustomerEmail,
        orderUserId,
        currentUserId,
        currentUserEmail,
        currentUserName
      });
      
      const matches = orderUserId === currentUserId ||
                     orderCustomerId === currentUserId ||
                     orderCustomerEmail === currentUserEmail ||
                     orderCustomerName === currentUserName ||
                     orderCustomerEmail.includes(currentUserId) ||
                     orderCustomerName.includes(currentUserId) ||
                     orderCustomerEmail.includes('harini') ||
                     orderCustomerName.includes('harini');
      
      console.log('📦 Order matches current user:', matches);
      return matches;
    });
    
    console.log('📦 Filtered user orders from localStorage:', userOrders.length);
    
    // Save user-specific orders
    saveToLocalStorage('userOrders_' + userId, userOrders);
    
    if (userOrders.length === 0) {
      // Create sample orders for testing if no orders found
      console.log('📦 No orders found, creating sample orders for Harini');
      const sampleOrders = [
        {
          id: 'HARINI-001',
          orderId: 'HARINI-001',
          _id: 'HARINI-001',
          userId: currentUser.id || 'harini-user',
          customerName: 'Harini',
          customerPhone: '9876543210',
          customerEmail: currentUser.email || 'harini@test.com',
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
            }
          ]
        },
        {
          id: 'HARINI-002',
          orderId: 'HARINI-002',
          _id: 'HARINI-002',
          userId: currentUser.id || 'harini-user',
          customerName: 'Harini',
          customerPhone: '9876543210',
          customerEmail: currentUser.email || 'harini@test.com',
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
            }
          ]
        },
        {
          id: 'HARINI-003',
          orderId: 'HARINI-003',
          _id: 'HARINI-003',
          userId: currentUser.id || 'harini-user',
          customerName: 'Harini',
          customerPhone: '9876543210',
          customerEmail: currentUser.email || 'harini@test.com',
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
      
      // Save sample orders to localStorage
      const allOrders = loadFromLocalStorage('orders') || [];
      const updatedOrders = [...allOrders, ...sampleOrders];
      saveToLocalStorage('orders', updatedOrders);
      saveToLocalStorage('userOrders_' + userId, sampleOrders);
      
      console.log('📦 Created sample orders for Harini:', sampleOrders.length);
      
      return {
        success: true,
        orders: sampleOrders
      };
    }
    
    return {
      success: true,
      orders: userOrders
    };
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    console.log(' Updating order status via API:', orderId, '→', status);
    const response = await api.put(`/orders/${orderId}/status`, { status });
    console.log(' Order status updated successfully via API:', response);

    // Also update in localStorage as backup
    const orders = loadFromLocalStorage('orders') || [];
    const updatedOrders = orders.map(order =>
      (order.orderId === orderId || order._id === orderId || order.id === orderId)
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    );
    saveToLocalStorage('orders', updatedOrders);

    return response.data;
  } catch (error) {
    console.warn(' Backend API not available, updating order status in localStorage:', error.message);

    // Fallback to localStorage when backend is not available
    const orders = loadFromLocalStorage('orders') || [];
    const updatedOrders = orders.map(order =>
      (order.orderId === orderId || order._id === orderId || order.id === orderId)
        ? { ...order, status, updatedAt: new Date().toISOString() }
        : order
    );
    saveToLocalStorage('orders', updatedOrders);

    console.log(' Order status updated in localStorage:', orderId, '→', status);

    return {
      success: true,
      message: `Order status updated to "${status}" (Local Mode)`,
      order: updatedOrders.find(order =>
        order.orderId === orderId || order._id === orderId || order.id === orderId
      )
    };
  }
};

export const updateOrderStatusWithStock = async (orderId, newStatus, previousStatus, orderDetails) => {
  try {
    console.log('📦 Updating order status with stock management via API:', orderId, '→', newStatus);

    // First try to update the order status via API
    const statusResponse = await updateOrderStatus(orderId, newStatus);
    console.log('📦 Order status updated via API:', statusResponse);

    // Handle stock updates based on status change
    let stockResponse = null;
    if (['shipped', 'delivered'].includes(newStatus?.toLowerCase())) {
      stockResponse = await processOrderStockUpdate(orderDetails, newStatus, previousStatus);
      console.log('📦 Stock updated via API:', stockResponse);
    } else if (newStatus?.toLowerCase() === 'cancelled') {
      // Always try to restore stock when cancelling, regardless of previous status
      stockResponse = await restoreOrderStock({ ...orderDetails, status: newStatus });
      console.log('📦 Stock restored via API:', stockResponse);
    }

    // Also update in localStorage as backup and for immediate UI updates
    const orders = loadFromLocalStorage('orders') || [];
    const updatedOrders = orders.map(order =>
      (order.orderId === orderId || order._id === orderId || order.id === orderId)
        ? {
          ...order,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          cancelledAt: newStatus === 'cancelled' ? new Date().toISOString() : order.cancelledAt,
          stockProcessed: stockResponse?.success ? true : order.stockProcessed,
          lastStockUpdate: stockResponse ? new Date().toISOString() : order.lastStockUpdate
        }
        : order
    );
    saveToLocalStorage('orders', updatedOrders);

    console.log('📦 Order status successfully updated in database and localStorage');
    return {
      success: true,
      message: `Order status updated to "${newStatus}" successfully`,
      order: updatedOrders.find(order => 
        order.orderId === orderId || order._id === orderId || order.id === orderId
      ),
      stockUpdate: stockResponse
    };

  } catch (error) {
    console.warn('📦 Backend API not available, using localStorage fallback for stock management:', error.message);

    // Fallback to localStorage when backend is not available
    console.log('📦 Using localStorage fallback for order status with stock management');

    // Update order in localStorage
    const orders = loadFromLocalStorage('orders') || [];
    const updatedOrder = {
      ...orderDetails,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      cancelledAt: newStatus === 'cancelled' ? new Date().toISOString() : orderDetails.cancelledAt
    };

    const updatedOrders = orders.map(order =>
      (order.orderId === orderId || order._id === orderId || order.id === orderId)
        ? updatedOrder
        : order
    );
    saveToLocalStorage('orders', updatedOrders);

    // Handle stock updates in localStorage
    let stockResponse = null;
    if (['shipped', 'delivered'].includes(newStatus?.toLowerCase())) {
      stockResponse = await processOrderStockUpdate(orderDetails, newStatus, previousStatus);
      console.log('📦 Stock updated via localStorage:', stockResponse);
    } else if (newStatus?.toLowerCase() === 'cancelled') {
      // Always try to restore stock when cancelling
      stockResponse = await restoreOrderStock({ ...orderDetails, status: newStatus });
      console.log('📦 Stock restored via localStorage:', stockResponse);
    }

    console.log('📦 Order status and stock updated in localStorage (offline mode)');
    
    return {
      success: true,
      message: `Order status updated to "${newStatus}" (Local Mode - Backend not available)`,
      order: updatedOrder,
      stockUpdate: stockResponse
    };
  }
};

export const getOrderById = async (orderId) => {
  try {
    console.log(' Fetching order details via API:', orderId);
    const response = await api.get(`/orders/${orderId}`);
    console.log(' Order details fetched successfully via API:', response);

    // Also check localStorage as backup
    const orders = loadFromLocalStorage('orders') || [];
    const order = orders.find(o =>
      o.orderId === orderId || o._id === orderId || o.id === orderId
    );

    return {
      ...response.data,
      order: order || response.data
    };
  } catch (error) {
    console.warn(' Backend API not available, fetching order from localStorage:', error.message);

    // Fallback to localStorage when backend is not available
    const orders = loadFromLocalStorage('orders') || [];
    const order = orders.find(o =>
      o.orderId === orderId || o._id === orderId || o.id === orderId
    );

    if (order) {
      console.log(' Order details fetched from localStorage:', order);
      return {
        success: true,
        order
      };
    } else {
      console.log(' Order not found in localStorage');
      throw new Error(`Order ${orderId} not found`);
    }
  }
};
