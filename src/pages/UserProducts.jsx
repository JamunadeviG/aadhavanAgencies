import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { getProducts } from '../services/productService.js';
import { addToCart, getCart } from '../services/cartService.js';
import { PageWrapper, PageContent, Card, CardBody, Grid, LoadingState } from '../components/Layout.jsx';
import UserNavbar from '../components/UserNavbar.jsx';
import './UserProducts.css';

const UserProducts = () => {
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);

  // ✅ Proper useEffect with cleanup pattern like reference code
  useEffect(() => {
    let isMounted = true; // ✅ prevents double render issues

    const fetchProducts = async () => {
      try {
        console.log('🔄 Starting to load products...');
        
        const response = await getProducts();
        console.log('📥 API response received:', response);

        if (isMounted) {
          const productsData = response.products || response || [];
          console.log('📦 Products data extracted:', productsData);
          console.log('📊 Products count:', productsData.length);
          
          setProducts(productsData);
          console.log('✅ Products state updated successfully');
        }
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        if (isMounted) {
          setProducts([]); // ✅ only update if mounted
        }
      } finally {
        if (isMounted) {
          setIsLoading(false); // ✅ stops loader ONCE
          console.log('🏁 Loading finished');
        }
      }
    };

    // ✅ Check user authentication first
    if (!currentUser) {
      console.log('❌ No user found, redirecting to login');
      navigate('/login');
      setIsLoading(false); // ✅ stop loader if no user
      return;
    }

    console.log('✅ User found, starting data fetch...');
    fetchProducts();

    return () => {
      isMounted = false; // ✅ cleanup (important)
    };
  }, []); // ✅ VERY IMPORTANT: empty dependency array

  // ✅ Cart count update with proper cleanup pattern
  useEffect(() => {
    let isMounted = true; // ✅ prevents double render issues

    const updateCartCount = async () => {
      try {
        console.log('🛒 Updating cart count...');
        const cartItems = await getCart();
        console.log('🛒 Cart items received:', cartItems);
        const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        console.log('🛒 Cart count calculated:', count);
        
        if (isMounted) {
          setCartCount(count);
        }
      } catch (error) {
        console.error('❌ Error loading cart count:', error);
        if (isMounted) {
          setCartCount(0);
        }
      }
    };

    updateCartCount();

    const handleCartChange = () => {
      console.log('🛒 Cart updated event received');
      updateCartCount();
    };

    window.addEventListener('cartUpdated', handleCartChange);
    
    return () => {
      isMounted = false; // ✅ cleanup (important)
      window.removeEventListener('cartUpdated', handleCartChange);
    };
  }, []); // ✅ VERY IMPORTANT: empty dependency array

  const handleAddToCart = async (product) => {
    try {
      console.log('🛒 ADD TO CART START ===');
      console.log('Product object:', product);
      console.log('User object:', currentUser);
      
      if (!currentUser?.id) {
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

  // Create stable filter functions to prevent flickering
  const filterProducts = useCallback((productsToFilter, term, category) => {
    return productsToFilter.filter(product => {
      const productName = product.name || '';
      const matchesSearch = productName.toLowerCase().includes(term.toLowerCase());
      const matchesCategory = category === 'all' || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, []);

  // Create stable categories function to prevent flickering
  const getCategories = useCallback((productsToProcess) => {
    return ['all', ...new Set(productsToProcess.map(p => p.category || '').filter(Boolean))];
  }, []);

  // Filter products based on search and category - memoized to prevent flickering
  const filteredProducts = useMemo(() => {
    return filterProducts(products, searchTerm, selectedCategory);
  }, [products, searchTerm, selectedCategory, filterProducts]);

  // Get unique categories - memoized to prevent flickering
  const categories = useMemo(() => {
    return getCategories(products);
  }, [products, getCategories]);

  return (
    <PageWrapper>
      <UserNavbar />

      <PageContent>
        {/* Search and Filter Section */}
        <div className="search-filter-section">
          <div className="search-filter-row">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="filter-controls">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-section">
          {isLoading ? (
            <LoadingState message="Loading products..." />
          ) : filteredProducts.length === 0 ? (
            <div className="no-products">
              <div className="no-products-icon">📦</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <Grid cols={4} gap="6">
              {filteredProducts.map((product, index) => {
                const productWithId = {
                  ...product,
                  id: product.id || product._id || `product-${index}-${product.name}-${product.price}`
                };
                
                return (
                  <Card key={productWithId.id} hover className="product-card">
                    <div 
                      className="product-image clickable" 
                      onClick={() => handleProductImageClick(productWithId)}
                    >
                      {productWithId.image && productWithId.image.trim() !== '' ? (
                        <img 
                          src={productWithId.image}
                          alt={productWithId.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : (
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
                      )}
                    </div>
                    <CardBody>
                      <h3 className="product-name">{productWithId.name}</h3>
                      <div className="product-meta">
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
                        {productWithId.category && (
                          <div className="product-category">{productWithId.category}</div>
                        )}
                      </div>
                      <div className="product-actions">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddToCart(productWithId)}
                          disabled={productWithId.stock <= 0}
                        >
                          {productWithId.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
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
                      src={selectedProduct.image}
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
                    <div 
                      className="product-no-image" 
                      style={{
                        display: 'flex',
                        height: '100%',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
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
    </PageWrapper>
  );
};

export default React.memo(UserProducts);
