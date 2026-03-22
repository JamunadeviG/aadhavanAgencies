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

export const createProduct = async (productData, imageFile) => {
  try {
    const formData = new FormData();
    
    // Add product fields
    Object.keys(productData).forEach(key => {
      formData.append(key, productData[key]);
    });
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create product' };
  }
};

export const updateProduct = async (id, productData, imageFile) => {
  try {
    const formData = new FormData();
    
    // Add product fields
    Object.keys(productData).forEach(key => {
      formData.append(key, productData[key]);
    });
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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

// Stock management functions
export const updateProductStock = async (productId, quantityChange, operation = 'subtract') => {
  try {
    const response = await api.patch(`/products/${productId}/stock`, {
      quantityChange,
      operation
    });
    return response.data;
  } catch (error) {
    console.warn('📦 Backend API not available, using local storage:', error.message);
    // Fallback to local storage
    const { updateProductStockLocal } = await import('./stockServiceLocal.js');
    return updateProductStockLocal(productId, quantityChange, operation);
  }
};

export const updateMultipleProductStock = async (stockUpdates) => {
  try {
    const response = await api.patch('/products/stock/bulk', { stockUpdates });
    return response.data;
  } catch (error) {
    console.warn('📦 Backend API not available, using local storage:', error.message);
    // Fallback to local storage
    const { updateMultipleProductStockLocal } = await import('./stockServiceLocal.js');
    return updateMultipleProductStockLocal(stockUpdates);
  }
};

export const getProductStock = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}/stock`);
    return response.data;
  } catch (error) {
    console.warn('📦 Backend API not available, using local storage:', error.message);
    // Fallback to local storage
    const { getProductStockLocal } = await import('./stockServiceLocal.js');
    return getProductStockLocal(productId);
  }
};
