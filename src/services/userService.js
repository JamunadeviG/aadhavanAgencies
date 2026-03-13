import api from './api.js';

/**
 * Test basic API connectivity
 * @returns {Object} Test response
 */
export const testApiConnection = async () => {
  try {
    console.log('👥 User Service: Testing basic API connection...');
    const response = await api.get('/test');
    console.log('👥 User Service: API test successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('👥 User Service: API test failed:', error);
    throw error;
  }
};

/**
 * Test database health
 * @returns {Object} Health check response
 */
export const checkDatabaseHealth = async () => {
  try {
    console.log('👥 User Service: Checking database health...');
    console.log('👥 User Service: API URL:', api.defaults.baseURL);
    console.log('👥 User Service: Request URL:', '/users/health');
    
    const response = await api.get('/users/health');
    console.log('👥 User Service: Health check response:', response.data);
    console.log('👥 User Service: Response status:', response.status);
    return response.data;
  } catch (error) {
    console.error('👥 User Service: Database health check failed:', error);
    console.error('👥 User Service: Error config:', error.config);
    console.error('👥 User Service: Error response:', error.response);
    console.error('👥 User Service: Error status:', error.response?.status);
    console.error('👥 User Service: Error data:', error.response?.data);
    throw error.response?.data || { message: 'Database health check failed' };
  }
};

/**
 * Get all users from the database
 * @returns {Object} Response with users data
 */
export const getUsers = async () => {
  try {
    console.log('👥 User Service: Fetching users from API...');
    console.log('👥 User Service: Request URL:', '/users');
    console.log('👥 User Service: API baseURL:', api.defaults.baseURL);
    
    const response = await api.get('/users');
    console.log('👥 User Service: API response:', response.data);
    console.log('👥 User Service: Response status:', response.status);
    console.log('👥 User Service: Response headers:', response.headers);
    return response.data;
  } catch (error) {
    console.error('👥 User Service: Error fetching users:', error);
    console.error('👥 User Service: Error config:', error.config);
    console.error('👥 User Service: Error response:', error.response);
    console.error('👥 User Service: Error status:', error.response?.status);
    console.error('👥 User Service: Error data:', error.response?.data);
    
    // Return a more user-friendly error
    if (error.response?.status === 401) {
      throw { message: 'Unauthorized. Admin access required.' };
    } else if (error.response?.status === 403) {
      throw { message: 'Access denied. Admin privileges required.' };
    } else if (error.response?.status === 500) {
      throw { message: 'Server error. Please try again later.' };
    } else if (error.code === 'NETWORK_ERROR') {
      throw { message: 'Network error. Please check your connection.' };
    } else {
      throw error.response?.data || { message: 'Failed to fetch users' };
    }
  }
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Object} User data
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user' };
  }
};

/**
 * Update user role
 * @param {string} userId - User ID
 * @param {string} role - New role
 * @returns {Object} Updated user data
 */
export const updateUserRole = async (userId, role) => {
  try {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update user role' };
  }
};

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Object} Response message
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete user' };
  }
};
