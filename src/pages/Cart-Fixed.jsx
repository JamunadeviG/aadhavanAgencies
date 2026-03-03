import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { getUserCart, updateCartItem, removeFromCart, clearCart } from '../services/cartApiService.js';
import { createOrder } from '../services/orderService.js';
import './Cart.css';

const Cart = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
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

  // Function to load cart from database
  const loadCart = async () => {
    try {
      console.log('🛒 CART PAGE: Loading cart...');
      setLoading(true);
      
      if (user?.id) {
        console.log('🛒 CART PAGE: User logged in, fetching cart for user:', user.id);
        const response = await getUserCart();
        console.log('🛒 CART PAGE: Cart API response:', response);
        
        if (response.success && response.cart) {
          console.log('🛒 CART PAGE: Cart loaded successfully with items:', response.cart.items);
          setCartItems(response.cart.items || []);
        } else if (response.success) {
          console.log('🛒 CART PAGE: Cart loaded but empty');
          setCartItems([]);
        } else {
          console.log('🛒 CART PAGE: Cart load failed:', response.message);
          setCartItems([]);
        }
      } else {
        console.log('🛒 CART PAGE: No user logged in');
        setCartItems([]);
      }
    } catch (error) {
      console.error('🛒 CART PAGE: Error loading cart from database:', error);
      console.error('🛒 CART PAGE: Error details:', error.response?.data);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle quantity changes
  const handleQuantityChange = async (productId, quantity) => {
    try {
      if (!quantity || quantity < 1) {
        console.log('🔢 Removing item (quantity < 1)');
        handleRemoveItem(productId);
        return;
      }

      console.log('🔢 Updating quantity for product:', productId, 'to', quantity);
      
      const response = await updateCartItem({ productId, quantity });
      
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
      setError(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  // Function to remove item from cart
  const handleRemoveItem = async (productId) => {
    try {
      console.log('🗑️ REMOVE ITEM START');
      console.log('🗑️ Product ID:', productId);
      
      const response = await removeFromCart({ productId });
      
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
      setError(error.response?.data?.message || 'Failed to remove item');
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
          setCartItems([]);
        } else {
          console.log('❌ Cart clear failed:', response.message);
          setError(response.message || 'Failed to clear cart');
        }
      }
    } catch (error) {
      console.error('🧹 CLEAR CART ERROR:', error);
      setError(error.response?.data?.message || 'Failed to clear cart');
    }
  };

  // Function to handle order submission
  const handleSubmitOrder = async () => {
    try {
      console.log('📦 ORDER SUBMISSION START');
      setError('');
      
      if (!user?.id) {
        setError('Please login to place an order');
        return;
      }

      if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.deliveryAddress) {
        setError('Please fill in all required fields: Name, Phone, and Address');
        return;
      }
      
      if (!orderForm.deliveryDate || !orderForm.deliveryTime) {
        setError('Please select delivery date and time');
        return;
      }

      if (cartItems.length === 0) {
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

      // Save order to database
      const response = await createOrder(newOrder);
      
      if (response.success) {
        console.log('✅ Order placed successfully');
        console.log('📦 Order details:', response.order);
        
        // Clear cart from database
        await clearCart();
        setCartItems([]);
        
        // Show success notification
        setOrderDetails(response.order);
        setShowSuccessModal(true);
        setShowOrderModal(false);
        
        // Reset form
        setOrderForm({
          deliveryDate: '',
          deliveryTime: '',
          notes: '',
          customerName: '',
          customerPhone: '',
          deliveryAddress: ''
        });
      } else {
        console.log('❌ Order placement failed:', response.message);
        setError(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('📦 ORDER ERROR ===');
      console.error('Error:', error);
      console.error('Error stack:', error.stack);
      setError('Failed to place order. Please try again.');
    }
  };

  // Function to close success modal and redirect
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/track-orders');
  };

  // Calculate cart total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
  }, [user?.id]);

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
              {cartItems.map((item) => {
                const itemKey = item._id || item.id;
                return (
                  <div key={itemKey} className="cart-item">
                    <div className="item-info">
                      <h3>{item.name}</h3>
                      <p className="item-price">₹{item.price}/{item.unit}</p>
                      {item.stock && (
                        <p className="item-stock">Available: {item.stock} {item.unit}</p>
                      )}
                    </div>
                    <div className="item-controls">
                      <div className="quantity-control">
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(itemKey, item.quantity - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(itemKey, parseInt(e.target.value) || 1)}
                          className="quantity-input"
                        />
                        <button 
                          className="quantity-btn"
                          onClick={() => handleQuantityChange(itemKey, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="item-total">
                      ₹{item.price * item.quantity}
                    </div>
                    <div className="item-actions">
                      <button 
                        className="quantity-btn remove-btn"
                        onClick={() => handleRemoveItem(itemKey)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Cart Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{calculateTotal()}</span>
              </div>
              <div className="summary-row">
                <span>Item Count:</span>
                <span>{cartItems.length}</span>
              </div>
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
              <p>
                <strong>Order ID:</strong> {orderDetails?.orderId}
              </p>
              <p>
                <strong>Customer:</strong> {orderDetails?.customerName}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹{orderDetails?.total}
              </p>
              <p>
                <strong>Delivery Date:</strong> {orderDetails?.deliveryDate}
              </p>
              <p>
                <strong>Delivery Time:</strong> {orderDetails?.deliveryTime}
              </p>
              <p>
                <strong>Status:</strong> {orderDetails?.status}
              </p>
            </div>
            <div className="modal-actions">
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
