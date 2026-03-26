import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { createOrder } from '../services/orderService.js';
import { getCart, updateCartItem, removeFromCart, clearCart } from '../services/cartService.js';
import { getActiveOffers } from '../services/offerService.js';
import { PageWrapper, PageContent } from '../components/Layout.jsx';
import UserNavbar from '../components/UserNavbar.jsx';
import { getImageUrl } from '../utils/imageUtils.js';
import CountUp from 'react-countup';
import './Cart.css';

const Cart = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Slide-in drawer mount animation
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form & Coupon states
  const [orderForm, setOrderForm] = useState({
    deliveryDate: '',
    deliveryTime: '',
    notes: ''
  });
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage');
  const [maxDiscount, setMaxDiscount] = useState(null);
  const [activeOffers, setActiveOffers] = useState([]);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState('');

  const previousTotalRef = useRef(0);

  useEffect(() => {
    // Trigger drawer slide on mount
    setTimeout(() => setIsDrawerOpen(true), 50);
    loadCart();
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const response = await getActiveOffers();
      setActiveOffers(response.offers || []);
    } catch (e) {
      console.log('Failed to load active offers', e);
    }
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getCart();

      let items = [];
      if (Array.isArray(response)) items = response;
      else if (response?.items) items = response.items;
      else if (response?.cart?.items) items = response.cart.items;

      setCartItems(items);
    } catch (error) {
      setError('Unable to load cart. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;

    // Add temporary bounce class
    const btn = document.getElementById(`qty-btn-${productId}-${change > 0 ? 'plus' : 'minus'}`);
    if (btn) {
      btn.classList.add('bounce-anim');
      setTimeout(() => btn.classList.remove('bounce-anim'), 300);
    }

    if (newQuantity < 1) {
      await handleRemoveItem(productId);
      return;
    }
    try {
      const res = await updateCartItem(productId, newQuantity);
      if (res.success) {
        // Optimistic update
        setCartItems(prev => prev.map(item => item.productId === productId ? { ...item, quantity: newQuantity } : item));
        window.dispatchEvent(new Event('cartUpdated'));
      }
    } catch (e) {
      setError('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      setCartItems(prev => prev.filter(item => item.productId !== productId));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      setError('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Clear entire cart?')) {
      await clearCart();
      setCartItems([]);
      window.dispatchEvent(new Event('cartUpdated'));
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)), 0);
  };

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME10') {
      setDiscount(10);
      setDiscountType('percentage');
      setMaxDiscount(null);
      return;
    }

    // Find matching offer
    const matchedOffer = activeOffers.find(o => o.couponCode === couponCode.toUpperCase());
    if (matchedOffer) {
      // Calculate eligible subtotal
      let eligibleSubtotal = 0;

      const hasSpecificProducts = matchedOffer.applicableProducts && matchedOffer.applicableProducts.length > 0;
      const hasSpecificCategories = matchedOffer.applicableCategories && matchedOffer.applicableCategories.length > 0;

      if (!hasSpecificProducts && !hasSpecificCategories) {
        eligibleSubtotal = currentSubtotal;
      } else {
        eligibleSubtotal = cartItems.reduce((total, item) => {
          let isEligible = false;
          if (hasSpecificProducts && matchedOffer.applicableProducts.some(p => p._id === item.productId || p === item.productId)) {
            isEligible = true;
          }
          if (hasSpecificCategories && item.category && matchedOffer.applicableCategories.some(cat => cat.toLowerCase() === item.category.toLowerCase())) {
            isEligible = true;
          }
          if (isEligible) {
            return total + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1));
          }
          return total;
        }, 0);
      }

      if (eligibleSubtotal === 0) {
        setError('No eligible products in cart for this coupon');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (matchedOffer.minOrderAmount && eligibleSubtotal < matchedOffer.minOrderAmount) {
        setError(`Minimum eligible order amount of ₹${matchedOffer.minOrderAmount} required`);
        setTimeout(() => setError(''), 3000);
        return;
      }

      // Save eligible sum so we compute it dynamically in render
      setDiscount(matchedOffer.discount);
      setDiscountType(matchedOffer.discountType);
      setMaxDiscount(matchedOffer.maxDiscountAmount);

    } else {
      setError('Invalid coupon code');
      setTimeout(() => setError(''), 3000);
    }
  };

  const currentSubtotal = calculateSubtotal();

  let computedDiscount = 0;
  // Recalculate eligible items in render to be safe if cart changes
  const activeCouponOffer = activeOffers.find(o => o.couponCode === couponCode.toUpperCase()) || (couponCode.toUpperCase() === 'WELCOME10' ? { discount: 10, discountType: 'percentage' } : null);

  if (activeCouponOffer && discount > 0) {
    let eligibleSubtotal = currentSubtotal;
    if (activeCouponOffer.applicableProducts?.length > 0 || activeCouponOffer.applicableCategories?.length > 0) {
      eligibleSubtotal = cartItems.reduce((total, item) => {
        let isE = false;
        if (activeCouponOffer.applicableProducts?.some(p => p._id === item.productId || p === item.productId)) isE = true;
        if (activeCouponOffer.applicableCategories?.some(cat => cat.toLowerCase() === item.category?.toLowerCase())) isE = true;

        if (isE) return total + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1));
        return total;
      }, 0);
    }

    if (discountType === 'percentage') {
      computedDiscount = eligibleSubtotal * (discount / 100);
    } else {
      // Fixed discount
      computedDiscount = Math.min(eligibleSubtotal, discount);
    }

    if (maxDiscount && computedDiscount > maxDiscount) {
      computedDiscount = maxDiscount;
    }
  }

  const currentTotal = currentSubtotal - computedDiscount;

  useEffect(() => {
    previousTotalRef.current = currentTotal;
  }, [currentTotal]);

  const handleSubmitOrder = async () => {
    try {
      setError('');
      if (!user?.id) return setError('Please login to place an order');
      if (!orderForm.deliveryDate || !orderForm.deliveryTime) return setError('Select delivery date and time');
      if (cartItems.length === 0) return setError('Your cart is empty.');

      const newOrder = {
        customerName: user.name || user.username || 'Customer',
        customerPhone: user.contactNumber || user.phone || 'N/A',
        deliveryAddress: `${user.addressLine1 || ''} ${user.city || ''}`.trim() || 'N/A',
        deliveryDate: orderForm.deliveryDate,
        deliveryTime: orderForm.deliveryTime,
        notes: orderForm.notes,
        total: currentTotal,
        userId: user.id,
        userEmail: user.email || '',
        userName: user.name || user.username || '',
        items: cartItems.map(item => ({
          productId: item.productId || item._id || item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity),
          unit: item.unit,
          subtotal: parseFloat(item.price * item.quantity)
        }))
      };

      setLoading(true);
      const res = await createOrder(newOrder);

      if (res.success || res.order) {
        await clearCart();
        setCartItems([]);
        setShowSuccessModal(true);
      } else {
        throw new Error(res.message);
      }
    } catch (err) {
      setError(err.message || 'Error occurred placing order');
    } finally {
      setLoading(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => navigate('/user-products'), 400); // Wait for reverse animation
  };

  return (
    <PageWrapper>
      <UserNavbar />
      <div className="cart-page-frame">
        {/* Background Page Content (blurred) */}
        <div className="cart-backdrop" onClick={closeDrawer} />

        {/* Slide-in Drawer Container */}
        <aside className={`desktop-cart-drawer ${isDrawerOpen ? 'open' : ''}`}>
          <div className="drawer-header">
            <div className="dh-left">
              <h2>Your Shopping Cart</h2>
              <span className="cart-count-badge">{cartItems.length} items</span>
            </div>
            <button className="drawer-close-btn" onClick={closeDrawer}>✕</button>
          </div>

          <div className="drawer-scroll-area">
            {error && <div className="cart-drawer-error">{error}</div>}

            {cartItems.length === 0 ? (
              <div className="drawer-empty-state">
                <div className="empty-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any wholesale products yet.</p>
                <button className="btn btn-primary" onClick={closeDrawer}>Browse Catalog</button>
              </div>
            ) : (
              <div className="drawer-items-list">
                {cartItems.map(item => (
                  <div key={item.productId} className="drawer-item-card">
                    <div className="di-image">
                      {item.image ? <img src={getImageUrl(item.image)} alt={item.name} /> : <div className="di-no-img">📦</div>}
                    </div>
                    <div className="di-meta">
                      <h4>{item.name}</h4>
                      <p className="di-price">₹{item.price} /{item.unit}</p>
                    </div>
                    <div className="di-stepper">
                      <button
                        id={`qty-btn-${item.productId}-minus`}
                        className="stepper-btn"
                        onClick={() => handleQuantityChange(item.productId, item.quantity, -1)}
                      >−</button>
                      <span className="stepper-val">{item.quantity}</span>
                      <button
                        id={`qty-btn-${item.productId}-plus`}
                        className="stepper-btn"
                        onClick={() => handleQuantityChange(item.productId, item.quantity, 1)}
                      >+</button>
                    </div>
                    <div className="di-total">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                    <button className="di-remove" onClick={() => handleRemoveItem(item.productId)}>✕</button>
                  </div>
                ))}
                <button className="drawer-clear-btn" onClick={handleClearCart}>Clear Cart</button>
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="drawer-summary-card">

                <div className="collapsible-coupon">
                  <div className="coupon-header" onClick={() => setShowCoupon(!showCoupon)}>
                    <span>🎟 Have a coupon code?</span>
                    <span>{showCoupon ? '−' : '+'}</span>
                  </div>
                  <div className={`coupon-body ${showCoupon ? 'expanded' : ''}`}>
                    <input
                      type="text"
                      placeholder="Enter code (Welcome10)"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                    />
                    <button onClick={applyCoupon}>Apply</button>
                  </div>
                </div>

                <div className="summary-math">
                  <div className="math-row">
                    <span>Subtotal</span>
                    <span>₹{currentSubtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && computedDiscount > 0 && (
                    <div className="math-row discount-row">
                      <span>Discount ({discountType === 'percentage' ? `${discount}%` : `₹${discount}`})</span>
                      <span>− ₹{computedDiscount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="math-row total-row">
                    <span>Grand Total</span>
                    <span className="animated-total">
                      ₹<CountUp
                        start={previousTotalRef.current}
                        end={currentTotal}
                        duration={1.5}
                        separator=","
                      />
                    </span>
                  </div>
                </div>

                <div className="drawer-checkout-form">
                  <h4>Logistics Settings</h4>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={orderForm.deliveryDate}
                    onChange={(e) => setOrderForm({ ...orderForm, deliveryDate: e.target.value })}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  />
                  <select
                    name="deliveryTime"
                    value={orderForm.deliveryTime}
                    onChange={(e) => setOrderForm({ ...orderForm, deliveryTime: e.target.value })}
                  >
                    <option value="">Select Time</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="18:00">06:00 PM</option>
                  </select>
                  <textarea
                    name="notes"
                    placeholder="Order notes..."
                    value={orderForm.notes}
                    onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                  />
                </div>

                <button className="drawer-checkout-btn" onClick={handleSubmitOrder} disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm Checkout'}
                </button>

              </div>
            )}

          </div>
        </aside>

        {/* Success Modal Overlay */}
        {showSuccessModal && (
          <div className="cart-success-modal">
            <div className="success-modal-content slide-top">
              <div className="success-icon">🎉</div>
              <h2>Order Placed Successfully!</h2>
              <p>Your wholesale order has been pushed to the logistics team.</p>
              <button onClick={() => navigate('/orders')}>View My Orders</button>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Cart;
