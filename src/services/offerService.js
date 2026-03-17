import api from './api.js';
const API_BASE_URL = 'http://localhost:5003/api';

// Get all offers
export const getOffers = async () => {
  try {
    console.log('🔄 Fetching offers from backend...');
    const response = await api.get('/offers');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching offers:', error);
    throw error.response?.data || error;
  }
};

// Get offer by ID
export const getOfferById = async (id) => {
  try {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching offer:', error);
    throw error.response?.data || error;
  }
};

// Create new offer
export const createOffer = async (offerData, imageFile) => {
  try {
    const formData = new FormData();
    
    // Add offer fields
    Object.keys(offerData).forEach(key => {
      // If it's an array, append each item separately or JSON stringify based on what backend expects
      if (Array.isArray(offerData[key])) {
        // Backend handles splitting if passing as a comma separated string is better
        formData.append(key, offerData[key].join(','));
      } else if (offerData[key] !== null && offerData[key] !== undefined) {
        formData.append(key, offerData[key]);
      }
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await api.post('/offers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error.response?.data || error;
  }
};

// Update offer
export const updateOffer = async (id, offerData, imageFile) => {
  try {
    const formData = new FormData();
    
    // Add offer fields
    Object.keys(offerData).forEach(key => {
      if (Array.isArray(offerData[key])) {
        formData.append(key, offerData[key].join(','));
      } else if (offerData[key] !== null && offerData[key] !== undefined) {
        formData.append(key, offerData[key]);
      }
    });

    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await api.put(`/offers/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error updating offer:', error);
    throw error.response?.data || error;
  }
};

// Delete offer
export const deleteOffer = async (id) => {
  try {
    const response = await api.delete(`/offers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting offer:', error);
    throw error.response?.data || error;
  }
};

// Get active offers for customers
export const getActiveOffers = async () => {
  try {
    const response = await api.get(`/offers/active`);
    return response.data;
  } catch (error) {
    console.error('Error fetching active offers:', error);
    throw error.response?.data || error;
  }
};

// Generate coupon code for offer
export const generateCouponCode = async (id) => {
  try {
    const response = await api.post(`/offers/${id}/generate-coupon`);
    return response.data;
  } catch (error) {
    console.error('Error generating coupon code:', error);
    throw error.response?.data || error;
  }
};
