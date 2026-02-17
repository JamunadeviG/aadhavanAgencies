import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/productService.js';
import AdminLayout from '../components/AdminLayout.jsx';
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
    <AdminLayout active="products" title="Products">
      <div className="prod-header">
        <div>
          <div className="prod-title">Product Management</div>
          <div className="prod-sub">Add, update and maintain stock</div>
        </div>
        <div className="prod-actions">
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Add Product
          </button>
          <button onClick={fetchProducts} className="btn">
            Refresh
          </button>
        </div>
      </div>

      {error && <div className="prod-alert">{error}</div>}

      {showForm && (
        <div className="form-modal">
          <div className="form-card">
            <div className="form-title">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </div>

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
                <button type="button" onClick={resetForm} className="btn">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="prod-panel">
        {loading ? (
          <div className="prod-loading">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="prod-empty">
            <div className="prod-empty-title">No products yet</div>
            <div className="prod-empty-sub">Add your first product to start tracking stock.</div>
            <button onClick={() => setShowForm(true)} className="btn btn-primary">
              Add Product
            </button>
          </div>
        ) : (
          <div className="prod-table-wrap">
            <table className="prod-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th style={{ width: 200 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="td-strong">{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.unit}</td>
                    <td>₹{product.price.toFixed(2)}</td>
                    <td>
                      <span className={`stock-chip ${product.stock === 0 ? 'out' : ''}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button onClick={() => handleEdit(product)} className="btn">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(product._id)} className="btn btn-danger">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Products;
