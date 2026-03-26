import axios from 'axios';

// Base URL for API requests
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🔗 API Request:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('🔗 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('🔗 API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('🔗 API Response Error:', error);

    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Server is taking too long to respond.';
    } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      error.message = 'Network error. Unable to connect to server. Please check if the backend server is running on port 5000.';
    } else if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Only redirect if not already on the login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      } else if (error.response.data?.message) {
        // preserve the message from the backend if available
        error.message = error.response.data.message;
      } else {
        error.message = 'Invalid email or password. Please try again.';
      }
    } else if (error.response?.status === 403) {
      error.message = 'Access denied. Admin privileges required.';
    } else if (error.response?.status === 500) {
      error.message = 'Server error. Please try again later.';
    }

    return Promise.reject(error);
  }
);

export default api;
