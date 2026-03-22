// Temporary frontend stock management - works with localStorage until backend is implemented

export const updateProductStockLocal = (productId, quantityChange, operation = 'subtract') => {
  try {
    // Get current products from localStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const productIndex = products.findIndex(p => (p._id || p.id) === productId);
    
    if (productIndex === -1) {
      throw new Error(`Product ${productId} not found`);
    }
    
    const product = products[productIndex];
    const currentStock = product.stock || 0;
    let newStock = currentStock;
    
    if (operation === 'subtract') {
      newStock = Math.max(0, currentStock - quantityChange);
      if (newStock === 0 && currentStock > 0) {
        console.warn(`⚠️ Product ${product.name} is now out of stock`);
      }
    } else if (operation === 'add') {
      newStock = currentStock + quantityChange;
    }
    
    // Update product stock
    products[productIndex] = {
      ...product,
      stock: newStock,
      updatedAt: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Add to stock history
    const stockHistory = JSON.parse(localStorage.getItem('stockHistory') || '[]');
    stockHistory.push({
      productId,
      productName: product.name,
      date: new Date().toISOString(),
      change: operation === 'subtract' ? -quantityChange : quantityChange,
      operation,
      reason: `Stock ${operation} operation`,
      previousStock: currentStock,
      newStock,
      orderId: 'LOCAL_UPDATE'
    });
    localStorage.setItem('stockHistory', JSON.stringify(stockHistory));
    
    console.log(`📦 Stock updated locally: ${product.name} ${currentStock} → ${newStock}`);
    
    return {
      success: true,
      message: `Stock ${operation}ed successfully`,
      product: products[productIndex],
      previousStock: currentStock,
      newStock
    };
    
  } catch (error) {
    console.error('📦 Error updating stock locally:', error);
    throw error;
  }
};

export const updateMultipleProductStockLocal = (stockUpdates) => {
  try {
    const results = [];
    const errors = [];
    
    for (const update of stockUpdates) {
      try {
        const result = updateProductStockLocal(
          update.productId, 
          update.quantity, 
          update.operation
        );
        results.push({
          productId: update.productId,
          success: true,
          ...result
        });
      } catch (error) {
        errors.push({
          productId: update.productId,
          error: error.message
        });
      }
    }
    
    return {
      success: errors.length === 0,
      message: `Processed ${results.length} stock updates${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
      updates: results,
      errors
    };
    
  } catch (error) {
    console.error('📦 Error in bulk stock update:', error);
    throw error;
  }
};

export const processOrderStockUpdateLocal = (order, newStatus, previousStatus) => {
  try {
    console.log('📦 Processing LOCAL stock update for order:', order._id || order.orderId);
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
    
    // Extract items from order
    const items = order.items || order.orderItems || [];
    if (!items || items.length === 0) {
      console.log('📦 No items found in order');
      return { success: true, message: 'No items found in order' };
    }
    
    // Prepare stock updates
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
    
    // Update stock in bulk
    const response = updateMultipleProductStockLocal(stockUpdates);
    console.log('📦 Stock update response:', response);
    
    // Mark order as stock processed
    markOrderStockProcessedLocal(order._id || order.orderId, newStatus);
    
    return {
      success: true,
      message: `Stock updated for ${stockUpdates.length} products`,
      updates: stockUpdates,
      response
    };
    
  } catch (error) {
    console.error('📦 Error processing stock update locally:', error);
    throw error;
  }
};

export const markOrderStockProcessedLocal = (orderId, status) => {
  try {
    // Get orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex(o => (o._id || o.orderId) === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex] = {
        ...orders[orderIndex],
        stockProcessed: true,
        processedStatus: status,
        processedAt: new Date().toISOString()
      };
      localStorage.setItem('orders', JSON.stringify(orders));
      console.log(`📦 Order ${orderId} marked as stock processed`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('📦 Error marking order as stock processed:', error);
    throw error;
  }
};

export const restoreOrderStockLocal = (order) => {
  try {
    console.log('📦 Restoring stock locally for order:', order._id || order.orderId);
    
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
    
    // Update stock in bulk
    const response = updateMultipleProductStockLocal(stockUpdates);
    console.log('📦 Stock restoration response:', response);
    
    // Mark order as stock not processed
    markOrderStockProcessedLocal(order._id || order.orderId, 'cancelled');
    
    return {
      success: true,
      message: `Stock restored for ${stockUpdates.length} products`,
      updates: stockUpdates,
      response
    };
    
  } catch (error) {
    console.error('📦 Error restoring stock locally:', error);
    throw error;
  }
};

export const getLowStockProductsLocal = (threshold = 10) => {
  try {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const lowStockProducts = products.filter(product => 
      (product.stock || 0) <= threshold
    );
    
    return {
      success: true,
      products: lowStockProducts,
      count: lowStockProducts.length
    };
  } catch (error) {
    console.error('📦 Error fetching low stock products locally:', error);
    throw error;
  }
};

export const getProductStockLocal = (productId) => {
  try {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => (p._id || p.id) === productId);
    
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    
    return {
      success: true,
      product: {
        _id: product._id,
        name: product.name,
        stock: product.stock || 0,
        lowStockThreshold: product.lowStockThreshold || 10
      }
    };
  } catch (error) {
    console.error('📦 Error fetching product stock locally:', error);
    throw error;
  }
};

export const getStockHistoryLocal = (productId) => {
  try {
    const stockHistory = JSON.parse(localStorage.getItem('stockHistory') || '[]');
    const productHistory = stockHistory.filter(entry => 
      entry.productId === productId
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return {
      success: true,
      history: productHistory
    };
  } catch (error) {
    console.error('📦 Error fetching stock history locally:', error);
    throw error;
  }
};
