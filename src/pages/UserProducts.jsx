import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { getProducts } from '../services/productService.js';
import { addToCart, getCart } from '../services/cartService.js';
import { PageWrapper, PageContent, LoadingState } from '../components/Layout.jsx';
import UserNavbar from '../components/UserNavbar.jsx';
import { getImageUrl } from '../utils/imageUtils.js';
import './UserProducts.css';

const UserProducts = () => {
  const navigate = useNavigate();
  const currentUser = getStoredUser();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]); // Max price 10k initially
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Custom states array
  const [wishlist, setWishlist] = useState(() => {
    const userId = currentUser?._id || currentUser?.id || 'guest';
    const saved = localStorage.getItem(`wishlist_${userId}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const userId = currentUser?._id || currentUser?.id || 'guest';
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(wishlist));
  }, [wishlist, currentUser]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageZoom, setImageZoom] = useState(1);

  // Useeffect for fetching products exactly as it was safely mapped
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        if (isMounted) {
          const productsData = response.products || response || [];
          setProducts(productsData);
          if (productsData.length > 0) {
            // Recalculate max price organically based on product pool
            const maxP = Math.max(...productsData.map(p => parseFloat(p.price) || 0));
            setPriceRange([0, isFinite(maxP) ? maxP : 10000]);
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (!currentUser) {
      navigate('/login');
      setIsLoading(false);
      return;
    }
    fetchProducts();
    return () => { isMounted = false; };
  }, [navigate, currentUser]);

  useEffect(() => {
    let isMounted = true;
    const updateCartCount = async () => {
      try {
        const cartItems = await getCart();
        const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
        if (isMounted) setCartCount(count);
      } catch (error) {
        if (isMounted) setCartCount(0);
      }
    };
    updateCartCount();
    const handleCartChange = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartChange);
    return () => {
      isMounted = false;
      window.removeEventListener('cartUpdated', handleCartChange);
    };
  }, []);

  const handleAddToCart = async (product) => {
    try {
      if (!currentUser?.id) {
        setNotificationMessage('Please login to add products to cart');
        setShowCartNotification(true);
        setTimeout(() => setShowCartNotification(false), 3000);
        return;
      }

      const productId = product._id || product.id || ('product-' + product.name + '-' + product.price);
      const productData = {
        productId: productId,
        name: product.name || 'Unknown Product',
        price: parseFloat(product.price) || 0,
        unit: product.unit || 'unit',
        stock: parseInt(product.stock) || 0,
        quantity: 1
      };

      const response = await addToCart(productData);

      if (response.success) {
        try {
          const cartItems = await getCart();
          const newCount = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
          setCartCount(newCount);
          setNotificationMessage(product.name + " added to cart!");
        } catch (countError) {
          setNotificationMessage(product.name + " added to cart!");
        }
        setShowCartNotification(true);
        setTimeout(() => setShowCartNotification(false), 3000);
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        setNotificationMessage(response.message || 'Failed to add to cart');
        setShowCartNotification(true);
        setTimeout(() => setShowCartNotification(false), 3000);
      }
    } catch (error) {
      setNotificationMessage('Failed to add to cart. Please try again.');
      setShowCartNotification(true);
      setTimeout(() => setShowCartNotification(false), 3000);
    }
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getCategories = useCallback((productsToProcess) => {
    return ['all', ...new Set(productsToProcess.map(p => p.category || '').filter(Boolean))];
  }, []);

  const categories = useMemo(() => getCategories(products), [products, getCategories]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const productName = product.name || '';
      const productPrice = parseFloat(product.price) || 0;

      const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      // Robust Price Filter: Treat empty/invalid as "infinite" bounds
      const min = (priceRange[0] === '' || isNaN(priceRange[0])) ? 0 : priceRange[0];
      const max = (priceRange[1] === '' || isNaN(priceRange[1])) ? 1000000 : priceRange[1];
      const matchesPrice = productPrice >= min && productPrice <= max;

      const productId = product._id || product.id || '';
      const matchesWishlist = !showFavoritesOnly || wishlist.includes(productId);

      return matchesSearch && matchesCategory && matchesPrice && matchesWishlist;
    });
  }, [products, searchTerm, selectedCategory, priceRange, showFavoritesOnly, wishlist]);

  const maxAvailablePrice = useMemo(() => {
    if (products.length === 0) return 10000;
    const prices = products.map(p => parseFloat(p.price)).filter(p => !isNaN(p));
    if (prices.length === 0) return 10000;
    return Math.max(...prices);
  }, [products]);

  return (
    <PageWrapper>
      <UserNavbar />

      <PageContent>
        <div className="catalog-layout">
          {/* Sticky Sidebar Filter */}
          <aside className="sticky-sidebar">
            <div className="filter-wrapper">
              <h3 className="filter-title">Filters</h3>

              <div className="filter-group">
                <div
                  className={"favorites-toggle " + (showFavoritesOnly ? 'active' : '')}
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                >
                  <span className="heart-icon">{showFavoritesOnly ? '❤️' : '🤍'}</span>
                  <span className="toggle-text">My Favorites</span>
                  <span className="fav-count">({wishlist.length})</span>
                </div>
              </div>

              <div className="filter-group focus-animation">
                <h4>Search</h4>
                <div className="search-box">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Find products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <h4>Categories</h4>
                <div className="category-pills">
                  {categories.map(category => (
                    <button
                      key={category}
                      className={'cat-pill ' + (selectedCategory === category ? 'active' : '')}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category === 'all' ? 'All Items' : category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h4>Price Range</h4>
                <div className="price-input-row">
                  <div className="price-field">
                    <span>Min</span>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([e.target.value === '' ? '' : parseInt(e.target.value), priceRange[1]])}
                      placeholder="0"
                    />
                  </div>
                  <div className="price-field">
                    <span>Max</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], e.target.value === '' ? '' : parseInt(e.target.value)])}
                      placeholder="Any"
                    />
                  </div>
                </div>
                <div className="price-slider-box">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(maxAvailablePrice, 500)}
                    value={Math.min(priceRange[1] === '' ? 1000000 : priceRange[1], Math.max(maxAvailablePrice, 500))}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    style={{ cursor: 'pointer', position: 'relative', zIndex: 10 }}
                    className="price-slider"
                  />
                  <div className="price-range-labels">
                    <span>Low</span>
                    <span className="current-range-val">₹{priceRange[0] || 0} - ₹{priceRange[1] || '∞'}</span>
                    <span>High</span>
                  </div>
                </div>
                <button className="reset-filter-btn" onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setShowFavoritesOnly(false);
                  setPriceRange([0, Math.max(maxAvailablePrice, 500)]);
                }}>Reset All Filters</button>
              </div>
            </div>
          </aside>

          {/* Masonry Product Grid Section */}
          <main className="masonry-catalog">
            {isLoading ? (
              <LoadingState message="Curating premium wholesale products..." />
            ) : filteredProducts.length === 0 ? (
              <div className="no-products glassmorphism-card">
                <h3>No products found</h3>
                <p>Try adjusting your filters or price slider to see more items.</p>
              </div>
            ) : (
              <div className="masonry-grid">
                {filteredProducts.map((product, index) => {
                  const productWithId = { ...product, id: product.id || product._id || ('product-' + index) };
                  const isWishlisted = wishlist.includes(productWithId.id);
                  const isLowStock = productWithId.stock > 0 && productWithId.stock <= 50;

                  return (
                    <div className="masonry-brick" key={productWithId.id}>
                      <div className="product-glass-card">

                        {/* Wishlist Heart with Pop Animation */}
                        <div className={'wishlist-heart ' + (isWishlisted ? 'active-pop' : '')} onClick={() => toggleWishlist(productWithId.id)}>
                          {isWishlisted ? '❤️' : '🤍'}
                        </div>

                        {/* Image Logic with Smooth Scale Hover */}
                        <div
                          className="img-wrapper"
                          onClick={() => { setSelectedProduct(productWithId); setShowProductModal(true); setImageZoom(1); }}
                        >
                          {productWithId.image && productWithId.image.trim() !== '' ? (
                            <img src={getImageUrl(productWithId.image)} alt={productWithId.name} />
                          ) : (
                            <div className="no-img">No Image Setup</div>
                          )}
                        </div>

                        {/* Slide-Up Content container natively wraps elements */}
                        <div className="card-slideup-content">
                          <h3 className="masonry-title">{productWithId.name}</h3>

                          <div className="masonry-meta">
                            <span className="price">₹{productWithId.price}<span>/{productWithId.unit}</span></span>
                          </div>

                          {/* Pulsing Green Dot logic */}
                          <div className="pulse-stock-badge">
                            {productWithId.stock > 0 ? (
                              <>
                                <span className={'pulse-dot ' + (isLowStock ? 'orange' : 'green')}></span>
                                <span className="stock-text">{productWithId.stock} {productWithId.unit} available</span>
                              </>
                            ) : (
                              <>
                                <span className="pulse-dot red"></span>
                                <span className="stock-text">Out of Stock</span>
                              </>
                            )}
                          </div>

                          {/* Slide Up Add To Cart Button */}
                          <div className="slide-up-action">
                            <button
                              className="add-to-cart-slider-btn"
                              onClick={() => handleAddToCart(productWithId)}
                              disabled={productWithId.stock <= 0}
                            >
                              {productWithId.stock > 0 ? 'Add to Cart 🛒' : 'Out of Stock 🚫'}
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </PageContent>

      {/* Slide in Cart Notification */}
      {showCartNotification && (
        <div className="slide-in-toast">
          <div className="toast-content">
            <span className="toast-icon">✨</span>
            <p>{notificationMessage}</p>
          </div>
        </div>
      )}

      {/* Product Zoom Modal mapping */}
      {showProductModal && selectedProduct && (
        <div className="product-modal-glass-overlay" onClick={() => setShowProductModal(false)}>
          <div className="glass-modal-body" onClick={(e) => e.stopPropagation()}>
            <button className="glass-close" onClick={() => setShowProductModal(false)}>✕</button>
            <div className="glass-modal-layout">
              <div className="modal-img-zone">
                {selectedProduct.image ? (
                  <img src={getImageUrl(selectedProduct.image)} alt={selectedProduct.name} style={{ transform: "scale(" + imageZoom + ")" }} />
                ) : (
                  <div className="no-img">No Image Available</div>
                )}
                <div className="img-controls">
                  <button onClick={() => setImageZoom(z => Math.max(0.5, z - 0.2))}>-</button>
                  <button onClick={() => setImageZoom(1)}>Reset</button>
                  <button onClick={() => setImageZoom(z => Math.min(3, z + 0.2))}>+</button>
                </div>
              </div>
              <div className="modal-data-zone">
                <h2>{selectedProduct.name}</h2>
                <span className="modal-price">₹{selectedProduct.price} /{selectedProduct.unit}</span>
                <p className="modal-desc">{selectedProduct.description || "Premium wholesale item directly supplied to your retail business seamlessly."}</p>

                <div className="pulse-stock-badge lg-margin">
                  {selectedProduct.stock > 0 ? (
                    <><span className="pulse-dot green"></span> <span className="stock-text">{selectedProduct.stock} bulk units ready for dispatch</span></>
                  ) : (
                    <><span className="pulse-dot red"></span> <span className="stock-text">Currently awaiting resupply</span></>
                  )}
                </div>

                <button
                  className="glass-modal-add-btn"
                  onClick={() => { handleAddToCart(selectedProduct); setShowProductModal(false); }}
                  disabled={selectedProduct.stock <= 0}
                >
                  {selectedProduct.stock > 0 ? 'Reserve in Cart' : 'Unavailable'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default React.memo(UserProducts);
