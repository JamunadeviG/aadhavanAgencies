import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { createOrder } from '../services/orderService.js';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../services/cartService.js';
import { PageWrapper, PageContent, Card, CardBody, Grid, Flex, LoadingState } from '../components/Layout.jsx';
import UserNavbar from '../components/UserNavbar.jsx';
import { CommonFooter } from '../components/CommonFooter.jsx';
import './Cart.css';

const Cart = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderForm, setOrderForm] = useState({
    deliveryDate: '',
    deliveryTime: '',
    notes: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');

  // Function to load cart from database with improved error handling
  const loadCart = async () => {
    try {
      console.log('🛒 CART PAGE: Loading cart from database...');
      setLoading(true);
      setError('');
      
      const response = await getCart();
      console.log('🛒 Cart response:', response);
      
      // Handle different response formats
      let items = [];
      if (Array.isArray(response)) {
        items = response;
      } else if (response && Array.isArray(response.items)) {
        items = response.items;
      } else if (response && response.cart && Array.isArray(response.cart.items)) {
        items = response.cart.items;
      } else {
        console.warn('🛒 Unexpected cart data format:', response);
        items = [];
      }
      
      console.log('🛒 Final cart items:', items);
      setCartItems(items);
      
    } catch (error) {
      console.error('🛒 CART PAGE: Error loading cart:', error);
      setCartItems([]);
      setError('Unable to load cart. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle quantity changes
  const handleQuantityChange = async (productId, quantity) => {
    try {
      console.log('🔢 QUANTITY CHANGE START');
      console.log('🔢 Product ID:', productId);
      console.log('🔢 New quantity:', quantity);
      
      if (!quantity || quantity < 1) {
        console.log('🔢 Removing item (quantity < 1)');
        await removeFromCart(productId);
        return;
      }
      
      const response = await updateCartItem(productId, quantity);
      
      if (response.success) {
        console.log('🔢 Quantity updated successfully');
        // Reload cart to get updated items
        await loadCart();
      } else {
        console.log('❌ Quantity update failed:', response.message);
        setError(response.message || 'Failed to update quantity');
      }
    } catch (error) {
      console.error('🔢 QUANTITY CHANGE ERROR:', error);
      setError('Failed to update quantity');
    }
  };

  // Function to remove item from cart
  const handleRemoveItem = async (productId) => {
    try {
      console.log('🗑️ REMOVE ITEM START');
      console.log('🗑️ Product ID:', productId);
      
      const response = await removeFromCart(productId);
      
      if (response.success) {
        console.log('🗑️ Item removed successfully');
        // Reload cart to get updated items
        await loadCart();
      } else {
        console.log('❌ Item removal failed:', response.message);
        setError(response.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('🗑️ REMOVE ITEM ERROR:', error);
      setError('Failed to remove item');
    }
  };

  // Function to clear entire cart
  const handleClearCart = async () => {
    try {
      console.log('🧹 CLEAR CART START');
      
      if (window.confirm('Are you sure you want to clear your entire cart?')) {
        const response = await clearCart();
        
        if (response.success) {
          console.log('🧹 Cart cleared successfully');
          await loadCart(); // Reload from database
        } else {
          console.log('❌ Cart clear failed:', response.message);
          setError(response.message || 'Failed to clear cart');
        }
      }
    } catch (error) {
      console.error('🧹 CLEAR CART ERROR:', error);
      setError('Failed to clear cart');
    }
  };

  // Function to handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Function to close success modal
  const handleCloseSuccessModal = async () => {
    console.log('🎉 Closing success modal and ensuring cart is cleared...');
    
    // Double-ensure cart is cleared from database
    const clearResponse = await clearCart();
    console.log('🎉 Final cart clear response:', clearResponse);
    
    // Close modal
    setShowSuccessModal(false);
    
    // Navigate to user home after successful order
    navigate('/user-home');
  };

  // Function to handle order submission
  const handleSubmitOrder = async () => {
    try {
      console.log('📦 ORDER SUBMISSION START');
      console.log('📦 User object:', user);
      console.log('📦 Cart items:', cartItems);
      console.log('📦 Order form:', orderForm);
      console.log('📦 Button clicked - handleSubmitOrder function called');
      setError('');
      
      if (!user?.id) {
        console.log('❌ User not logged in');
        setError('Please login to place an order');
        return;
      }
      if (!orderForm.deliveryDate || !orderForm.deliveryTime) {
        console.log('❌ Missing delivery info');
        console.log('📦 deliveryDate:', orderForm.deliveryDate);
        console.log('📦 deliveryTime:', orderForm.deliveryTime);
        setError('Please select delivery date and time');
        return;
      }

      if (cartItems.length === 0) {
        console.log('❌ Empty cart');
        setError('Your cart is empty. Add items before placing an order.');
        return;
      }

      // Enhanced order data with complete user information
      const newOrder = {
        customerName: user.name || user.username || 'Customer',
        customerPhone: user.contactNumber || user.phone || 'N/A',
        deliveryAddress: `${user.addressLine1 || ''} ${user.addressLine2 || ''} ${user.city || ''}`.trim() || 'N/A',
        deliveryDate: orderForm.deliveryDate?.trim() || '',
        deliveryTime: orderForm.deliveryTime?.trim() || '',
        notes: orderForm.notes?.trim() || '',
        total: parseFloat(calculateTotal()), // Ensure it's a number
        userId: user.id, // Keep as string, MongoDB will convert to ObjectId
        userEmail: user.email || '',
        userName: user.name || user.username || '',
        items: cartItems.map(item => ({
          productId: item.productId || item._id || item.id || `product-${item.name}-${item.price}`,
          name: item.name?.trim() || '',
          price: parseFloat(item.price), // Ensure it's a number
          quantity: parseInt(item.quantity), // Ensure it's an integer
          unit: item.unit?.trim() || '',
          subtotal: parseFloat(item.price * item.quantity) // Ensure it's a number
        }))
      };

      // Final validation before sending
      const validationErrors = [];
      
      if (!newOrder.customerName) validationErrors.push('Customer name is required');
      if (!newOrder.customerPhone) validationErrors.push('Customer phone is required');
      if (!newOrder.deliveryAddress) validationErrors.push('Delivery address is required');
      if (!newOrder.deliveryDate) validationErrors.push('Delivery date is required');
      if (!newOrder.deliveryTime) validationErrors.push('Delivery time is required');
      if (!newOrder.userId) validationErrors.push('User ID is required');
      if (!newOrder.items || newOrder.items.length === 0) validationErrors.push('Order must contain at least one item');
      if (isNaN(newOrder.total) || newOrder.total <= 0) validationErrors.push('Total amount must be a positive number');
      
      // Validate each item
      newOrder.items.forEach((item, index) => {
        if (!item.productId) validationErrors.push(`Item ${index + 1}: Product ID is required`);
        if (!item.name) validationErrors.push(`Item ${index + 1}: Product name is required`);
        if (isNaN(item.price) || item.price <= 0) validationErrors.push(`Item ${index + 1}: Price must be a positive number`);
        if (isNaN(item.quantity) || item.quantity <= 0) validationErrors.push(`Item ${index + 1}: Quantity must be a positive number`);
        if (!item.unit) validationErrors.push(`Item ${index + 1}: Unit is required`);
        if (isNaN(item.subtotal) || item.subtotal <= 0) validationErrors.push(`Item ${index + 1}: Subtotal must be a positive number`);
      });
      
      if (validationErrors.length > 0) {
        console.error('❌ Validation errors:', validationErrors);
        setError('Validation failed: ' + validationErrors.join(', '));
        return;
      }

      console.log('📦 Enhanced order data for database:', newOrder);
      console.log('📦 Order total:', calculateTotal());
      console.log('📦 Number of items:', cartItems.length);
      console.log('📦 Cart items being sent:', cartItems);
      console.log('📦 Form data:', orderForm);
      console.log('📦 User ID:', user.id);
      console.log('📦 User Email:', user.email);
      console.log('📦 User Name:', user.name || user.username);

      // Validate order data before sending
      if (!newOrder.items || !Array.isArray(newOrder.items)) {
        console.error('❌ Invalid items data before sending:', newOrder.items);
        setError('Invalid cart data. Please refresh and try again.');
        return;
      }

      if (newOrder.items.length === 0) {
        console.error('❌ No items in cart before sending');
        setError('Your cart is empty. Add items before placing an order.');
        return;
      }

      // Validate each item has required fields
      for (let i = 0; i < newOrder.items.length; i++) {
        const item = newOrder.items[i];
        if (!item.productId || !item.name || !item.price || !item.quantity) {
          console.error(`❌ Invalid item at index ${i}:`, item);
          setError(`Invalid item data: ${item.name}. Please refresh and try again.`);
          return;
        }
      }

      // Check if createOrder function exists
      if (typeof createOrder !== 'function') {
        console.error('❌ createOrder function is not available');
        setError('Order service is not available. Please refresh the page.');
        return;
      }

      // Set loading state
      setLoading(true);
      console.log('📦 Loading state set to true');

      // Try direct API call first
      try {
        console.log('📦 Trying direct API call...');
        const token = localStorage.getItem('token');
        console.log('📦 Token available:', !!token);
        
        if (!token) {
          throw new Error('No authentication token found. Please login again.');
        }
        
        console.log('📦 Sending request to: http://localhost:5000/api/orders');
        console.log('📦 Request payload:', JSON.stringify(newOrder, null, 2));
        
        const response = await fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newOrder)
        });
        
        console.log('📦 Direct API response status:', response.status);
        console.log('📦 Direct API response ok:', response.ok);
        console.log('📦 Direct API response headers:', Object.fromEntries(response.headers.entries()));
        
        // Get response text first to see what we received
        const responseText = await response.text();
        console.log('📦 Raw response text:', responseText);
        
        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (parseError) {
          console.error('❌ Failed to parse response as JSON:', parseError);
          console.error('❌ Response text was:', responseText);
          throw new Error('Invalid response from server. Please try again.');
        }
        
        console.log('📦 Parsed response data:', responseData);
        
        if (!response.ok) {
          console.error('❌ Direct API error:', responseData);
          
          // Handle specific error cases
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          } else if (response.status === 400) {
            throw new Error(responseData.message || 'Invalid order data. Please check all fields.');
          } else if (response.status === 404) {
            throw new Error('Order service not found. Please contact support.');
          } else if (response.status === 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
          }
        }
        
        if (responseData.success) {
          console.log('✅ Order placed successfully via direct API');
          console.log('📦 Order details:', responseData.order);
          
          // Clear cart from database
          console.log('📦 Clearing cart from database after successful order...');
          try {
            const clearResponse = await clearCart();
            console.log('📦 Cart clear response:', clearResponse);
            
            if (clearResponse.success) {
              console.log('✅ Cart cleared successfully from database');
              setCartItems([]);
            } else {
              console.log('⚠️ Cart clear failed but order was placed');
              setCartItems([]); // Clear local state anyway
            }
          } catch (clearError) {
            console.error('📦 Error clearing cart from database:', clearError);
            setCartItems([]); // Clear local state anyway
          }
          
          // Show success notification
          setOrderDetails(responseData.order);
          setShowSuccessModal(true);
          
          // Reset form
          console.log('📦 Resetting order form...');
          setOrderForm({
            deliveryDate: '',
            deliveryTime: '',
            notes: ''
          });
        } else {
          console.log('❌ Order placement failed - success flag false');
          console.log('❌ Response message:', responseData.message);
          throw new Error(responseData.message || 'Order placement failed');
        }
        
      } catch (directApiError) {
        console.log('📦 Direct API failed, trying service function...');
        console.error('📦 Direct API error:', directApiError);
        
        // If it's an authentication error, don't try fallback
        if (directApiError.message.includes('Authentication') || directApiError.message.includes('token')) {
          throw directApiError;
        }
        
        // Fallback to service function
        try {
          console.log('📦 Trying service function fallback...');
          const response = await createOrder(newOrder);
          console.log('📦 Service API response received:', response);
          console.log('📦 Response type:', typeof response);
          console.log('📦 Response keys:', Object.keys(response || {}));
          
          if (response.success || response.order || response.data) {
            const orderData = response.order || response.data || response;
            console.log('✅ Order placed successfully via service');
            console.log('📦 Order details:', orderData);
            
            // Clear cart from database
            console.log('📦 Clearing cart from database after successful order...');
            try {
              const clearResponse = await clearCart();
              console.log('📦 Cart clear response:', clearResponse);
              
              if (clearResponse.success) {
                console.log('✅ Cart cleared successfully from database');
                setCartItems([]);
              } else {
                console.log('⚠️ Cart clear failed but order was placed');
                setCartItems([]); // Clear local state anyway
              }
            } catch (clearError) {
              console.error('📦 Error clearing cart from database:', clearError);
              setCartItems([]); // Clear local state anyway
            }
            
            // Show success notification
            setOrderDetails(orderData);
            setShowSuccessModal(true);
            
            // Reset form
            console.log('📦 Resetting order form...');
            setOrderForm({
              deliveryDate: '',
              deliveryTime: '',
              notes: ''
            });
          } else {
            console.log('❌ Service function failed');
            console.log('❌ Response structure:', response);
            console.log('❌ Response.success:', response.success);
            console.log('❌ Response.order:', response.order);
            console.log('❌ Response.data:', response.data);
            console.log('❌ Error message:', response.message);
            throw new Error(response.message || 'Order placement failed via service');
          }
        } catch (serviceError) {
          console.error('📦 Service function error:', serviceError);
          throw new Error(`Both API methods failed. Direct API: ${directApiError.message}, Service: ${serviceError.message}`);
        }
      }
      
    } catch (error) {
      console.error('📦 ORDER ERROR ===');
      console.error('📦 Error object:', error);
      console.error('📦 Error message:', error.message);
      console.error('📦 Error response:', error.response?.data);
      console.error('📦 Error status:', error.response?.status);
      console.error('📦 Error config:', error.config);
      console.error('📦 Error code:', error.code);
      
      // Enhanced error handling
      if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED' || error.message.includes('fetch')) {
        setError('Cannot connect to server. Please check if the backend server is running on port 5000.');
      } else if (error.response?.status === 400) {
        setError('Invalid order data. Please check all fields and try again.');
      } else if (error.response?.status === 401) {
        setError('You are not authorized. Please login again.');
      } else if (error.response?.status === 404) {
        setError('Order service not found. Please contact support.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(error.message || 'Failed to place order. Please try again.');
      }
    } finally {
      // Always clear loading state
      setLoading(false);
      console.log('📦 Loading state cleared');
    }
  };

  // Test function to create minimal order
  const testOrderCreation = async () => {
    try {
      console.log('🧪 TEST ORDER CREATION START');
      
      const testOrder = {
        customerName: 'Test Customer',
        customerPhone: '1234567890',
        deliveryAddress: 'Test Address',
        deliveryDate: '2024-02-20',
        deliveryTime: '14:00',
        notes: 'Test order',
        items: [{
          productId: 'test123',
          name: 'Test Product',
          price: 10,
          quantity: 1,
          unit: 'kg'
        }],
        total: 10,
        userId: user.id || 'testUser123'
      };

      console.log('🧪 Test order data:', testOrder);
      
      const response = await createOrder(testOrder);
      console.log('🧪 Test order response:', response);
      
      if (response.success) {
        console.log('✅ Test order successful');
        alert('Test order placed successfully! Check browser console for details.');
      } else {
        console.log('❌ Test order failed:', response.message);
        alert('Test order failed: ' + response.message);
      }
    } catch (error) {
      console.error('🧪 Test order error:', error);
      alert('Test order error: ' + error.message);
    }
  };

  // Calculate cart total
  const calculateTotal = () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return 0;
    }
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return total + (price * quantity);
    }, 0);
  };

  // Calculate total quantity
  const calculateTotalQuantity = () => {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return 0;
    }
    return cartItems.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
  };

  // Calculate item subtotal
  const calculateItemSubtotal = (item) => {
    return item.price * item.quantity;
  };

  // Get minimum delivery date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Generate time slots for delivery
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 10; // 10 AM start time
    const endHour = 20; // 8 PM end time
    
    for (let hour = startHour; hour <= endHour; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      slots.push(time);
    }
    
    return slots;
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      console.log('Cart update event detected');
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Render cart page
  return (
    <PageWrapper>
      <UserNavbar />
      <PageContent>
        <div className="cart-page">
      {/* Loading State */}
      {loading && (
        <div className="loading">Loading cart...</div>
      )}
      
      {/* Cart Header */}
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <div className="header-actions">
          <p>Review your items and place your order</p>
        </div>
      </div>
      
      {/* Empty Cart State */}
      {cartItems.length === 0 && !loading ? (
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/user-home')}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-content">
          {/* Cart Summary - Now on the left */}
          <div className="cart-summary" style={{ 
            padding: '32px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '12px',
            border: '2px solid #e9ecef',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
            marginBottom: '24px'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '600', 
              marginBottom: '20px',
              color: '#2c3e50'
            }}>Order Summary</h2>
            <div className="summary-details" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="summary-row" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid #e9ecef'
              }}>
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#495057' }}>Total Items:</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>{cartItems.length} products</span>
              </div>
              <div className="summary-row" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid #e9ecef'
              }}>
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#495057' }}>Total Quantity:</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>{calculateTotalQuantity()} units</span>
              </div>
              <div className="summary-row subtotal" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid #e9ecef'
              }}>
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#495057' }}>Subtotal:</span>
                <span style={{ fontSize: '18px', fontWeight: '600', color: '#28a745' }}>₹{calculateTotal()}</span>
              </div>
              <div className="summary-row delivery" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '14px 0',
                borderBottom: '1px solid #e9ecef'
              }}>
                <span style={{ fontSize: '16px', fontWeight: '500', color: '#495057' }}>Delivery Charges:</span>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#28a745' }}>₹0</span>
              </div>
              <div className="summary-row total" style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '18px 0',
                backgroundColor: '#2d5016',
                borderRadius: '6px',
                margin: '0 -16px'
              }}>
                <span style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>Total Amount:</span>
                <span style={{ fontSize: '20px', fontWeight: '700', color: 'white' }}>₹{calculateTotal()}</span>
              </div>
            </div>
            
            {/* Order Form */}
            <div className="order-form">
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '20px',
                color: '#2c3e50'
              }}>Delivery Information</h3>
              
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="deliveryDate" style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#495057',
                  marginBottom: '6px'
                }}>Delivery Date *</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={orderForm.deliveryDate}
                  onChange={handleInputChange}
                  min={getMinDate()}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    backgroundColor: '#fff'
                  }}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label htmlFor="deliveryTime" style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#495057',
                  marginBottom: '6px'
                }}>Delivery Time *</label>
                <select
                  name="deliveryTime"
                  value={orderForm.deliveryTime}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="">Select delivery time</option>
                  {generateTimeSlots().map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="notes" style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#495057',
                  marginBottom: '6px'
                }}>Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={orderForm.notes}
                  onChange={handleInputChange}
                  placeholder="Any special instructions for your order"
                  rows="2"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSubmitOrder}
                disabled={loading}
                style={{ 
                  width: '100%', 
                  marginTop: '20px',
                  padding: '12px 20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  backgroundColor: '#2d5016',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
          
          {/* Cart Items - Now on the right */}
          <div className="cart-items" style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            border: '1px solid #e9ecef'
          }}>
            <div className="cart-items-header" style={{ 
              marginBottom: '20px',
              paddingBottom: '16px',
              borderBottom: '2px solid #f8f9fa'
            }}>
              <h2 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: '#2d5016',
                marginBottom: '8px'
              }}>Cart Items ({cartItems.length})</h2>
              {cartItems.length > 0 && (
                <button 
                  className="btn btn-outline btn-sm clear-cart-btn"
                  onClick={handleClearCart}
                  style={{
                    padding: '8px 16px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: '#fff',
                    color: '#dc3545',
                    border: '1px solid #dc3545',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Clear Cart
                </button>
              )}
            </div>
            
            <div className="items-list">
              {console.log('🔄 RENDERING CART ITEMS:', cartItems)}
              {console.log('🔄 CART ITEMS LENGTH:', cartItems.length)}
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6c757d' }}>
                  <div style={{ 
                    fontSize: '48px', 
                    marginBottom: '16px',
                    opacity: '0.3'
                  }}>🛒</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#495057' }}>Your cart is empty</h3>
                  <p style={{ fontSize: '14px', margin: 0, color: '#6c757d' }}>Add some products to get started!</p>
                </div>
              ) : (
                cartItems.map((item, index) => {
                  console.log(`🔄 RENDERING ITEM ${index + 1}:`, {
                    index: index,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    id: item._id || item.id || item.productId
                  });
                  
                  return (
                    <div key={`cart-item-${index}`} className="cart-item" style={{ 
                      marginBottom: '16px', 
                      border: '1px solid #e9ecef', 
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}>
                      <div className="item-info" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            color: '#2d5016', 
                            fontSize: '15px', 
                            fontWeight: '600',
                            marginBottom: '8px',
                            lineHeight: '1.4'
                          }}>
                            {index + 1}. {item.name}
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                            <span style={{ 
                              color: '#2d5016', 
                              fontSize: '14px', 
                              fontWeight: '600',
                              backgroundColor: '#f8f9fa',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}>
                              ₹{item.price}/{item.unit}
                            </span>
                            <span style={{ 
                              color: '#6c757d', 
                              fontSize: '13px',
                              fontWeight: '500',
                              backgroundColor: '#e9ecef',
                              padding: '4px 8px',
                              borderRadius: '4px'
                            }}>
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button 
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item._id || item.id || item.productId, item.quantity - 1)}
                              style={{ 
                                padding: '6px 10px', 
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item._id || item.id || item.productId, parseInt(e.target.value) || 1)}
                              className="quantity-input"
                              style={{ 
                                width: '60px', 
                                textAlign: 'center', 
                                padding: '6px',
                                border: '1px solid #ced4da',
                                borderRadius: '6px',
                                fontSize: '13px',
                                fontWeight: '500',
                                backgroundColor: '#fff'
                              }}
                            />
                            <button 
                              className="quantity-btn"
                              onClick={() => handleQuantityChange(item._id || item.id || item.productId, item.quantity + 1)}
                              style={{ 
                                padding: '6px 10px', 
                                background: '#2d5016',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              +
                            </button>
                            <button 
                              className="quantity-btn increase-btn"
                              onClick={() => handleQuantityChange(item._id || item.id || item.productId, item.quantity + 5)}
                              style={{ 
                                padding: '6px 10px', 
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                                marginLeft: '4px'
                              }}
                              title="Add 5 more"
                            >
                              +5
                            </button>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ 
                              fontSize: '16px', 
                              fontWeight: '700', 
                              color: '#2d5016',
                              backgroundColor: '#f8f9fa',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              display: 'inline-block'
                            }}>
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                          <div>
                            <button 
                              className="quantity-btn remove-btn"
                              onClick={() => handleRemoveItem(item._id || item.id || item.productId)}
                              style={{ 
                                background: '#dc3545', 
                                color: 'white',
                                padding: '8px 12px',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-header">
              <div className="success-icon">✓</div>
              <h2>Order Placed Successfully!</h2>
            </div>
            <hr />
            <div className="order-details">
              <p><b>Order ID:</b> {orderDetails?.orderId || orderDetails?._id || 'ORD-1771395090839'}</p>
              <p><b>Total Amount:</b> ₹{orderDetails?.total || '100'}</p>
              <p><b>Delivery Date:</b> {orderDetails?.deliveryDate || '2026-02-19'}</p>
              <p><b>Delivery Time:</b> {orderDetails?.deliveryTime || '10:30'}</p>
              <p><b>Status:</b> <span className="status-box">Placed</span></p>
              <p><b>Customer:</b> {orderDetails?.customerName || 'Harini'}</p>
              <p><b>Phone:</b> {orderDetails?.customerPhone || '08838593077'}</p>
              <p><b>Address:</b> {orderDetails?.deliveryAddress || ''}</p>
            </div>
            <div className="info-box">
              <p>Your order has been placed successfully and will be delivered on selected date and time.</p>
              <p>The admin has been notified about your order.</p>
              <p>You can track your order status in Track Orders section.</p>
            </div>
            <div className="popup-footer">
              <button
                className="continue-btn"
                onClick={handleCloseSuccessModal}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      </PageContent>
    </PageWrapper>
  );
};

export default Cart;
