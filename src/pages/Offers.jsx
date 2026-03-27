import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser } from '../services/authService.js';
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  generateCouponCode
} from '../services/offerService.js';
import { getProducts } from '../services/productService.js';
import AdminLayout from '../components/AdminLayout.jsx';
import { getImageUrl } from '../utils/imageUtils.js';
import './Offers.css';

const Offers = () => {
  const user = getStoredUser();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Extract unique categories from products
  const categories = useMemo(() => [
    'Grain & cereals',
    'Pulses & Dals',
    'Spices & Masalas',
    'Edible Oils & Ghee',
    'Snacks & Packaged Foods',
    'Vegetables',
    'Cleaning',
    'Personal Care'
  ], []);

  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    discountType: 'percentage',
    startDate: '',
    endDate: '',
    applicableProducts: [],
    applicableCategories: [],
    minOrderAmount: '',
    maxDiscountAmount: '',
    isActive: true,
    usageLimit: '',
    couponCode: ''
  });

  useEffect(() => {
    console.log('🔄 Offers component mounted');

    const currentUser = getStoredUser();
    if (!currentUser || currentUser.role !== 'admin') {
      console.log('❌ User not authenticated or not admin, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('✅ User authenticated as admin, loading data');
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load offers and products in parallel
      const [offersResponse, productsResponse] = await Promise.all([
        getOffers().catch(err => {
          console.error('❌ Offers API error:', err);
          return { offers: [] }; // Fallback
        }),
        getProducts().catch(err => {
          console.error('❌ Products API error:', err);
          return { products: [] }; // Fallback
        })
      ]);

      console.log('📊 Offers response:', offersResponse);
      console.log('📦 Products response:', productsResponse);

      setOffers(offersResponse.offers || []);
      setProducts(productsResponse.products || []);

      console.log('✅ Data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setError(`Failed to load data: ${error.message}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleProductSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      applicableProducts: selectedOptions
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discount: '',
      discountType: 'percentage',
      startDate: '',
      endDate: '',
      applicableProducts: [],
      applicableCategories: [],
      minOrderAmount: '',
      maxDiscountAmount: '',
      isActive: true,
      usageLimit: '',
      couponCode: ''
    });
    setEditingOffer(null);
    setShowForm(false);
    setError('');
    setSuccess('');
    setSelectedImage(null);
    setImagePreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.discount ||
        !formData.startDate || !formData.endDate) {
        setError('Please fill in all required fields');
        return;
      }

      // Validate discount
      const discount = parseFloat(formData.discount);
      if (isNaN(discount) || discount < 0) {
        setError('Discount must be a positive number');
        return;
      }

      if (formData.discountType === 'percentage' && discount > 100) {
        setError('Percentage discount cannot exceed 100%');
        return;
      }

      // Prepare offer data
      const offerData = {
        ...formData,
        discount: discount,
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        applicableProducts: formData.applicableProducts.length > 0 ? formData.applicableProducts : [],
        applicableCategories: formData.applicableCategories.length > 0 ? formData.applicableCategories : []
      };

      let response;
      if (editingOffer) {
        response = await updateOffer(editingOffer._id, offerData, selectedImage);
        setSuccess('Offer updated successfully!');
      } else {
        response = await createOffer(offerData, selectedImage);
        setSuccess('Offer created successfully!');
      }

      // Reload offers
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving offer:', error);
      setError(error.message || 'Failed to save offer');
    }
  };

  const handleEdit = (offer) => {
    setFormData({
      title: offer.title,
      description: offer.description,
      discount: offer.discount.toString(),
      discountType: offer.discountType,
      startDate: new Date(offer.startDate).toISOString().split('T')[0],
      endDate: new Date(offer.endDate).toISOString().split('T')[0],
      applicableProducts: offer.applicableProducts.map(p => p._id),
      applicableCategories: offer.applicableCategories || [],
      minOrderAmount: offer.minOrderAmount || '',
      maxDiscountAmount: offer.maxDiscountAmount || '',
      isActive: offer.isActive,
      usageLimit: offer.usageLimit || '',
      couponCode: offer.couponCode || ''
    });
    setEditingOffer(offer);
    setShowForm(true);
    setError('');
    setSuccess('');
    setSelectedImage(null);
    // If we want to show existing image preview:
    if (offer.image) {
      setImagePreview(offer.image);
    } else {
      setImagePreview('');
    }
  };

  const handleDelete = async (offerId) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) {
      return;
    }

    try {
      await deleteOffer(offerId);
      setSuccess('Offer deleted successfully!');
      await loadData();
    } catch (error) {
      console.error('Error deleting offer:', error);
      setError(error.message || 'Failed to delete offer');
    }
  };

  const handleGenerateCoupon = async (offerId) => {
    try {
      const response = await generateCouponCode(offerId);
      setSuccess('Coupon code generated successfully!');
      await loadData();
    } catch (error) {
      console.error('Error generating coupon code:', error);
      setError(error.message || 'Failed to generate coupon code');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOfferActive = (offer) => {
    const now = new Date();
    const start = new Date(offer.startDate);
    const end = new Date(offer.endDate);
    return offer.isActive && start <= now && end >= now;
  };

  const getProductNames = (applicableProducts) => {
    if (!applicableProducts || applicableProducts.length === 0) {
      return 'All Products';
    }
    return applicableProducts.map(p => p.name || p).join(', ');
  };

  if (loading) {
    return (
      <AdminLayout active="offers" title="Offers Management">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading offers...</p>
        </div>
      </AdminLayout>
    );
  }

  if (hasError) {
    return (
      <AdminLayout active="offers" title="Offers Management">
        <div className="error-state">
          <h3>Something went wrong</h3>
          <p>{errorMessage}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Reload Page
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout active="offers" title="Offers Management">
      <div className="offers-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Active Offers</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
          style={{ width: 'auto' }}
        >
          Create New Offer
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError('')} className="close-btn">&times;</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess('')} className="close-btn">&times;</button>
        </div>
      )}

      {/* Offers List */}
      <div className="offers-container">
        <div className="offers-list">
          {!offers || offers.length === 0 ? (
            <div className="empty-state">
              <h3>No offers found</h3>
              <p>Create your first offer to get started</p>
            </div>
          ) : (
            offers.map((offer) => {
              // Safety check for offer object
              if (!offer || !offer._id) {
                console.warn('Invalid offer object:', offer);
                return null;
              }

              return (
                <div key={offer._id} className={`offer-card ${isOfferActive(offer) ? 'active' : 'inactive'}`}>
                  <div className="offer-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {offer.image && (
                      <div className="offer-thumbnail" style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                        <img
                          src={getImageUrl(offer.image)}
                          alt={offer.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 8px 0' }}>{offer.title || 'Untitled Offer'}</h3>
                      <div className="offer-status">
                        <span className={`status-badge ${isOfferActive(offer) ? 'active' : 'inactive'}`}>
                          {isOfferActive(offer) ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="offer-details">
                    <p className="offer-description">{offer.description}</p>

                    <div className="offer-info-grid">
                      <div className="info-item">
                        <label>Discount:</label>
                        <span>
                          {offer.discountType === 'percentage'
                            ? `${offer.discount}%`
                            : `₹${offer.discount}`}
                        </span>
                      </div>

                      <div className="info-item">
                        <label>Valid Period:</label>
                        <span>{formatDate(offer.startDate)} - {formatDate(offer.endDate)}</span>
                      </div>

                      <div className="info-item">
                        <label>Applicable Products:</label>
                        <span>{getProductNames(offer.applicableProducts)}</span>
                      </div>

                      {offer.applicableCategories && offer.applicableCategories.length > 0 && (
                        <div className="info-item">
                          <label>Applicable Categories:</label>
                          <span>{offer.applicableCategories.join(', ')}</span>
                        </div>
                      )}

                      {offer.minOrderAmount > 0 && (
                        <div className="info-item">
                          <label>Min Order Amount:</label>
                          <span>₹{offer.minOrderAmount}</span>
                        </div>
                      )}

                      {offer.maxDiscountAmount && (
                        <div className="info-item">
                          <label>Max Discount:</label>
                          <span>₹{offer.maxDiscountAmount}</span>
                        </div>
                      )}

                      {offer.usageLimit && (
                        <div className="info-item">
                          <label>Usage Limit:</label>
                          <span>{offer.usedCount} / {offer.usageLimit}</span>
                        </div>
                      )}

                      {offer.couponCode && (
                        <div className="info-item">
                          <label>Coupon Code:</label>
                          <span className="coupon-code">{offer.couponCode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="offer-actions">
                    <button
                      className="btn btn-outline"
                      onClick={() => handleEdit(offer)}
                    >
                      Edit
                    </button>

                    {!offer.couponCode && (
                      <button
                        className="btn btn-outline"
                        onClick={() => handleGenerateCoupon(offer._id)}
                      >
                        Generate Coupon
                      </button>
                    )}

                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(offer._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Offer Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</h2>
              <button onClick={resetForm} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="offer-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">Offer Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Offer Image</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      id="offerImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="image-input"
                    />
                    <label htmlFor="offerImage" className="image-upload-label">
                      {selectedImage ? selectedImage.name : 'Choose image file...'}
                    </label>
                    {imagePreview && (
                      <div className="image-preview-container">
                        <img src={imagePreview} alt="Offer preview" className="image-preview" />
                        <button type="button" onClick={clearImage} className="clear-image-btn">
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="discountType">Discount Type</label>
                  <select
                    id="discountType"
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="discount">
                    Discount ({formData.discountType === 'percentage' ? '%' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : ''}
                    step={formData.discountType === 'percentage' ? '0.01' : '0.01'}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="startDate">Start Date *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">End Date *</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    min={formData.startDate}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="applicableProducts">APPLICABLE PRODUCTS</label>
                  <div className="multi-select-dropdown">
                    <select
                      id="applicableProducts"
                      name="applicableProducts"
                      value={formData.applicableProducts}
                      onChange={handleProductSelection}
                      multiple
                      className="product-multi-select"
                    >
                      <option value="" disabled>
                        Leave empty for all products
                      </option>
                      {products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} ({product.unit})
                        </option>
                      ))}
                    </select>
                    <div className="multi-select-hint">
                      Hold Ctrl/Cmd to select multiple products
                    </div>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="applicableCategories">APPLICABLE CATEGORIES</label>
                  <div className="multi-select-dropdown">
                    <select
                      id="applicableCategories"
                      name="applicableCategories"
                      value={formData.applicableCategories}
                      onChange={(e) => {
                        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                        setFormData(prev => ({ ...prev, applicableCategories: selectedOptions }));
                      }}
                      multiple
                      className="product-multi-select"
                    >
                      <option value="" disabled>
                        Leave empty for all categories
                      </option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="multi-select-hint">
                      Hold Ctrl/Cmd to select multiple categories
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="minOrderAmount">Minimum Order Amount</label>
                  <input
                    type="number"
                    id="minOrderAmount"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maxDiscountAmount">Maximum Discount Amount</label>
                  <input
                    type="number"
                    id="maxDiscountAmount"
                    name="maxDiscountAmount"
                    value={formData.maxDiscountAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="No limit"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="usageLimit">Usage Limit</label>
                  <input
                    type="number"
                    id="usageLimit"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Unlimited"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="couponCode">Coupon Code</label>
                  <input
                    type="text"
                    id="couponCode"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleInputChange}
                    placeholder="Auto-generated if empty"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Active
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Offers;
