import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, logout } from '../services/authService.js';
import { getOffers } from '../utils/offerStorage.js';
import { getProducts } from '../services/productService.js';
import { addToCart, getCartCount } from '../services/cartService.js';
import './UserHome.css';
import './UserDashboard.css';

const UserHome = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  useEffect(() => {
    // Load offers for banner
    setOffers(getOffers());
    
    // Load products for quick order
    const loadProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(response.products || []);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Load cart count
    const updateCartCount = () => {
      try {
        const count = getCartCount();
        setCartCount(count);
      } catch (error) {
        console.error('Error updating cart count:', error);
        setCartCount(0);
      }
    };
    
    loadProducts();
    updateCartCount();
    
    // Listen for cart changes
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleCartChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartChange);
    };
  }, []);

  const handleCartChange = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartCount(count);
    } catch (error) {
      console.error('Error updating cart count:', error);
      setCartCount(0);
    }
  };

  const handleAddToCart = (product) => {
    try {
      // Use cartService to add product to cart
      const updatedCart = addToCart(product);
      
      // Update cart count
      const newCount = getCartCount();
      setCartCount(newCount);
      
      // Show notification
      setNotificationMessage(`${product.name} added to cart successfully! Cart now has ${newCount} items.`);
      setShowCartNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowCartNotification(false);
      }, 3000);
      
      // Trigger cart update events
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      console.log('Product added to cart successfully:', product);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotificationMessage('Failed to add product to cart. Please try again.');
      setShowCartNotification(true);
      setTimeout(() => {
        setShowCartNotification(false);
      }, 3000);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const confirmLogout = () => {
    // Use the authService logout function which handles everything
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <div className="user-home-page">
      {/* User Dashboard Style Navbar */}
      <header className="user-topbar">
        <div className="user-brand">
          <div className="user-logo">AA</div>
          <div>
            <p className="user-brand-name">Aadhavan Agencies</p>
            <span className="user-brand-sub">Retail Partner Center</span>
          </div>
        </div>
        
        <div className="user-topnav-wrapper">
          <nav className="user-quicknav" aria-label="Quick actions">
            <button className="btn" onClick={() => navigate('/user-dashboard')}>
              📊 Dashboard
            </button>
            <button className="btn" onClick={() => navigate('/products')}>
              🛍️ Products
            </button>
            <button className="btn" onClick={() => navigate('/track-orders')}>
              📦 Track Orders
            </button>
            <button className="btn" onClick={() => navigate('/cart')}>
              🛒 Cart {cartCount > 0 && `(${cartCount})`}
            </button>
          </nav>
        </div>
        
        <div className="user-top-actions">
          <button className="btn ghost" onClick={() => navigate('/')}>Storefront</button>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="user-dashboard">
        <div className="container">
          
          {/* Offers Banner */}
          {offers.length > 0 && (
            <div className="dashboard-row offers-banner-section">
              <div className="offers-banner">
                <div className="banner-content">
                  <div className="banner-text">
                    <h2>🎉 Special Offers Available!</h2>
                    <p>Get amazing discounts on selected products</p>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/products')}
                  >
                    View Offers
                  </button>
                </div>
                <div className="banner-images">
                  {offers.slice(0, 3).map((offer, index) => (
                    <div key={offer.id} className="banner-offer">
                      <span className="offer-discount">{offer.discount}% OFF</span>
                      <span className="offer-title">{offer.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          <div className="dashboard-row products-section">
            <div className="section-header">
              <h2>Featured Products</h2>
              <button className="btn btn-outline" onClick={() => navigate('/products')}>
                View All Products
              </button>
            </div>
            
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : (
              <div className="products-grid">
                {products.slice(0, 8).map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <img 
                        src={`https://images.unsplash.com/photo-${1504674900247 + Math.floor(Math.random() * 100)}-0877df9cc836?auto=format&fit=crop&w=300&q=60`}
                        alt={product.name}
                      />
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <div className="product-price">
                        <span className="price">₹{product.price}</span>
                        <span className="unit">/{product.unit}</span>
                      </div>
                      <div className="product-stock">
                        {product.stock > 0 ? (
                          <span className="in-stock">In Stock ({product.stock} {product.unit})</span>
                        ) : (
                          <span className="out-of-stock">Out of Stock</span>
                        )}
                      </div>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Cart Notification Popup */}
      {showCartNotification && (
        <div className="cart-notification">
          <div className="notification-content">
            <div className="notification-icon">✅</div>
            <p>{notificationMessage}</p>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to logout?</p>
              <p>You will be redirected to the home page.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmLogout}>
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserHome;
