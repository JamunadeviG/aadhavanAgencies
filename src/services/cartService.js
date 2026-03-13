// Cart Service - Centralized cart management for the ERP system

import api from './api.js';

/**
 * Get cart items from database
 * @returns {Array} Array of cart items
 */
export const getCart = async () => {
  try {
    const response = await api.get('/cart');
    console.log('🛒 Cart service response:', response.data);
    
    // The API returns { success: true, cart: { items: [] } }
    // We need to extract the items array from the cart object
    if (response.data && response.data.success && response.data.cart) {
      return response.data.cart.items || [];
    } else if (response.data && response.data.cart) {
      return response.data.cart.items || [];
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('🛒 Unexpected cart response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('🛒 Cart service error:', error);
    return []; // Return empty array on error
  }
};

/**
 * Add product to cart
 * @param {Object} productData - Product data to add
 * @returns {Object} Updated cart items
 */
export const addToCart = async (productData) => {
  try {
    console.log('🛒 Cart Service: Adding product to cart:', productData);
    const response = await api.post('/cart/add', productData);
    console.log('🛒 Cart Service: Add to cart response:', response.data);
    return response.data;
  } catch (error) {
    console.error('🛒 Cart Service: Add to cart error:', error);
    console.error('🛒 Cart Service: Error response:', error.response?.data);
    throw error.response?.data || { message: 'Failed to add to cart' };
  }
};

/**
 * Update product quantity in cart
 * @param {string} productId - Product ID (_id or id)
 * @param {number} quantity - New quantity
 * @returns {Object} Updated cart items
 */
export const updateCartItem = async (productId, quantity) => {
  try {
    const response = await api.put('/cart/update', { productId, quantity });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update cart' };
  }
};

/**
 * Remove product from cart
 * @param {string} productId - Product ID (_id or id)
 * @returns {Object} Updated cart items
 */
export const removeFromCart = async (productId) => {
  try {
    const response = await api.delete(`/cart/remove/${productId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to remove from cart' };
  }
};

/**
 * Clear entire cart
 * @returns {Array} Empty cart array
 */
export const clearCart = async () => {
  try {
    const response = await api.delete('/cart/clear');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to clear cart' };
  }
};

/**
 * Get cart item count (total quantity of all items)
 * @returns {number} Total item count
 */
export const getCartCount = async () => {
  try {
    const cart = await getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  } catch (error) {
    console.error('Error getting cart count:', error);
    return 0;
  }
};

/**
 * Calculate cart total
 * @returns {number} Total price
 */
export const getCartTotal = async () => {
  try {
    const cart = await getCart();
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (price * quantity);
    }, 0);
  } catch (error) {
    console.error('Error calculating cart total:', error);
    return 0;
  }
};
