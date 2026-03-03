import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, logout } from '../services/authService.js';
import { getOffers } from '../utils/offerStorage.js';
import { getProducts } from '../services/productService.js';
import './UserHome.css';

const UserHome = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // Load offers for banner
    setOffers(getOffers());
    
    // Load products for display
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
    
    loadProducts();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % offers.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + offers.length) % offers.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const confirmLogout = () => {
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
            <button className="btn" onClick={() => navigate('/track-orders')}>
              📦 Track Orders
            </button>
            <button className="btn" onClick={() => navigate('/products')}>
              🛍️ Products
            </button>
          </nav>
        </div>
        
        <div className="user-top-actions">
          <div className="user-profile-card">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <div className="user-welcome-text">Welcome back,</div>
              <div className="user-display-name">{user?.name || user?.email || 'User'}</div>
            </div>
            <button className="btn btn-outline edit-profile-btn" onClick={() => navigate('/edit-profile')}>
              ✏️ Edit
            </button>
          </div>
          <button className="btn btn-danger logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="user-dashboard">
        <div className="container">
          
          {/* Offers Banner */}
          {offers.length > 0 && (
            <div className="dashboard-row offers-banner-section">
              <div className="offers-carousel">
                <div className="carousel-container">
                  <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {offers.map((offer, index) => (
                      <div key={offer.id} className="carousel-slide">
                        <div className="offer-card">
                          <div className="offer-image">
                            <img 
                              src={`https://images.unsplash.com/photo-${1504674900247 + index}-0877df9cc836?auto=format&fit=crop&w=400&q=60`}
                              alt={offer.title}
                            />
                          </div>
                          <div className="offer-content">
                            <span className="offer-badge">{offer.discount}% OFF</span>
                            <h3>{offer.title}</h3>
                            <p>{offer.description}</p>
                            <button 
                              className="btn btn-primary"
                              onClick={() => navigate('/products')}
                            >
                              Shop Now
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Carousel Navigation */}
                  <button className="carousel-btn carousel-btn-prev" onClick={prevSlide}>
                    ‹
                  </button>
                  <button className="carousel-btn carousel-btn-next" onClick={nextSlide}>
                    ›
                  </button>
                  
                  {/* Carousel Indicators */}
                  <div className="carousel-indicators">
                    {offers.map((_, index) => (
                      <button
                        key={index}
                        className={`carousel-indicator ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                      />
                    ))}
                  </div>
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
                      <div className="product-actions">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate('/products')}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

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
