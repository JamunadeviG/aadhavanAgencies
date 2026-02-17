import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { getCart, updateQuantity, removeFromCart, clearCart, getCartTotal } from '../services/cartService.js';
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

  // Function to load cart from localStorage
  const loadCartFromStorage = () => {
    try {
      const cart = getCart();
      console.log('Loaded cart from service:', cart);
      console.log('Number of items in cart:', cart.length);
      setCartItems(cart);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    }
  };

  // Function to manually refresh cart
  const refreshCart = () => {
    console.log('Manual cart refresh');
    loadCartFromStorage();
  };

  useEffect(() => {
    loadCartFromStorage();
    setLoading(false);
  }, []);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleStorageChange = (e) => {
      console.log('Storage change detected:', e);
      if (e.key === 'cart' || e.key === null) {
        loadCartFromStorage();
      }
    };

    const handleCartUpdate = () => {
      console.log('Cart update event detected');
      loadCartFromStorage();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handlePlaceOrder = () => {
    // No longer need to open modal since form is in summary
    // Just validate and submit directly
    handleSubmitOrder();
  };

  const handleSubmitOrder = () => {
    // Validate required fields
    if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.deliveryAddress) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!orderForm.deliveryDate || !orderForm.deliveryTime) {
      alert('Please select delivery date and time');
      return;
    }

    // Create order object
    const newOrder = {
      id: `ORD-${Date.now()}`,
      userId: user?.id,
      customerName: orderForm.customerName,
      customerPhone: orderForm.customerPhone,
      customerEmail: user?.email,
      items: cartItems.map(item => ({
        productId: item.productId || item.id,
        _id: item._id,
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit
      })),
      total: calculateTotal(),
      deliveryDate: orderForm.deliveryDate,
      deliveryTime: orderForm.deliveryTime,
      notes: orderForm.notes,
      status: 'Processing',
      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Save order to localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    // Create admin notification
    const adminNotification = {
      id: `NOTIF-${Date.now()}`,
      type: 'new_order',
      title: 'New Order Received',
      message: `New order #${newOrder.id} from ${orderForm.customerName}`,
      orderId: newOrder.id,
      customerName: orderForm.customerName,
      customerPhone: orderForm.customerPhone,
      total: newOrder.total,
      deliveryDate: newOrder.deliveryDate,
      deliveryTime: newOrder.deliveryTime,
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    // Save admin notification
    const existingNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    existingNotifications.unshift(adminNotification); // Add to beginning
    localStorage.setItem('adminNotifications', JSON.stringify(existingNotifications));

    // Clear cart
    clearCart();
    setCartItems([]);

    // Show success notification
    setOrderDetails(newOrder);
    setShowSuccessModal(true);

    // Reset form
    setOrderForm({
      deliveryDate: '',
      deliveryTime: '',
      notes: '',
      customerName: '',
      customerPhone: '',
      deliveryAddress: ''
    });

    // Trigger admin notification event
    window.dispatchEvent(new CustomEvent('adminNotification', { detail: adminNotification }));
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/user-home');
  };

  // Generate time slots for delivery
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour}:00`);
      if (hour < 18) {
        slots.push(`${hour}:30`);
      }
    }
    return slots;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const calculateTotal = () => {
    return getCartTotal();
  };

  const handleQuantityChange = (productId, quantity) => {
    try {
      if (!quantity || quantity < 1) {
        handleRemoveItem(productId);
        return;
      }

      updateQuantity(productId, quantity);
      setCartItems(getCart());
      console.log('Updated quantity for product', productId, 'to', quantity);
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const handleRemoveItem = (productId) => {
    try {
      removeFromCart(productId);
      setCartItems(getCart());
      console.log('Removed item from cart:', productId);
      
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        clearCart();
        setCartItems([]);
        console.log('Cart cleared successfully');
        
      } catch (error) {
        console.error('Error clearing cart:', error);
        alert('Failed to clear cart. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <div className="header-actions">
            <button className="btn btn-outline btn-sm" onClick={refreshCart}>
              🔄 Refresh Cart
            </button>
            <p>Review your items and place your order</p>
          </div>
        </div>

        {cartItems.length === 0 ? (
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
                        {item.addedAt && (
                          <p className="item-added">Added: {new Date(item.addedAt).toLocaleString()}</p>
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
                        <div className="item-total">
                          ₹{item.price * item.quantity}
                        </div>
                        <button 
                          className="btn btn-danger btn-sm remove-btn"
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

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Fee:</span>
                  <span>₹0</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
              </div>
              
              {/* Delivery Information in Summary */}
              <div className="delivery-info-summary">
                <h4>Delivery Information *</h4>
                <div className="form-group">
                  <label>Delivery Date *</label>
                  <input
                    type="date"
                    value={orderForm.deliveryDate}
                    onChange={(e) => setOrderForm({...orderForm, deliveryDate: e.target.value})}
                    min={getMinDate()}
                    required
                    className="summary-input"
                  />
                </div>
                <div className="form-group">
                  <label>Delivery Time *</label>
                  <select
                    value={orderForm.deliveryTime}
                    onChange={(e) => setOrderForm({...orderForm, deliveryTime: e.target.value})}
                    required
                    className="summary-input"
                  >
                    <option value="">Select time</option>
                    {generateTimeSlots().map((slot) => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                    placeholder="Enter your name"
                    required
                    className="summary-input"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value})}
                    placeholder="Enter your phone number"
                    required
                    className="summary-input"
                  />
                </div>
                <div className="form-group">
                  <label>Delivery Address *</label>
                  <textarea
                    value={orderForm.deliveryAddress}
                    onChange={(e) => setOrderForm({...orderForm, deliveryAddress: e.target.value})}
                    placeholder="Enter your delivery address"
                    rows={2}
                    required
                    className="summary-input"
                  />
                </div>
                <div className="form-group">
                  <label>Order Notes (Optional)</label>
                  <textarea
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                    placeholder="Any special instructions for delivery..."
                    rows={2}
                    className="summary-input"
                  />
                </div>
              </div>
              
              <div className="summary-actions">
                <button 
                  className="btn btn-outline"
                  onClick={() => navigate('/user-home')}
                >
                  Continue Shopping
                </button>
                <button 
                  className="btn btn-primary place-order-btn"
                  onClick={handleSubmitOrder}
                >
                  Place Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && orderDetails && (
        <div className="modal-overlay">
          <div className="modal success-modal">
            <div className="modal-header">
              <div className="success-icon">✅</div>
              <h3>Order Placed Successfully!</h3>
            </div>
            <div className="modal-body">
              <div className="order-confirmation">
                <p><strong>Order ID:</strong> {orderDetails.id}</p>
                <p><strong>Total Amount:</strong> ₹{orderDetails.total}</p>
                <p><strong>Delivery Date:</strong> {orderDetails.deliveryDate}</p>
                <p><strong>Delivery Time:</strong> {orderDetails.deliveryTime}</p>
                <p><strong>Status:</strong> <span className="status-processing">Processing</span></p>
                <p><strong>Customer:</strong> {orderDetails.customerName}</p>
                <p><strong>Phone:</strong> {orderDetails.customerPhone}</p>
                <p><strong>Address:</strong> {orderDetails.deliveryAddress}</p>
              </div>
              <div className="confirmation-message">
                <p>Your order has been placed successfully and will be delivered on the selected date and time.</p>
                <p>The admin has been notified about your order.</p>
                <p>You can track your order status in the Track Orders section.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-primary"
                onClick={handleCloseSuccessModal}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
