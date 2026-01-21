import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getStoredUser } from '../services/authService.js';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService.js';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    price: '',
    stock: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getStoredUser();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getProducts();
      setProducts(response.products || []);
    } catch (error) {
      setError('Failed to fetch products');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const productData = {
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        price: parseFloat(formData.price),
        stock: parseFloat(formData.stock)
      };

      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct._id, productData);
      } else {
        // Create new product
        await createProduct(productData);
      }

      // Reset form and refresh products
      resetForm();
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      unit: product.unit,
      price: product.price.toString(),
      stock: product.stock.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      unit: '',
      price: '',
      stock: ''
    });
    setEditingProduct(null);
    setShowForm(false);
    setError('');
  };

  return (
    <div className="products-container">
      <header className="dashboard-header">
        <div>
          <h1>AADHAVAN AGENCIES</h1>
          <p>Welcome, {user?.name || 'Admin'}</p>
        </div>
        <nav className="dashboard-nav">
          <button onClick={() => navigate('/dashboard')} className="nav-btn">
            Dashboard
          </button>
          <button onClick={() => navigate('/products')} className="nav-btn active">
            Products
          </button>
          <button onClick={handleLogout} className="nav-btn logout-btn">
            Logout
          </button>
        </nav>
      </header>

      <main className="products-main">
        <div className="products-header">
          <h2>Product Management</h2>
          <button onClick={() => setShowForm(true)} className="add-btn">
            + Add Product
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showForm && (
          <div className="form-modal">
            <div className="form-card">
              <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Rice"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category *</label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Grains"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Unit *</label>
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                      placeholder="e.g., kg, liter, piece"
                    />
                  </div>
                  <div className="form-group">
                    <label>Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={resetForm} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    {editingProduct ? 'Update' : 'Create'} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <p>No products found. Click "Add Product" to get started.</p>
          </div>
        ) : (
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.unit}</td>
                    <td>₹{product.price.toFixed(2)}</td>
                    <td>
                      <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleEdit(product)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );

  function handleLogout() {
    logout();
    navigate('/login');
  }
};

export default Products;
