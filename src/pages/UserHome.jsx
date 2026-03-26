import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { getActiveOffers } from '../services/offerService.js';
import { addToCart, getCart } from '../services/cartService.js';
import { getProducts } from '../services/productService.js';
import { PageWrapper, PageContent, Card, CardBody, Grid, Flex, LoadingState } from '../components/Layout.jsx';
import UserNavbar from '../components/UserNavbar.jsx';
import { CommonFooter } from '../components/CommonFooter.jsx';
import { getImageUrl } from '../utils/imageUtils.js';
import './UserHome.css';

// LocalStorage Cart Functions
const getCartFromStorage = () => {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error getting cart from localStorage:', error);
    return [];
  }
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const addToCartLocal = (product) => {
  console.log('🛒 ADD TO CART LOCAL START');
  console.log('🛒 Product being added:', product);

  const cart = getCartFromStorage();
  console.log('🛒 Current cart before adding:', cart);

  // Create a unique identifier for the product
  const productId = product._id || product.id || product.name + '-' + product.price;
  console.log('🛒 Product ID for cart:', productId);

  const existingItem = cart.find(item => {
    const itemId = item._id || item.id || item.name + '-' + item.price;
    return itemId === productId;
  });

  console.log('🛒 Existing item found:', existingItem);

  if (existingItem) {
    existingItem.quantity += 1;
    console.log('🛒 Updated existing item quantity to:', existingItem.quantity);
  } else {
    const newItem = {
      productId: productId,
      _id: productId,
      id: productId,
      name: product.name,
      price: product.price,
      unit: product.unit,
      stock: product.stock,
      quantity: 1,
      addedAt: new Date().toISOString()
    };
    cart.push(newItem);
    console.log('🛒 Added new item to cart:', newItem);
  }

  console.log('🛒 Cart after adding:', cart);
  console.log('🛒 Total items in cart:', cart.length);

  saveCartToStorage(cart);
  console.log('🛒 Cart saved to localStorage');

  return { success: true, cart: { itemCount: cart.length, items: cart } };
};

const getCartCountFromStorage = () => {
  const cart = getCartFromStorage();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

const UserHome = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [showCartNotification, setShowCartNotification] = useState(false);

  useEffect(() => {
    // Load active offers for banner
    const loadOffers = async () => {
      try {
        const response = await getActiveOffers();
        setOffers(response.offers || []);
      } catch (error) {
        console.error('Failed to load offers:', error);
      }
    };

    // Load products for quick order
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        console.log('📦 UserHome Products received:', response.products);
        const productsData = response.products || [];
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
    loadProducts();

    // Load cart count from database
    const updateCartCount = async () => {
      try {
        const cartItems = await getCart();
        const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        setCartCount(count);
      } catch (error) {
        console.error('Error loading cart count:', error);
        setCartCount(0);
      }
    };

    updateCartCount();

    // Listen for cart changes
    const handleCartChange = () => {
      updateCartCount();
    };

    window.addEventListener('cartUpdated', handleCartChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartChange);
    };
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
    // Use the authService logout function which handles everything
    logout();
    setShowLogoutConfirm(false);
  };

  const handleProductImageClick = (product) => {
    setSelectedProduct(product);
    setImageZoom(1);
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setImageZoom(1);
  };

  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleZoomReset = () => {
    setImageZoom(1);
  };

  const handleAddToCart = async (product) => {
    try {
      console.log('🛒 ADD TO CART START ===');
      console.log('Product object:', product);
      console.log('Product _id:', product._id);
      console.log('Product id:', product.id);
      console.log('User object:', user);
      console.log('User ID:', user?.id);

      if (!user?.id) {
        console.log('❌ User not logged in');
        setNotificationMessage('Please login to add products to cart');
        setShowCartNotification(true);
        setTimeout(() => setShowCartNotification(false), 3000);
        return;
      }

      console.log('📤 Adding to database cart...');

      // Prepare product data for database
      const productId = product._id || product.id || `product-${product.name}-${product.price}`;
      const productData = {
        productId: productId,
        name: product.name || 'Unknown Product',
        price: parseFloat(product.price) || 0,
        unit: product.unit || 'unit',
        stock: parseInt(product.stock) || 0,
        quantity: 1
      };

      console.log('📤 Prepared product data:', productData);

      const response = await addToCart(productData);

      console.log('📥 Cart add response:', response);

      if (response.success) {
        console.log('✅ Cart add successful');

        // Update cart count from database
        try {
          const cartItems = await getCart();
          const newCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
          setCartCount(newCount);
          setNotificationMessage(`${product.name} added to cart! Total items: ${newCount}`);
        } catch (countError) {
          console.error('Error updating cart count:', countError);
          setNotificationMessage(`${product.name} added to cart!`);
        }

        setShowCartNotification(true);
        setTimeout(() => setShowCartNotification(false), 3000);
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        console.log('❌ Cart add failed');
        console.log('Error message:', response.message);
        setNotificationMessage(response.message || 'Failed to add to cart');
        setShowCartNotification(true);
        setTimeout(() => setShowCartNotification(false), 3000);
      }
    } catch (error) {
      console.error('=== ADD TO CART ERROR ===');
      console.error('Error object:', error);
      console.error('Error message:', error.message);
      setNotificationMessage('Failed to add to cart. Please try again.');
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 3000);
    }
  };

  // Test function to add multiple products
  const testMultipleProducts = () => {
    console.log('🧪 TESTING MULTIPLE PRODUCTS');

    const testProducts = [
      {
        _id: 'test1',
        name: 'Test Product 1',
        price: 10,
        unit: 'kg',
        stock: 50
      },
      {
        _id: 'test2',
        name: 'Test Product 2',
        price: 20,
        unit: 'L',
        stock: 30
      },
      {
        _id: 'test3',
        name: 'Test Product 3',
        price: 15,
        unit: 'pcs',
        stock: 100
      }
    ];

    testProducts.forEach((product, index) => {
      setTimeout(() => {
        console.log(`🧪 Adding test product ${index + 1}:`, product);
        addToCartLocal(product);
      }, index * 500);
    });

    setTimeout(() => {
      const cart = getCartFromStorage();
      console.log('🧪 Final cart after adding test products:', cart);
      setNotificationMessage(`Added ${testProducts.length} test products to cart!`);
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 3000);
    }, 2000);
  };

  return (
    <PageWrapper>
      <UserNavbar />

      <PageContent>
        {/* Offers Banner */}
        {offers.length > 0 && (
          <div className="dashboard-row">
            <Card className="offers-carousel">
              <CardBody>
                <div className="carousel-container">
                  <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {offers.map((offer, index) => (
                      <div key={offer.id} className="carousel-slide">
                        <Card hover className="offer-card">
                          <div className="offer-image">
                            {offer.image ? (
                              <img
                                src={getImageUrl(offer.image)}
                                alt={offer.title}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className="product-no-image"
                              style={{
                                display: offer.image ? 'none' : 'flex',
                                height: '100%',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f3f4f6',
                                color: '#6b7280',
                                fontSize: '14px',
                                fontWeight: '500'
                              }}
                            >
                              No Image
                            </div>
                          </div>
                          <CardBody className="offer-details-body">
                            <div className="offer-content-wrapper">
                              <div className="offer-info-main">
                                <span className="offer-badge pulse">
                                  {offer.discountType === 'percentage' ? `${offer.discount}% OFF` : `₹${offer.discount} OFF`}
                                </span>
                                <h3 className="offer-title">{offer.title}</h3>
                                <p className="offer-desc">{offer.description}</p>

                                <div className="offer-features">
                                  <div className="feature-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    <span>Instant Discount at Checkout</span>
                                  </div>
                                  <div className="feature-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    <span>Valid for Verified Wholesale Partners</span>
                                  </div>
                                  <div className="feature-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    <span>Bulk Discount automatically applied to items</span>
                                  </div>
                                  <div className="feature-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    <span>Priority Shipping & Logistics Handling</span>
                                  </div>
                                  {offer.applicableCategories && offer.applicableCategories.length > 0 && (
                                    <div className="feature-item">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                      <span>Applicable on: {offer.applicableCategories.join(', ')}</span>
                                    </div>
                                  )}
                                  {offer.maxDiscount && offer.maxDiscount > 0 && (
                                    <div className="feature-item">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                      <span>Save up to ₹{offer.maxDiscount}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="offer-highlights-mid">
                                <div className="highlight-item">
                                  <div className="hi-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                  </div>
                                  <div className="hi-text">
                                    <strong>Quality Assured</strong>
                                    <span>Premium Wholesale Grade</span>
                                  </div>
                                </div>
                                <div className="highlight-item">
                                  <div className="hi-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                                  </div>
                                  <div className="hi-text">
                                    <strong>Priority Logistics</strong>
                                    <span>Faster B2B Fulfillment</span>
                                  </div>
                                </div>
                              </div>

                              <div className="offer-info-meta">
                                <div className="meta-grid">
                                  <div className="meta-item">
                                    <i className="meta-icon">
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                    </i>
                                    <div className="meta-text">
                                      <span className="meta-label">Valid Until</span>
                                      <span className="meta-value">{new Date(offer.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                  </div>

                                  {offer.minOrderAmount > 0 && (
                                    <div className="meta-item">
                                      <i className="meta-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                      </i>
                                      <div className="meta-text">
                                        <span className="meta-label">Min. Order</span>
                                        <span className="meta-value">₹{offer.minOrderAmount}</span>
                                      </div>
                                    </div>
                                  )}

                                  {offer.couponCode && (
                                    <div className="meta-item coupon-item">
                                      <i className="meta-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="10" width="18" height="12" rx="2" ry="2"></rect><path d="M7 10V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4"></path></svg>
                                      </i>
                                      <div className="meta-text">
                                        <span className="meta-label">Use Code</span>
                                        <span className="meta-value coupon-highlight">{offer.couponCode}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <button
                                  className="btn btn-primary offer-shop-btn"
                                  onClick={() => navigate('/user-products')}
                                >
                                  Claim Offer & Shop Now
                                </button>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
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
              </CardBody>
            </Card>
          </div>
        )}

        {/* Products Section */}
        <div className="dashboard-row">
          <div className="section-header">
            <h2 className="heading-2">Featured Products</h2>
            <button className="btn btn-outline" onClick={() => navigate('/user-products')}>
              View All Products
            </button>
          </div>

          {loading ? (
            <LoadingState message="Loading products..." />
          ) : (
            <Grid cols={4} gap="6">
              {products.slice(0, 4).map((product, index) => {
                // Ensure each product has a unique ID
                const productWithId = {
                  ...product,
                  id: product.id || product._id || `product-${index}-${product.name}-${product.price}`
                };

                return (
                  <Card key={productWithId.id} hover className="product-card">
                    <div
                      className="product-image clickable"
                      style={{ height: '180px', flexShrink: 0, padding: '10px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                      onClick={() => handleProductImageClick(productWithId)}
                    >
                      {productWithId.image && productWithId.image.trim() !== '' ? (
                        <img
                          src={getImageUrl(productWithId.image)}
                          alt={productWithId.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                          onError={(e) => {
                            console.log('Image failed to load:', productWithId.image);
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="product-no-image"
                        style={{
                          display: productWithId.image && productWithId.image.trim() !== '' ? 'none' : 'flex',
                          height: '100%',
                          width: '100%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        No Image
                      </div>
                    </div>
                    <CardBody>
                      <h3 className="heading-5">{productWithId.name}</h3>
                      <div className="product-price">
                        <span className="price">₹{productWithId.price}</span>
                        <span className="unit">/{productWithId.unit}</span>
                      </div>
                      <div className="product-stock">
                        {productWithId.stock > 0 ? (
                          <span className="in-stock">In Stock ({productWithId.stock} {productWithId.unit})</span>
                        ) : (
                          <span className="out-of-stock">Out of Stock</span>
                        )}
                      </div>
                      <div className="product-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddToCart(productWithId)}
                        >
                          Add to Cart
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => navigate('/cart')}
                        >
                          🛒 View Cart
                        </button>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </Grid>
          )}
        </div>
      </PageContent>

      {/* Cart Notification */}
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
        <div className="modal-overlay" onClick={cancelLogout}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Logout</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to logout from your account?</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={cancelLogout}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={confirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Image Modal */}
      {showProductModal && selectedProduct && (
        <div className="product-modal-overlay" onClick={closeProductModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedProduct.name}</h3>
              <button className="modal-close" onClick={closeProductModal}>×</button>
            </div>

            <div className="modal-content">
              <div className="modal-image-section">
                <div className="zoom-controls">
                  <button onClick={handleZoomOut} className="zoom-btn">−</button>
                  <span className="zoom-level">{Math.round(imageZoom * 100)}%</span>
                  <button onClick={handleZoomIn} className="zoom-btn">+</button>
                  <button onClick={handleZoomReset} className="zoom-reset">Reset</button>
                </div>

                <div className="image-container">
                  {selectedProduct.image && selectedProduct.image.trim() !== '' ? (
                    <img
                      src={getImageUrl(selectedProduct.image)}
                      alt={selectedProduct.name}
                      style={{
                        transform: `scale(${imageZoom})`,
                        maxWidth: '100%',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        transition: 'transform 0.3s ease'
                      }}
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      No Image Available
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-details">
                <div className="product-info">
                  <h4>Product Details</h4>
                  <div className="detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">₹{selectedProduct.price} / {selectedProduct.unit}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Stock:</span>
                    <span className={`detail-value ${selectedProduct.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {selectedProduct.stock > 0 ? `${selectedProduct.stock} ${selectedProduct.unit} available` : 'Out of Stock'}
                    </span>
                  </div>
                  {selectedProduct.category && (
                    <div className="detail-row">
                      <span className="detail-label">Category:</span>
                      <span className="detail-value">{selectedProduct.category}</span>
                    </div>
                  )}
                  {selectedProduct.description && (
                    <div className="detail-row">
                      <span className="detail-label">Description:</span>
                      <span className="detail-value">{selectedProduct.description}</span>
                    </div>
                  )}
                </div>

                <div className="modal-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      closeProductModal();
                    }}
                    disabled={selectedProduct.stock <= 0}
                  >
                    {selectedProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <CommonFooter />
    </PageWrapper>
  );
};

export default UserHome;
