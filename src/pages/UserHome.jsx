import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { getProducts } from '../services/productService.js';
import { addToCart, getCart } from '../services/cartService.js';
import { PageWrapper, PageContent, Card, CardBody, Grid, Flex, LoadingState } from '../components/Layout.jsx';
import { ImageNavigation } from '../components/ImageNavigation.jsx';
import { CommonFooter } from '../components/CommonFooter.jsx';
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Sample offers data for banner
  const getOffers = () => {
    return [
      {
        id: 1,
        title: "Fresh Vegetables Sale",
        description: "Get 20% off on all fresh vegetables",
        image: "/api/placeholder/800/400",
        discount: "20% OFF"
      },
      {
        id: 2,
        title: "Organic Fruits Special",
        description: "Buy 1 Get 1 Free on selected organic fruits",
        image: "/api/placeholder/800/400",
        discount: "BOGO"
      },
      {
        id: 3,
        title: "Dairy Products Deal",
        description: "15% off on all dairy products",
        image: "/api/placeholder/800/400",
        discount: "15% OFF"
      }
    ];
  };

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
        
        // Optional: Ask user if they want to go to cart
        setTimeout(() => {
          if (window.confirm(`${product.name} added to cart! Go to cart page?`)) {
            navigate('/cart');
          }
        }, 1000);
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
      <ImageNavigation user={user} />

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
                            <img 
                              src={`https://images.unsplash.com/photo-${1504674900247 + index}-0877df9cc836?auto=format&fit=crop&w=400&q=60`}
                              alt={offer.title}
                            />
                          </div>
                          <CardBody>
                            <span className="offer-badge">{offer.discount}% OFF</span>
                            <h3 className="heading-4">{offer.title}</h3>
                            <p className="text-small">{offer.description}</p>
                            <button 
                              className="btn btn-primary"
                              onClick={() => navigate('/products')}
                            >
                              Shop Now
                            </button>
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
            <button className="btn btn-outline" onClick={() => navigate('/products')}>
              View All Products
            </button>
          </div>
          
          {loading ? (
            <LoadingState message="Loading products..." />
          ) : (
            <Grid cols={4} gap="6">
              {products.slice(0, 8).map((product, index) => {
                // Ensure each product has a unique ID
                const productWithId = {
                  ...product,
                  id: product.id || product._id || `product-${index}-${product.name}-${product.price}`
                };
                
                return (
                  <Card key={productWithId.id} hover className="product-card">
                    <div className="product-image">
                      <img 
                        src={`https://images.unsplash.com/photo-${1504674900247 + Math.floor(Math.random() * 100)}-0877df9cc836?auto=format&fit=crop&w=300&q=60`}
                        alt={productWithId.name}
                      />
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

      <CommonFooter />
    </PageWrapper>
  );
};

export default UserHome;
