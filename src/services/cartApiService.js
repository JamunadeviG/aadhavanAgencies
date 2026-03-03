import api from './api.js';

// Cart API Service - handles cart operations with database

export const getUserCart = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch cart' };
  }
};

export const addToCart = async (cartData) => {
  try {
    const response = await api.post('/cart', cartData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to add to cart' };
  }
};

export const updateCartItem = async (cartData) => {
  try {
    const response = await api.put('/cart', cartData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update cart' };
  }
};

export const removeFromCart = async (cartData) => {
  try {
    const response = await api.delete('/cart', { data: cartData });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to remove from cart' };
  }
};

export const clearCart = async () => {
  try {
    const response = await api.delete('/cart/clear');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to clear cart' };
  }
};
