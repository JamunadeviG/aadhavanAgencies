import api from './api.js';
import { updateMultipleProductStock } from './productService.js';
import { 
  processOrderStockUpdateLocal, 
  restoreOrderStockLocal, 
  markOrderStockProcessedLocal,
  getLowStockProductsLocal,
  getProductStockLocal,
  getStockHistoryLocal
} from './stockServiceLocal.js';

// Stock management service - handles inventory updates based on order status

export const processOrderStockUpdate = async (order, newStatus, previousStatus) => {
  try {
    console.log('📦 Processing stock update for order:', order._id || order.orderId);
    console.log('📦 Status change:', previousStatus, '→', newStatus);
    
    // Only process stock updates for shipped or delivered status
    if (!['shipped', 'delivered'].includes(newStatus?.toLowerCase())) {
      console.log('📦 No stock update needed for status:', newStatus);
      return { success: true, message: 'No stock update needed for this status' };
    }
    
    // Check if stock was already deducted for this order
    if (order.stockProcessed) {
      console.log('📦 Stock already processed for this order');
      return { success: true, message: 'Stock already processed for this order' };
    }
    
    // Extract items from order (handle different item structures)
    const items = order.items || order.orderItems || [];
    if (!items || items.length === 0) {
      console.log('📦 No items found in order');
      return { success: true, message: 'No items found in order' };
    }
    
    // Prepare stock updates
    const stockUpdates = [];
    
    items.forEach((item, index) => {
      // Handle different item structures
      const productId = item.productId || item._id || item.id;
      const productName = item.name || item.productName || item.title;
      const quantity = item.quantity || 1;
      
      if (!productId) {
        console.warn(`⚠️ No product ID found for item ${index}:`, item);
        return;
      }
      
      stockUpdates.push({
        productId,
        productName,
        quantity,
        operation: 'subtract',
        reason: `Order ${order._id || order.orderId} - ${newStatus}`,
        orderId: order._id || order.orderId,
        status: newStatus
      });
    });
    
    if (stockUpdates.length === 0) {
      console.log('📦 No valid stock updates to process');
      return { success: true, message: 'No valid stock updates to process' };
    }
    
    console.log('📦 Stock updates to process:', stockUpdates);
    
    try {
      // Try backend API first
      const response = await updateMultipleProductStock(stockUpdates);
      console.log('📦 Stock update response (backend):', response);
      
      // Mark order as stock processed
      await markOrderStockProcessed(order._id || order.orderId, newStatus);
      
      return {
        success: true,
        message: `Stock updated for ${stockUpdates.length} products`,
        updates: stockUpdates,
        response
      };
      
    } catch (apiError) {
      console.warn('📦 Backend API not available, using local storage:', apiError.message);
      
      // Fallback to local storage
      const localResponse = processOrderStockUpdateLocal(order, newStatus, previousStatus);
      console.log('📦 Stock update response (local):', localResponse);
      
      return localResponse;
    }
    
  } catch (error) {
    console.error('📦 Error processing stock update:', error);
    throw error.response?.data || { message: 'Failed to process stock update' };
  }
};

export const markOrderStockProcessed = async (orderId, status) => {
  try {
    const response = await api.patch(`/orders/${orderId}/stock-processed`, { 
      stockProcessed: true,
      processedStatus: status,
      processedAt: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.warn('📦 Backend API not available, using local storage:', error.message);
    // Fallback to local storage
    return markOrderStockProcessedLocal(orderId, status);
  }
};

export const checkOrderStockStatus = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/stock-status`);
    return response.data;
  } catch (error) {
    console.warn('📦 Backend API not available, checking local storage:', error.message);
    
    // Fallback to local storage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => (o._id || o.orderId) === orderId);
    
    if (order) {
      return {
        stockProcessed: order.stockProcessed || false,
        processedStatus: order.processedStatus,
        processedAt: order.processedAt
      };
    }
    
    throw new Error('Order not found');
  }
};

export const restoreOrderStock = async (order) => {
  try {
    console.log('📦 Restoring stock for order:', order._id || order.orderId);
    
    // Only restore if order was previously shipped or delivered
    if (!['shipped', 'delivered'].includes(order.status?.toLowerCase())) {
      console.log('📦 No stock restoration needed for status:', order.status);
      return { success: true, message: 'No stock restoration needed for this status' };
    }
    
    // Check if stock was processed
    if (!order.stockProcessed) {
      console.log('📦 Stock was not processed for this order');
      return { success: true, message: 'Stock was not processed for this order' };
    }
    
    // Extract items from order
    const items = order.items || order.orderItems || [];
    if (!items || items.length === 0) {
      console.log('📦 No items found in order');
      return { success: true, message: 'No items found in order' };
    }
    
    // Prepare stock restoration updates
    const stockUpdates = [];
    
    items.forEach((item, index) => {
      const productId = item.productId || item._id || item.id;
      const productName = item.name || item.productName || item.title;
      const quantity = item.quantity || 1;
      
      if (!productId) {
        console.warn(`⚠️ No product ID found for item ${index}:`, item);
        return;
      }
      
      stockUpdates.push({
        productId,
        productName,
        quantity,
        operation: 'add',
        reason: `Order ${order._id || order.orderId} - cancelled/restored`,
        orderId: order._id || order.orderId,
        status: order.status
      });
    });
    
    if (stockUpdates.length === 0) {
      console.log('📦 No valid stock restoration updates to process');
      return { success: true, message: 'No valid stock restoration updates to process' };
    }
    
    console.log('📦 Stock restoration updates to process:', stockUpdates);
    
    try {
      // Try backend API first
      const response = await updateMultipleProductStock(stockUpdates);
      console.log('📦 Stock restoration response (backend):', response);
      
      // Mark order as stock not processed
      await markOrderStockProcessed(order._id || order.orderId, 'cancelled');
      
      return {
        success: true,
        message: `Stock restored for ${stockUpdates.length} products`,
        updates: stockUpdates,
        response
      };
      
    } catch (apiError) {
      console.warn('📦 Backend API not available, using local storage:', apiError.message);
      
      // Fallback to local storage
      const localResponse = restoreOrderStockLocal(order);
      console.log('📦 Stock restoration response (local):', localResponse);
      
      return localResponse;
    }
    
  } catch (error) {
    console.error('📦 Error restoring stock:', error);
    throw error.response?.data || { message: 'Failed to restore stock' };
  }
};

export const getLowStockProducts = async (threshold = 10) => {
  try {
    const response = await api.get(`/products/low-stock?threshold=${threshold}`);
    return response.data;
  } catch (error) {
    console.warn('📦 Backend API not available, using local storage:', error.message);
    // Fallback to local storage
    return getLowStockProductsLocal(threshold);
  }
};

export const getStockHistory = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/stock-history`);
    return response.data;
  } catch (error) {
    console.warn('📦 Backend API not available, using local storage:', error.message);
    // Fallback to local storage
    return getStockHistoryLocal(productId);
  }
};
