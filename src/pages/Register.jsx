import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, isAuthenticated, getStoredUser } from '../services/authService.js';
import { PageWrapper, PageContent, Card, CardBody, Grid } from '../components/Layout.jsx';
import './Login.css';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  storeName: '',
  storeType: 'Retail',
  gstNumber: '',
  contactNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  ownerName: '',
  ownerEmail: '',
  ownerPhone: ''
};

const Register = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const storedUser = getStoredUser();
      const destination = storedUser?.role === 'admin' ? '/dashboard' : '/user-home';
      navigate(destination);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const sanitize = (value = '') => value.trim();
      
      const response = await register({
        name: sanitize(formData.name),
        email: sanitize(formData.email),
        password: formData.password,
        storeName: sanitize(formData.storeName),
        storeType: formData.storeType,
        gstNumber: sanitize(formData.gstNumber),
        contactNumber: sanitize(formData.contactNumber),
        addressLine1: sanitize(formData.addressLine1),
        addressLine2: sanitize(formData.addressLine2),
        city: sanitize(formData.city),
        state: sanitize(formData.state),
        pincode: sanitize(formData.pincode),
        ownerName: sanitize(formData.ownerName),
        ownerEmail: sanitize(formData.ownerEmail),
        ownerPhone: sanitize(formData.ownerPhone),
        role: 'user'
      });

      if (response.user) {
        setRegistrationSuccess(response);
        resetForm();
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.status === 409) {
        errorMessage = 'User with this email already exists. Please try logging in instead.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid registration data. Please check all fields and try again.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <PageContent>
        <div className="login-container">
          <Card className="login-card">
            <CardBody>
              <div className="login-header">
                <div className="brand-logo">
                  <span>AA</span>
                </div>
                <h1 className="heading-2">Create Account</h1>
                <p className="text-body">Register your wholesale store with Aadhavan Agencies</p>
              </div>

              {registrationSuccess && (
                <div className="success-modal-overlay" role="alertdialog" aria-live="assertive">
                  <Card className="success-modal-card">
                    <CardBody className="text-center">
                      <div className="success-badge">Registration Successful!</div>
                      <h3 className="heading-3">Welcome to Aadhavan Agencies 🎉</h3>
                      <p className="text-body">
                        <strong>{registrationSuccess.user?.storeName}</strong> has been registered successfully!
                      </p>
                      <div className="success-info">
                        <div className="info-section">
                          <h4 className="info-section-title">Store Information</h4>
                          <Grid cols={2} gap="4">
                            <div className="info-item">
                              <span className="info-label">Retail ID</span>
                              <span className="info-value">{registrationSuccess.user?.userId || 'Assigned automatically'}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Store Name</span>
                              <span className="info-value">{registrationSuccess.user?.storeName}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Store Type</span>
                              <span className="info-value">{registrationSuccess.user?.storeType}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">GST Number</span>
                              <span className="info-value">{registrationSuccess.user?.gstNumber || 'Not provided'}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Contact Number</span>
                              <span className="info-value">{registrationSuccess.user?.contactNumber}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Address Line 1</span>
                              <span className="info-value">{registrationSuccess.user?.addressLine1}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Address Line 2</span>
                              <span className="info-value">{registrationSuccess.user?.addressLine2 || 'Not provided'}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">City</span>
                              <span className="info-value">{registrationSuccess.user?.city}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">State</span>
                              <span className="info-value">{registrationSuccess.user?.state}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Pincode</span>
                              <span className="info-value">{registrationSuccess.user?.pincode}</span>
                            </div>
                          </Grid>
                        </div>

                        <div className="info-section">
                          <h4 className="info-section-title">Owner Information</h4>
                          <Grid cols={2} gap="4">
                            <div className="info-item">
                              <span className="info-label">Owner Name</span>
                              <span className="info-value">{registrationSuccess.user?.ownerName}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Owner Email</span>
                              <span className="info-value">{registrationSuccess.user?.ownerEmail}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Owner Phone</span>
                              <span className="info-value">{registrationSuccess.user?.ownerPhone}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Login Email</span>
                              <span className="info-value">{registrationSuccess.user?.email}</span>
                            </div>
                          </Grid>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={() => navigate('/')}
                      >
                        OK
                      </button>
                    </CardBody>
                  </Card>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-section">
                  <h3 className="heading-4">Account Details</h3>
                  <div className="form-group">
                    <label className="form-label">Owner Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Enter owner name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Billing email"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      className="form-input"
                      placeholder="Create password"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="heading-4">Owner Information</h3>
                  <div className="form-group">
                    <label className="form-label">Owner Name</label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Enter owner name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Owner Email</label>
                    <input
                      type="email"
                      name="ownerEmail"
                      value={formData.ownerEmail}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Owner email address"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Owner Phone</label>
                    <input
                      type="tel"
                      name="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Owner mobile number"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="heading-4">Store Details</h3>
                  <div className="form-group">
                    <label className="form-label">Store Name</label>
                    <input
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleChange}
                      required
                      minLength="3"
                      className="form-input"
                      placeholder="Retail store name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Store Type</label>
                    <select name="storeType" value={formData.storeType} onChange={handleChange} className="form-select">
                      <option value="Retail">Retail</option>
                      <option value="Supermarket">Supermarket</option>
                      <option value="Hotel/Restaurant">Hotel / Restaurant</option>
                      <option value="Distributor">Distributor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">GST Number</label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="GSTIN (Optional)"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Contact Number</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Mobile number"
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="heading-4">Address Information</h3>
                  <div className="form-group">
                    <label className="form-label">Address Line 1</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      required
                      className="form-input"
                      placeholder="Street address"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address Line 2</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Apartment, suite, etc. (Optional)"
                    />
                  </div>
                  <Grid cols={3} gap="4">
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="City"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="State"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                        className="form-input"
                        placeholder="Pincode"
                      />
                    </div>
                  </Grid>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-lg btn-block"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Processing...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>

                <div className="form-footer">
                  <p className="text-small">
                    Already have an account?{' '}
                    <button 
                      type="button" 
                      className="btn btn-link"
                      onClick={() => navigate('/login')}
                    >
                      Sign in here
                    </button>
                  </p>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </PageContent>
    </PageWrapper>
  );
};

export default Register;
