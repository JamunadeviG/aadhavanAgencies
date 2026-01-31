import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, isAuthenticated, getStoredUser } from '../services/authService.js';
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
  pincode: ''
};

const Login = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and register
  const [loginRole, setLoginRole] = useState('admin'); // admin or user login mode
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      const storedUser = getStoredUser();
      const destination = storedUser?.role === 'admin' ? '/dashboard' : '/user-dashboard';
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
      if (isLogin) {
        // Login
        const payload = {
          password: formData.password,
          asAdmin: loginRole === 'admin'
        };

        if (loginRole === 'admin') {
          payload.email = formData.email;
        } else {
          payload.email = formData.email;
        }

        const response = await login(payload);
        const destination = response?.user?.role === 'admin' ? '/dashboard' : '/user-dashboard';
        navigate(destination);
      } else {
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
          pincode: sanitize(formData.pincode)
        });

        setIsLogin(true);
        setLoginRole('user');
        resetForm();
        setRegistrationSuccess({
          userId: response?.user?.userId,
          email: response?.user?.email,
          storeName: response?.user?.storeInfo?.storeName
        });
        setError('');
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {registrationSuccess && (
        <div className="modal-overlay" role="alertdialog" aria-live="assertive">
          <div className="modal-card">
            <p className="modal-kicker">Registration Complete</p>
            <h3>Welcome to Aadhavan Agencies 🎉</h3>
            <p>
              {registrationSuccess.storeName ? (
                <>
                  <strong>{registrationSuccess.storeName}</strong> has been registered successfully.
                </>
              ) : (
                'Your store has been registered successfully.'
              )}
            </p>
            <div className="modal-info">
              <div>
                <span className="label">Retail ID</span>
                <span className="value">{registrationSuccess.userId || 'Assigned automatically'}</span>
              </div>
              <div>
                <span className="label">Login Email</span>
                <span className="value">{registrationSuccess.email}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setRegistrationSuccess(null)}
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
      <div className="login-card">
        <h1>AADHAVAN AGENCIES</h1>
        <h2>
          {isLogin
            ? `${loginRole === 'admin' ? 'Admin' : 'User'} Login`
            : 'User Register'}
        </h2>

        {isLogin && (
          <div className="role-toggle">
            <button
              type="button"
              className={`role-btn ${loginRole === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setLoginRole('admin');
                setError('');
              }}
            >
              Admin Login
            </button>
            <button
              type="button"
              className={`role-btn ${loginRole === 'user' ? 'active' : ''}`}
              onClick={() => {
                setLoginRole('user');
                setError('');
              }}
            >
              User Login
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          {isLogin ? (
            <>
              <div className="form-group">
                <label>{loginRole === 'admin' ? 'Admin Email' : 'Registered Email'}</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder={loginRole === 'admin' ? 'Enter admin email' : 'Enter registered email'}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="Enter your password"
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-section">
                <h3>Account Details</h3>
                <div className="form-group">
                  <label>Owner Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter owner name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Billing email"
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength="6"
                    placeholder="Create password"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Store Details</h3>
                <div className="form-group">
                  <label>Store Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    required
                    minLength="3"
                    placeholder="Retail store name"
                  />
                </div>
                <div className="form-group">
                  <label>Store Type</label>
                  <select name="storeType" value={formData.storeType} onChange={handleChange}>
                    <option value="Retail">Retail</option>
                    <option value="Supermarket">Supermarket</option>
                    <option value="Hotel/Restaurant">Hotel / Restaurant</option>
                    <option value="Distributor">Distributor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>GST Number (optional)</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="GSTIN"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    inputMode="tel"
                    minLength="10"
                    maxLength="15"
                    placeholder="Store contact"
                  />
                  <p className="helper-text">Primary phone number used for delivery coordination.</p>
                </div>
                <div className="form-group">
                  <label>Address Line 1</label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    required
                    placeholder="Street / Door no."
                  />
                </div>
                <div className="form-group">
                  <label>Address Line 2</label>
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Area / Landmark"
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      minLength="2"
                      placeholder="City"
                    />
                  </div>
                  <div className="form-group">
                    <label>State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      minLength="2"
                      placeholder="State"
                    />
                  </div>
                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      minLength="4"
                      maxLength="10"
                      placeholder="600001"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <span
                onClick={() => {
                  setIsLogin(false);
                  resetForm();
                  setRegistrationSuccess(null);
                }}
                className="toggle-link"
              >
                Register
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span
                onClick={() => {
                  setIsLogin(true);
                  resetForm();
                  setLoginRole('user');
                  setRegistrationSuccess(null);
                }}
                className="toggle-link"
              >
                Login
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;
