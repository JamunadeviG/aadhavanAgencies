import api from './api.js';

// Product service - handles product CRUD API calls

export const getProducts = async () => {
  try {
    const response = await api.get('/products');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch products' };
  }
};

export const createProduct = async (productData) => {
  try {
    const response = await api.post('/products', productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create product' };
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update product' };
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete product' };
  }
};
