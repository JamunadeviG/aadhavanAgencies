import api from './api.js';

// Authentication service - handles login and register API calls

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message || 'Registration failed', status: error.response?.status };
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    
    // Store token and user data in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Restore user-specific data
      restoreUserData(response.data.user);
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message || 'Login failed', status: error.response?.status };
  }
};

export const fetchProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    if (response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data.user;
  } catch (error) {
    throw error.response?.data || { message: error.message || 'Failed to fetch profile', status: error.response?.status };
  }
};

export const restoreUserData = (user) => {
  try {
    // Restore user's profile data if it exists
    const userProfile = localStorage.getItem(`user_${user.id}`);
    if (userProfile) {
      const storedProfile = JSON.parse(userProfile);
      const updatedUser = { ...user, ...storedProfile };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    // Restore user's orders from localStorage (if they exist)
    const userOrders = localStorage.getItem(`orders_${user.id}`);
    if (userOrders) {
      const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const userOrderData = JSON.parse(userOrders);
      
      // Merge user orders with all orders
      const mergedOrders = [...allOrders.filter(order => !order.userId || order.userId !== user.id), ...userOrderData];
      localStorage.setItem('orders', JSON.stringify(mergedOrders));
    }
    
    // Restore user's cart from localStorage (if it exists)
    const userCart = localStorage.getItem(`cart_${user.id}`);
    if (userCart) {
      localStorage.setItem('cart', userCart);
    }
    
    // Restore user's notifications
    const userNotifications = localStorage.getItem(`notifications_${user.id}`);
    if (userNotifications) {
      const allNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      const userNotificationData = JSON.parse(userNotifications);
      
      // Merge user notifications with all notifications
      const mergedNotifications = [...allNotifications.filter(notif => !notif.userId || notif.userId !== user.id), ...userNotificationData];
      localStorage.setItem('adminNotifications', JSON.stringify(mergedNotifications));
    }
    
  } catch (error) {
    console.error('Error restoring user data:', error);
  }
};

export const updateUserProfile = (updatedUser) => {
  try {
    // Update user in localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Save user-specific data for persistence
    localStorage.setItem(`user_${updatedUser.id}`, JSON.stringify(updatedUser));
    
    // Dispatch user update event for any components listening
    window.dispatchEvent(new CustomEvent('userProfileUpdate', { detail: updatedUser }));
    
    return updatedUser;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const logout = () => {
  // Get current user before logout
  const currentUser = getStoredUser();
  
  // Only clear token and session, preserve user data
  localStorage.removeItem('token');
  
  // Clear session-specific data but preserve user orders
  localStorage.removeItem('cart');
  localStorage.removeItem('adminNotifications');
  
  // Dispatch logout event for any components listening
  window.dispatchEvent(new CustomEvent('userLogout'));
  
  // Redirect to home page
  window.location.href = '/';
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};
