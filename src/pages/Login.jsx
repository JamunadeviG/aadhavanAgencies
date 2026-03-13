import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated, getStoredUser } from '../services/authService.js';
import { PageWrapper, PageContent, Card, CardBody } from '../components/Layout.jsx';
import './Login.css';

const Login = () => {
  const [loginRole, setLoginRole] = useState('admin');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
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
      const destination = response?.user?.role === 'admin' ? '/dashboard' : '/user-home';
      navigate(destination);
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'User not found. Please check your email or register for a new account.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to access this account.';
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
                <h1 className="heading-2">Welcome Back</h1>
                <p className="text-body">Sign in to your account to continue</p>
              </div>

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

              {error && <div className="error-message">{error}</div>}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label className="form-label">
                    {loginRole === 'admin' ? 'Admin Email' : 'Registered Email'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder={loginRole === 'admin' ? 'Enter admin email' : 'Enter registered email'}
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
                    placeholder="Enter your password"
                  />
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
                      'Sign In'
                    )}
                  </button>
                </div>
              </form>

              <div className="form-footer">
                <p className="text-small">
                  Don't have an account?{' '}
                  <button 
                    type="button" 
                    className="btn btn-link"
                    onClick={() => navigate('/register')}
                  >
                    Register here
                  </button>
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </PageContent>
    </PageWrapper>
  );
};

export default Login;
