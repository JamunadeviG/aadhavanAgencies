import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { getProducts } from '../services/productService.js';
import { addToCart, getCart } from '../services/cartService.js';
import { PageWrapper, PageContent, Card, CardBody, Grid, LoadingState } from '../components/Layout.jsx';
import { ImageNavigation } from '../components/ImageNavigation.jsx';
import { CommonFooter } from '../components/CommonFooter.jsx';
import './UserHome.css'; // Reusing UserHome CSS for styling the product cards

const UserProducts = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Extract search query from URL if passed
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    
    // Load products
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        let productsData = response.products || [];
        
        // If there's a search term, filter immediately
        if (searchParam) {
           productsData = productsData.filter(p => p.name.toLowerCase().includes(searchParam.toLowerCase()));
        }

        setProducts(productsData);
        setFilteredProducts(productsData);
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
        setCartCount(0);
      }
    };
    
    updateCartCount();
    
    const handleCartChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('cartUpdated', handleCartChange);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartChange);
    };
  }, [location.search]);

  // Handle Category Filtering
  const categories = [...new Set(products.map(p => p.category))];

  const handleCategoryChange = (e) => {
    const cat = e.target.value;
    setSelectedCategory(cat);
    if (!cat) {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === cat));
    }
  };

  const handleAddToCart = async (product) => {
    try {
      if (!user?.id) {
        setNotificationMessage('Please login to add products to cart');
        setShowCartNotification(true);
        setTimeout(() => setShowCartNotification(false), 3000);
        return;
      }

      const productId = product._id || product.id || `product-${product.name}-${product.price}`;
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
          setNotificationMessage(`${product.name} added to cart! Total items: ${newCount}`);
        } catch (error) {
          setNotificationMessage(`${product.name} added to cart!`);
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

  return (
    <PageWrapper>
      <ImageNavigation user={user} />
      <PageContent>
        <div className="dashboard-row">
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="heading-2">All Products</h2>
            <div className="filter-group">
              <select 
                value={selectedCategory} 
                onChange={handleCategoryChange}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          
          {loading ? (
            <LoadingState message="Loading products..." />
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
               <p>No products found.</p>
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
                      className="product-image" 
                      style={{ height: '180px', flexShrink: 0, padding: '10px', backgroundColor: '#fff', borderBottom: '1px solid #f1f5f9' }}
                    >
                      {productWithId.image && productWithId.image.trim() !== '' ? (
                        <img 
                          src={productWithId.image}
                          alt={productWithId.name}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
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
                      <div className="product-stock" style={{ marginBottom: '8px', fontSize: '13px' }}>
                         {productWithId.category && (
                           <span style={{ color: '#666', marginRight: '8px' }}>{productWithId.category}</span>
                         )}
                      </div>
                      <div className="product-stock" style={{ marginBottom: '12px' }}>
                        {productWithId.stock > 0 ? (
                          <span className="in-stock">In Stock ({productWithId.stock} {productWithId.unit})</span>
                        ) : (
                          <span className="out-of-stock">Out of Stock</span>
                        )}
                      </div>
                      <div className="product-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          style={{ flex: 1 }}
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddToCart(productWithId)}
                          disabled={productWithId.stock <= 0}
                        >
                          Add to Cart
                        </button>
                        <button 
                          style={{ flex: 1 }}
                          className="btn btn-outline btn-sm"
                          onClick={() => navigate('/cart')}
                        >
                          🛒 Cart
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

export default UserProducts;
