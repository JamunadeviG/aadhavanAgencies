const API_BASE_URL = 'http://localhost:5003/api';

// Get all offers
export const getOffers = async () => {
  try {
    console.log('🔄 Fetching offers from backend...');
    const response = await fetch(`${API_BASE_URL}/offers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', response.headers);
    
    const data = await response.json();
    console.log('📊 Offers data:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching offers:', error);
    throw error;
  }
};

// Get offer by ID
export const getOfferById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/offers/${id}`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch offer');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching offer:', error);
    throw error;
  }
};

// Create new offer
export const createOffer = async (offerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offerData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create offer');
    }
    
    return data;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

// Update offer
export const updateOffer = async (id, offerData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/offers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offerData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update offer');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating offer:', error);
    throw error;
  }
};

// Delete offer
export const deleteOffer = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/offers/${id}`, {
      method: 'DELETE',
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete offer');
    }
    
    return data;
  } catch (error) {
    console.error('Error deleting offer:', error);
    throw error;
  }
};

// Get active offers for customers
export const getActiveOffers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/offers/active`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch active offers');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching active offers:', error);
    throw error;
  }
};

// Generate coupon code for offer
export const generateCouponCode = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/offers/${id}/generate-coupon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to generate coupon code');
    }
    
    return data;
  } catch (error) {
    console.error('Error generating coupon code:', error);
    throw error;
  }
};
