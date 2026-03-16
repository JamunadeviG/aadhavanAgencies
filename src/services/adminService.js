import api from './api.js';

// Get admin dashboard statistics
export const getAdminStats = async () => {
  try {
    console.log('📊 Fetching admin dashboard stats...');
    
    const response = await api.get('/users/stats');
    console.log('📊 Admin stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('📊 Error fetching admin stats:', error);
    
    if (error.response?.status === 401) {
      throw { message: 'Unauthorized. Please login again.' };
    } else if (error.response?.status === 403) {
      throw { message: 'Access denied. Admin privileges required.' };
    } else if (error.response?.status === 500) {
      throw { message: 'Server error. Please try again later.' };
    } else {
      const errorMessage = error.message || 'Failed to fetch admin statistics';
      throw { message: errorMessage };
    }
  }
};

// Get order statistics
export const getOrderStats = async () => {
  try {
    console.log('📊 Fetching order statistics...');
    
    const response = await api.get('/orders/stats');
    console.log('📊 Order stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('📊 Error fetching order stats:', error);
    
    if (error.response?.status === 401) {
      throw { message: 'Unauthorized. Please login again.' };
    } else if (error.response?.status === 403) {
      throw { message: 'Access denied. Admin privileges required.' };
    } else if (error.response?.status === 500) {
      throw { message: 'Server error. Please try again later.' };
    } else {
      const errorMessage = error.message || 'Failed to fetch order statistics';
      throw { message: errorMessage };
    }
  }
};

// Get product statistics
export const getProductStats = async () => {
  try {
    console.log('📊 Fetching product statistics...');
    
    const response = await api.get('/products/stats');
    console.log('📊 Product stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('📊 Error fetching product stats:', error);
    
    if (error.response?.status === 401) {
      throw { message: 'Unauthorized. Please login again.' };
    } else if (error.response?.status === 403) {
      throw { message: 'Access denied. Admin privileges required.' };
    } else if (error.response?.status === 500) {
      throw { message: 'Server error. Please try again later.' };
    } else {
      const errorMessage = error.message || 'Failed to fetch product statistics';
      throw { message: errorMessage };
    }
  }
};

// Get comprehensive dashboard data
export const getDashboardData = async () => {
  try {
    console.log('📊 Fetching comprehensive dashboard data...');
    
    // Fetch all stats in parallel
    const [userStats, orderStats, productStats] = await Promise.all([
      getAdminStats(),
      getOrderStats(),
      getProductStats()
    ]);
    
    const dashboardData = {
      users: userStats,
      orders: orderStats,
      products: productStats,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('📊 Comprehensive dashboard data:', dashboardData);
    return dashboardData;
  } catch (error) {
    console.error('📊 Error fetching dashboard data:', error);
    throw error;
  }
};
