import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, isAuthenticated, getStoredUser } from '../services/authService.js';
import './Register.css';

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
  pincode: ''
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
      const destination = storedUser?.role === 'admin' ? '/admin-home' : '/user-home';
      navigate(destination);
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on input change
  };

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Submitting registration data:', formData); // Debug form data

      // Register
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
        role: 'user' // Default role for registration
      });

      console.log('Registration response:', response); // Debug response
      console.log('Response success field:', response.success); // Debug success field
      console.log('Response user data:', response.user); // Debug user data
      console.log('Response structure:', Object.keys(response)); // Debug response keys

      // Handle success response - check multiple possible success indicators
      const isSuccess = response.success === true || response.user || (response.data && response.data.user);
      
      if (isSuccess) {
        console.log('Registration successful, user data:', response.user || response.data?.user); // Debug success
        
        // Get user data from response (handle different response structures)
        const userData = response.user || response.data?.user;
        
        if (userData) {
          // Store user data and show success modal
          setRegistrationSuccess(userData);
          setShowSuccessModal(true);
          console.log('registrationSuccess state set to:', userData); // Debug state change
          resetForm();
        } else {
          console.error('No user data found in response');
          setError('Registration completed but user data is missing. Please try logging in.');
        }
      } else {
        console.log('Registration failed:', response.message); // Debug failure
        
        // Don't store any data if registration failed
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err); // Debug error
      
      // Handle different types of errors
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.response?.status === 409) {
        errorMessage = 'User with this email already exists. Please try logging in instead.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid registration data. Please check all fields and try again.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card card">
          <div className="login-header">
            <h2>User Register</h2>
            <p>Create your account to get started</p>
          </div>

          {/* Debug Info */}
          <div style={{background: '#e3f2fd', border: '1px solid #2196f3', padding: '10px', marginBottom: '15px', borderRadius: '5px', fontSize: '12px'}}>
            <strong>Debug Info:</strong><br/>
            registrationSuccess: {registrationSuccess ? 'YES' : 'NO'}<br/>
            registrationSuccess data: {JSON.stringify(registrationSuccess, null, 2)}<br/>
            error: {error || 'none'}<br/>
            loading: {loading ? 'YES' : 'NO'}
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {showSuccessModal && (
            <div className="success-modal-overlay">
              <div className="success-modal">
                <div className="modal-header">
                  <div className="success-icon">✅</div>
                  <h3>Registration Successful!</h3>
                </div>
                <div className="modal-body">
                  <p>
                    {registrationSuccess.storeName ? (
                      <>
                        <strong>{registrationSuccess.storeName}</strong> has been registered successfully!
                      <br /><br />
                        Your account is ready to use. You can now login with your email address.
                      </>
                    ) : (
                      <>
                        Your store has been registered successfully!
                        <br /><br />
                        Your account is ready to use. You can now login with your email address.
                      </>
                    )}
                  </p>
                  <div className="user-details">
                    <h4>Registration Details:</h4>
                    <p><strong>Store Name:</strong> {registrationSuccess.storeName || 'N/A'}</p>
                    <p><strong>Email:</strong> {registrationSuccess.email || 'N/A'}</p>
                    <p><strong>Store Type:</strong> {registrationSuccess.storeType || 'N/A'}</p>
                    <p><strong>City:</strong> {registrationSuccess.city || 'N/A'}</p>
                    <p><strong>State:</strong> {registrationSuccess.state || 'N/A'}</p>
                  </div>
                  <div className="modal-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => {
                        setShowSuccessModal(false);
                        navigate('/login');
                      }}
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!registrationSuccess && (
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create a password"
                    minLength="6"
                  />
                </div>
                <div className="form-group">
                  <label>Store Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    required
                    placeholder="Enter your store name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Store Type</label>
                  <select
                    name="storeType"
                    value={formData.storeType}
                    onChange={handleChange}
                    required
                  >
                    <option value="Retail">Retail</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Cafe">Cafe</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="Enter GST number (optional)"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter contact number"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Enter city"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select State</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Bihar">Bihar</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    required
                    placeholder="Enter pincode"
                    maxLength="6"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address Line 1</label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  required
                  placeholder="Enter address line 1"
                />
              </div>

              <div className="form-group">
                <label>Address Line 2</label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Enter address line 2 (optional)"
                />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Processing...' : 'Register'}
              </button>
            </form>
          )}

          <p className="toggle-text">
            Already have an account?{' '}
            <span
              onClick={() => {
                navigate('/login');
              }}
              className="toggle-link"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
