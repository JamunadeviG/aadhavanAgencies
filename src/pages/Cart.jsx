import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { createOrder } from '../services/orderService.js';
import './Cart.css';

// LocalStorage Cart Functions - Same as UserHome
const getCartFromStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    console.log('🛒 GET CART FROM STORAGE:', cart);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error getting cart from localStorage:', error);
    return [];
  }
};

const saveCartToStorage = (cart) => {
  try {
    console.log('🛒 SAVE CART TO STORAGE:', cart);
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const updateCartItemLocal = (productId, quantity) => {
  console.log('🛒 UPDATE CART ITEM START');
  console.log('🛒 Product ID:', productId);
  console.log('🛒 New quantity:', quantity);
  
  const cart = getCartFromStorage();
  console.log('🛒 Current cart before update:', cart);
  
  const itemIndex = cart.findIndex(item => 
    item.productId === productId || item._id === productId || item.id === productId
  );
  
  console.log('🛒 Found item at index:', itemIndex);
  
  if (itemIndex !== -1) {
    if (quantity <= 0) {
      cart.splice(itemIndex, 1);
      console.log('🛒 Removed item from cart');
    } else {
      cart[itemIndex].quantity = quantity;
      console.log('🛒 Updated item quantity to:', quantity);
    }
    saveCartToStorage(cart);
    console.log('🛒 Cart saved after update');
    return { success: true, cart: { itemCount: cart.length, items: cart } };
  }
  
  console.log('❌ Item not found in cart');
  return { success: false, message: 'Item not found in cart' };
};

const removeCartItemLocal = (productId) => {
  console.log('🛒 REMOVE CART ITEM START');
  console.log('🛒 Product ID:', productId);
  
  const cart = getCartFromStorage();
  console.log('🛒 Current cart before removal:', cart);
  
  const itemIndex = cart.findIndex(item => 
    item.productId === productId || item._id === productId || item.id === productId
  );
  
  console.log('🛒 Found item at index:', itemIndex);
  
  if (itemIndex !== -1) {
    const removedItem = cart[itemIndex];
    cart.splice(itemIndex, 1);
    console.log('🛒 Removed item:', removedItem);
    saveCartToStorage(cart);
    console.log('🛒 Cart saved after removal');
    return { success: true, cart: { itemCount: cart.length, items: cart } };
  }
  
  console.log('❌ Item not found in cart');
  return { success: false, message: 'Item not found in cart' };
};

const clearCartLocal = () => {
  console.log('🛒 CLEAR CART START');
  localStorage.removeItem('cart');
  window.dispatchEvent(new Event('cartUpdated'));
  console.log('🛒 Cart cleared from localStorage');
  return { success: true };
};

const Cart = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderForm, setOrderForm] = useState({
    deliveryDate: '',
    deliveryTime: '',
    notes: '',
    customerName: '',
    customerPhone: '',
    deliveryAddress: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState('');

  // Function to load cart from localStorage
  const loadCart = () => {
    try {
      console.log('🛒 CART PAGE: Loading cart from localStorage...');
      setLoading(true);
      
      // Direct localStorage access
      const cartData = localStorage.getItem('cart');
      console.log('🛒 Raw cart data from localStorage:', cartData);
      
      let cart = [];
      if (cartData) {
        try {
          cart = JSON.parse(cartData);
        } catch (parseError) {
          console.error('🛒 Error parsing cart data:', parseError);
          cart = [];
        }
      }
      
      console.log('🛒 Parsed cart:', cart);
      console.log('🛒 Cart length:', cart.length);
      console.log('🛒 Cart items details:', cart.map((item, idx) => ({
        index: idx,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        id: item._id || item.id || item.productId
      })));
      
      setCartItems(cart);
    } catch (error) {
      console.error('🛒 CART PAGE: Error loading cart from localStorage:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Manual debug function
  const debugLocalStorage = () => {
    console.log('🔍 DEBUGGING LOCAL STORAGE');
    const allKeys = Object.keys(localStorage);
    console.log('🔍 All localStorage keys:', allKeys);
    
    allKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`🔍 ${key}:`, value);
    });
    
    const cartData = localStorage.getItem('cart');
    console.log('🔍 Cart data specifically:', cartData);
    
    if (cartData) {
      try {
        const parsed = JSON.parse(cartData);
        console.log('🔍 Parsed cart data:', parsed);
        console.log('🔍 Cart data type:', typeof parsed);
        console.log('🔍 Is array?:', Array.isArray(parsed));
        console.log('🔍 Cart length:', parsed.length);
      } catch (e) {
        console.error('🔍 Error parsing cart:', e);
      }
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
        handleRemoveItem(productId);
        return;
      }
      
      const response = updateCartItemLocal(productId, quantity);
      
      if (response.success) {
        console.log('🔢 Quantity updated successfully');
        // Reload cart to get updated items
        loadCart();
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
      
      const response = removeCartItemLocal(productId);
      
      if (response.success) {
        console.log('🗑️ Item removed successfully');
        // Reload cart to get updated items
        loadCart();
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
        const response = clearCartLocal();
        
        if (response.success) {
          console.log('🧹 Cart cleared successfully');
          setCartItems([]);
        } else {
          console.log('❌ Cart clear failed:', response.message);
          setError('Failed to clear cart');
        }
      }
    } catch (error) {
      console.error('🧹 CLEAR CART ERROR:', error);
      setError('Failed to clear cart');
    }
  };

  // Function to handle order submission
  const handleSubmitOrder = async () => {
    try {
      console.log('📦 ORDER SUBMISSION START');
      console.log('📦 User object:', user);
      console.log('📦 Cart items:', cartItems);
      console.log('📦 Order form:', orderForm);
      setError('');
      
      if (!user?.id) {
        console.log('❌ User not logged in');
        setError('Please login to place an order');
        return;
      }

      if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.deliveryAddress) {
        console.log('❌ Missing required fields');
        console.log('📦 customerName:', orderForm.customerName);
        console.log('📦 customerPhone:', orderForm.customerPhone);
        console.log('📦 deliveryAddress:', orderForm.deliveryAddress);
        setError('Please fill in all required fields: Name, Phone, and Address');
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

      const newOrder = {
        customerName: orderForm.customerName,
        customerPhone: orderForm.customerPhone,
        deliveryAddress: orderForm.deliveryAddress,
        items: cartItems.map(item => ({
          productId: item.productId || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit
        })),
        total: calculateTotal(),
        deliveryDate: orderForm.deliveryDate,
        deliveryTime: orderForm.deliveryTime,
        notes: orderForm.notes,
        userId: user.id
      };

      console.log('📦 Submitting order to database:', newOrder);
      console.log('📦 Order total:', calculateTotal());
      console.log('📦 Number of items:', cartItems.length);
      console.log('📦 Cart items being sent:', cartItems);
      console.log('📦 Form data:', orderForm);
      console.log('📦 User ID:', user.id);

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

      // Save order to database
      console.log('📦 Calling createOrder API...');
      const response = await createOrder(newOrder);
      console.log('📦 API response:', response);
      
      if (response.success) {
        console.log('✅ Order placed successfully');
        console.log('📦 Order details:', response.order);
        
        // Clear cart from localStorage
        console.log('📦 Clearing cart after successful order...');
        const clearResponse = clearCartLocal();
        console.log('📦 Cart clear response:', clearResponse);
        
        if (clearResponse.success) {
          console.log('✅ Cart cleared successfully');
          setCartItems([]);
        } else {
          console.log('⚠️ Cart clear failed but order was placed');
        }
        
        // Show success notification
        setOrderDetails(response.order);
        setShowSuccessModal(true);
        
        // Reset form
        console.log('📦 Resetting order form...');
        setOrderForm({
          deliveryDate: '',
          deliveryTime: '',
          notes: '',
          customerName: '',
          customerPhone: '',
          deliveryAddress: ''
        });
      } else {
        console.log('❌ Order placement failed');
        console.log('❌ Error message:', response.message);
        setError(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('📦 ORDER ERROR ===');
      console.error('📦 Error object:', error);
      console.error('📦 Error message:', error.message);
      console.error('📦 Error response:', error.response?.data);
      console.error('📦 Error status:', error.response?.status);
      setError(error.response?.data?.message || error.message || 'Failed to place order. Please try again.');
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
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calculate total quantity
  const calculateTotalQuantity = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
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
    <div className="cart-page">
      {/* Loading State */}
      {loading && (
        <div className="loading">Loading cart...</div>
      )}
      
      {/* Cart Header */}
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <div className="header-actions">
          <button className="btn btn-outline btn-sm" onClick={loadCart}>
            🔄 Refresh Cart
          </button>
          <button 
            className="btn btn-outline btn-sm" 
            onClick={debugLocalStorage}
            style={{ marginLeft: '10px', background: '#ffc107', borderColor: '#ffc107', color: '#000' }}
          >
            🔍 Debug Storage
          </button>
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
          <div className="cart-items">
            <div className="cart-items-header">
              <h2>Cart Items ({cartItems.length})</h2>
              {cartItems.length > 0 && (
                <button 
                  className="btn btn-outline btn-sm clear-cart-btn"
                  onClick={handleClearCart}
                >
                  Clear Cart
                </button>
              )}
            </div>
            
            <div className="items-list">
              {console.log('🔄 RENDERING CART ITEMS:', cartItems)}
              {console.log('🔄 CART ITEMS LENGTH:', cartItems.length)}
              {cartItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <h3>Your cart is empty</h3>
                  <p>Add some products to get started!</p>
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
                      marginBottom: '20px', 
                      border: '2px solid #007bff', 
                      borderRadius: '8px',
                      padding: '20px',
                      backgroundColor: 'white'
                    }}>
                      <div className="item-info">
                        <h3 style={{ 
                          color: '#007bff', 
                          fontSize: '18px', 
                          fontWeight: 'bold',
                          marginBottom: '10px'
                        }}>
                          {index + 1}. {item.name}
                        </h3>
                        <p className="item-price" style={{ 
                          color: '#28a745', 
                          fontSize: '16px', 
                          fontWeight: '600',
                          marginBottom: '5px'
                        }}>
                          ₹{item.price}/{item.unit}
                        </p>
                        {item.stock && (
                          <p className="item-stock" style={{ 
                            color: '#6c757d', 
                            fontSize: '14px',
                            marginBottom: '0'
                          }}>
                            Available: {item.stock} {item.unit}
                          </p>
                        )}
                      </div>
                      <div className="item-controls">
                        <div className="quantity-control">
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item._id || item.id || item.productId, item.quantity - 1)}
                            style={{ padding: '5px 10px', margin: '0 2px' }}
                          >
                            -
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
                              margin: '0 5px',
                              padding: '5px'
                            }}
                          />
                          <button 
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(item._id || item.id || item.productId, item.quantity + 1)}
                            style={{ padding: '5px 10px', margin: '0 2px' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="item-total" style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: '#dc3545',
                        minWidth: '100px',
                        textAlign: 'right'
                      }}>
                        ₹{item.price * item.quantity}
                      </div>
                      <div className="item-actions">
                        <button 
                          className="quantity-btn remove-btn"
                          onClick={() => handleRemoveItem(item._id || item.id || item.productId)}
                          style={{ 
                            background: '#dc3545', 
                            color: 'white',
                            padding: '8px 15px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          
          {/* Cart Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Total Items:</span>
                <span>{cartItems.length} products</span>
              </div>
              <div className="summary-row">
                <span>Total Quantity:</span>
                <span>{calculateTotalQuantity()} units</span>
              </div>
              <div className="summary-row subtotal">
                <span>Subtotal:</span>
                <span>₹{calculateTotal()}</span>
              </div>
              <div className="summary-row delivery">
                <span>Delivery Charges:</span>
                <span>₹0</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{calculateTotal()}</span>
              </div>
            </div>
            
            {/* Detailed Item Breakdown */}
            <div className="item-breakdown">
              <h3>Item Details</h3>
              {cartItems.map((item) => {
                const itemKey = item._id || item.id || item.productId;
                const subtotal = calculateItemSubtotal(item);
                return (
                  <div key={itemKey} className="breakdown-item">
                    <div className="breakdown-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x {item.quantity} {item.unit}</span>
                    </div>
                    <div className="breakdown-pricing">
                      <span className="item-price">₹{item.price}/{item.unit}</span>
                      <span className="item-subtotal">₹{subtotal}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Order Form */}
            <div className="order-form">
              <h3>Delivery Information</h3>
              
              <div className="form-group">
                <label htmlFor="customerName">Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={orderForm.customerName}
                  onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="customerPhone">Phone Number *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={orderForm.customerPhone}
                  onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="deliveryAddress">Delivery Address *</label>
                <textarea
                  name="deliveryAddress"
                  value={orderForm.deliveryAddress}
                  onChange={(e) => setOrderForm({...orderForm, deliveryAddress: e.target.value})}
                  rows={3}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="deliveryDate">Delivery Date *</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={orderForm.deliveryDate}
                  onChange={(e) => setOrderForm({...orderForm, deliveryDate: e.target.value})}
                  min={getMinDate()}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="deliveryTime">Delivery Time *</label>
                <select
                  name="deliveryTime"
                  value={orderForm.deliveryTime}
                  onChange={(e) => setOrderForm({...orderForm, deliveryTime: e.target.value})}
                  required
                >
                  <option value="">Select Time</option>
                  {generateTimeSlots().map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Order Notes (optional)</label>
                <textarea
                  name="notes"
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                  rows={4}
                  placeholder="Add any special instructions..."
                />
              </div>
              
              <button 
                type="button"
                className="btn btn-primary"
                onClick={handleSubmitOrder}
              >
                Place Order
              </button>
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
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="modal-header">
              <div className="success-icon">✅</div>
              <h3>Order Placed Successfully!</h3>
            </div>
            <div className="modal-body">
              <div className="order-details">
                <div className="detail-row">
                  <span className="detail-label">Order ID:</span>
                  <span className="detail-value">{orderDetails?.orderId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Customer Name:</span>
                  <span className="detail-value">{orderDetails?.customerName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{orderDetails?.customerPhone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Delivery Address:</span>
                  <span className="detail-value">{orderDetails?.deliveryAddress}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Amount:</span>
                  <span className="detail-value">₹{orderDetails?.total}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Delivery Date:</span>
                  <span className="detail-value">{orderDetails?.deliveryDate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Delivery Time:</span>
                  <span className="detail-value">{orderDetails?.deliveryTime}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Order Status:</span>
                  <span className="detail-value status-pending">{orderDetails?.status}</span>
                </div>
                {orderDetails?.notes && (
                  <div className="detail-row">
                    <span className="detail-label">Order Notes:</span>
                    <span className="detail-value">{orderDetails?.notes}</span>
                  </div>
                )}
                {orderDetails?.items && orderDetails.items.length > 0 && (
                  <div className="order-items-summary">
                    <h4>Order Items:</h4>
                    {orderDetails.items.map((item, index) => (
                      <div key={index} className="order-item-summary">
                        <span>{item.name} x {item.quantity} {item.unit}</span>
                        <span>₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <p className="success-message">Thank you for your order! You will receive a confirmation call shortly.</p>
              <button 
                className="btn btn-primary"
                onClick={handleCloseSuccessModal}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
