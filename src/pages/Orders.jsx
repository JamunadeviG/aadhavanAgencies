import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import { getProducts } from '../services/productService.js';
import './Orders.css';

const Orders = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('new');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderItems, setOrderItems] = useState([]);
  const [orderForm, setOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    notes: ''
  });

  // Sample existing orders
  const [existingOrders] = useState([
    {
      id: 'ORD-001',
      date: '2024-02-15',
      status: 'Delivered',
      items: [
        { name: 'Rice 5kg', quantity: 2, price: 250 },
        { name: 'Sugar 1kg', quantity: 5, price: 45 }
      ],
      total: 740,
      customerName: 'John Doe',
      deliveryAddress: '123 Main St, Chennai'
    },
    {
      id: 'ORD-002',
      date: '2024-02-14',
      status: 'Processing',
      items: [
        { name: 'Oil 1L', quantity: 3, price: 120 },
        { name: 'Dal 1kg', quantity: 2, price: 80 }
      ],
      total: 520,
      customerName: 'Jane Smith',
      deliveryAddress: '456 Oak Ave, Bangalore'
    },
    {
      id: 'ORD-003',
      date: '2024-02-13',
      status: 'Shipped',
      items: [
        { name: 'Flour 2kg', quantity: 1, price: 60 },
        { name: 'Tea Powder 250g', quantity: 4, price: 95 }
      ],
      total: 440,
      customerName: 'Bob Johnson',
      deliveryAddress: '789 Pine Rd, Mumbai'
    }
  ]);

  useEffect(() => {
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

  const handleAddToOrder = (product) => {
    const existingItem = orderItems.find(item => item.id === product.id);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        unit: product.unit,
        quantity: 1
      }]);
    }
  };

  const handleRemoveFromOrder = (productId) => {
    setOrderItems(orderItems.filter(item => item.id !== productId));
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromOrder(productId);
    } else {
      setOrderItems(orderItems.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = () => {
    if (orderItems.length === 0) {
      alert('Please add items to your order');
      return;
    }

    if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.deliveryAddress) {
      alert('Please fill in all required fields');
      return;
    }

    // Here you would typically send the order to the backend
    alert('Order placed successfully!');
    
    // Reset form
    setOrderItems([]);
    setOrderForm({
      customerName: '',
      customerPhone: '',
      deliveryAddress: '',
      notes: ''
    });
    
    // Switch to existing orders tab
    setActiveTab('existing');
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'delivered': return '#28a745';
      case 'processing': return '#ffc107';
      case 'shipped': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  return (
    <div className="orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>Orders Management</h1>
          <p>Manage your orders and track deliveries</p>
        </div>

        <div className="orders-tabs">
          <button 
            className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            📝 New Order
          </button>
          <button 
            className={`tab-btn ${activeTab === 'existing' ? 'active' : ''}`}
            onClick={() => setActiveTab('existing')}
          >
            📋 Existing Orders
          </button>
        </div>

        {activeTab === 'new' && (
          <div className="new-order-section">
            <div className="order-form-container">
              <div className="customer-details">
                <h3>Customer Details</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Customer Name *</label>
                    <input
                      type="text"
                      value={orderForm.customerName}
                      onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      value={orderForm.customerPhone}
                      onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Delivery Address *</label>
                    <textarea
                      value={orderForm.deliveryAddress}
                      onChange={(e) => setOrderForm({...orderForm, deliveryAddress: e.target.value})}
                      placeholder="Enter delivery address"
                      rows={3}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Order Notes</label>
                    <textarea
                      value={orderForm.notes}
                      onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
                      placeholder="Additional notes for this order"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              <div className="order-items">
                <h3>Order Items</h3>
                
                {loading ? (
                  <div className="loading">Loading products...</div>
                ) : (
                  <>
                    <div className="products-grid">
                      {products.map((product) => (
                        <div key={product.id} className="product-card">
                          <div className="product-info">
                            <h4>{product.name}</h4>
                            <p className="price">₹{product.price}/{product.unit}</p>
                            <p className="stock">In Stock: {product.stock} {product.unit}</p>
                          </div>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAddToOrder(product)}
                            disabled={product.stock <= 0}
                          >
                            Add to Order
                          </button>
                        </div>
                      ))}
                    </div>

                    {orderItems.length > 0 && (
                      <div className="order-summary">
                        <h4>Order Summary</h4>
                        <div className="summary-items">
                          {orderItems.map((item) => (
                            <div key={item.id} className="summary-item">
                              <div className="item-info">
                                <span className="item-name">{item.name}</span>
                                <span className="item-price">₹{item.price}/{item.unit}</span>
                              </div>
                              <div className="item-controls">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                                  className="quantity-input"
                                />
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleRemoveFromOrder(item.id)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="total-section">
                          <div className="total">
                            <span>Total Amount:</span>
                            <span className="total-amount">₹{calculateTotal()}</span>
                          </div>
                          <button 
                            className="btn btn-primary submit-order-btn"
                            onClick={handleSubmitOrder}
                          >
                            Submit Order
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'existing' && (
          <div className="existing-orders-section">
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {existingOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.date}</td>
                      <td>{order.customerName}</td>
                      <td>
                        <div className="order-items-list">
                          {order.items.map((item, index) => (
                            <div key={index} className="order-item">
                              {item.name} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>₹{order.total}</td>
                      <td>
                        <span 
                          className="status-badge"
                          style={{ backgroundColor: getStatusColor(order.status) }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline"
                          onClick={() => navigate(`/track-orders?order=${order.id}`)}
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
