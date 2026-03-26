import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, updateUserProfile } from '../services/authService.js';
import { PageWrapper, PageContent } from '../components/Layout.jsx';
import UserNavbar from '../components/UserNavbar.jsx';
import { getImageUrl } from '../utils/imageUtils.js';
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();

  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : {};
    } catch {
      return {};
    }
  };

  const userData = getUserData();

  // Tabs State
  const [activeTab, setActiveTab] = useState('personal');

  // Form State
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    contactNumber: userData.contactNumber || userData.phone || '',
    addressLine1: userData.addressLine1 || userData.address || '',
    addressLine2: userData.addressLine2 || '',
    city: userData.city || '',
    state: userData.state || '',
    pincode: userData.pincode || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Avatar State
  const [avatarPreview, setAvatarPreview] = useState(userData.profilePic ? getImageUrl(userData.profilePic) : null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Validation State
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    if (!userData || !userData.id) {
      navigate('/login');
    }
  }, [userData, navigate]);

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (value.length < 3) error = 'Name must be at least 3 characters.';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email address.';
        break;
      case 'contactNumber':
        if (!/^\d{10}$/.test(value)) error = 'Phone must be exactly 10 digits.';
        break;
      case 'pincode':
        if (value && !/^\d{6}$/.test(value)) error = 'Pincode must be 6 digits.';
        break;
      case 'newPassword':
        if (value && value.length < 6) error = 'Password must be at least 6 characters.';
        break;
      case 'confirmPassword':
        if (value && value !== formData.newPassword) error = 'Passwords do not match.';
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    setSuccess(prev => ({ ...prev, [name]: !error && value.length > 0 }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const imageUrl = URL.createObjectURL(file);
      setAvatarPreview(imageUrl);
      setToast({ show: true, message: 'Avatar updated temporarily. Save to persist.', type: 'success' });
      setTimeout(() => setToast({ show: false }), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final generic validation block
    const hasErrors = Object.values(errors).some(err => err !== '');
    if (hasErrors) {
      setToast({ show: true, message: 'Please fix the errors before submitting.', type: 'error' });
      setTimeout(() => setToast({ show: false }), 3000);
      return;
    }

    setLoading(true);

    try {
      const updatedUser = {
        ...formData
      };

      // Attempt to save to backend
      await updateUserProfile(updatedUser, avatarFile);

      setToast({ show: true, message: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => {
        setToast({ show: false });
        navigate('/user-home');
      }, 2000);

    } catch (error) {
      setToast({ show: true, message: 'Failed to update profile.', type: 'error' });
      setTimeout(() => setToast({ show: false }), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Live Indicator Component
  const ValidatorIcon = ({ name }) => {
    if (errors[name]) return <span className="v-icon error">✗</span>;
    if (success[name]) return <span className="v-icon success">✓</span>;
    return null;
  };

  return (
    <PageWrapper>
      <UserNavbar />
      <PageContent>
        <div className="modern-profile-layout">
          {toast.show && (
            <div className={`toast-notification ${toast.type} pop-in`}>
              {toast.message}
            </div>
          )}

          <div className="profile-glass-card">

            {/* Left Sidebar Layout */}
            <div className="profile-sidebar">
              <div className="avatar-section">
                <div className="avatar-wrapper">
                  <img src={avatarPreview || "https://ui-avatars.com/api/?name=" + formData.name + "&background=1a3c2e&color=fff"} alt="User Avatar" className="circular-avatar" />
                  <label htmlFor="avatar-upload" className="avatar-edit-btn">
                    📷
                  </label>
                  <input type="file" id="avatar-upload" accept="image/*" onChange={handleAvatarChange} hidden />
                </div>
                <h3>{formData.name || 'User Profile'}</h3>
                <p className="role-badge">{userData.role?.toUpperCase() || 'WHOLESALE PARTNER'}</p>
              </div>

              <div className="tab-navigation">
                <button className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
                  <span className="tab-icon">👤</span> Personal Info
                </button>
                <button className={`tab-btn ${activeTab === 'address' ? 'active' : ''}`} onClick={() => setActiveTab('address')}>
                  <span className="tab-icon">📍</span> Address Book
                </button>
                <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                  <span className="tab-icon">🔒</span> Security
                </button>
              </div>
            </div>

            {/* Right Content Area */}
            <div className="profile-form-area">
              <form onSubmit={handleSubmit} className="sliding-form-container">

                {/* Personal Info Tab */}
                <div className={`tab-pane ${activeTab === 'personal' ? 'slide-in-active' : 'slide-out'}`}>
                  <div className="pane-header">
                    <h2>Personal Information</h2>
                    <p>Update your base identity and contact details.</p>
                  </div>
                  <div className="form-grid">
                    <div className={`smart-input-group ${errors.name ? 'has-error' : ''} ${success.name ? 'has-success' : ''}`}>
                      <label>Full Name</label>
                      <div className="input-wrapper">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Company or Individual Name" required />
                        <ValidatorIcon name="name" />
                      </div>
                      <span className="error-msg">{errors.name}</span>
                    </div>

                    <div className={`smart-input-group ${errors.email ? 'has-error' : ''} ${success.email ? 'has-success' : ''}`}>
                      <label>Email Address</label>
                      <div className="input-wrapper">
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                        <ValidatorIcon name="email" />
                      </div>
                      <span className="error-msg">{errors.email}</span>
                    </div>

                    <div className={`smart-input-group ${errors.contactNumber ? 'has-error' : ''} ${success.contactNumber ? 'has-success' : ''}`}>
                      <label>Contact Number</label>
                      <div className="input-wrapper">
                        <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
                        <ValidatorIcon name="contactNumber" />
                      </div>
                      <span className="error-msg">{errors.contactNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Address Tab */}
                <div className={`tab-pane ${activeTab === 'address' ? 'slide-in-active' : 'slide-out'}`}>
                  <div className="pane-header">
                    <h2>Logistics Data</h2>
                    <p>Your delivery destination for wholesale freight.</p>
                  </div>
                  <div className="form-grid">
                    <div className="smart-input-group full-width">
                      <label>Address Line 1</label>
                      <div className="input-wrapper">
                        <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="smart-input-group full-width">
                      <label>Address Line 2</label>
                      <div className="input-wrapper">
                        <input type="text" name="addressLine2" value={formData.addressLine2} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="smart-input-group">
                      <label>City</label>
                      <div className="input-wrapper">
                        <input type="text" name="city" value={formData.city} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="smart-input-group">
                      <label>State</label>
                      <div className="input-wrapper">
                        <select name="state" value={formData.state} onChange={handleChange}>
                          <option value="">Select Region...</option>
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Other">Other Region</option>
                        </select>
                      </div>
                    </div>

                    <div className={`smart-input-group ${errors.pincode ? 'has-error' : ''} ${success.pincode ? 'has-success' : ''}`}>
                      <label>Postal Code</label>
                      <div className="input-wrapper">
                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} />
                        <ValidatorIcon name="pincode" />
                      </div>
                      <span className="error-msg">{errors.pincode}</span>
                    </div>
                  </div>
                </div>

                {/* Security Tab */}
                <div className={`tab-pane ${activeTab === 'security' ? 'slide-in-active' : 'slide-out'}`}>
                  <div className="pane-header">
                    <h2>Account Security</h2>
                    <p>Rotate keys to maintain pipeline integrity.</p>
                  </div>
                  <div className="form-grid">
                    <div className="smart-input-group full-width">
                      <label>Current Password</label>
                      <div className="input-wrapper">
                        <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} placeholder="Enter to authorize changes" />
                      </div>
                    </div>
                    <div className={`smart-input-group ${errors.newPassword ? 'has-error' : ''} ${success.newPassword ? 'has-success' : ''}`}>
                      <label>New Password</label>
                      <div className="input-wrapper">
                        <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} />
                        <ValidatorIcon name="newPassword" />
                      </div>
                      <span className="error-msg">{errors.newPassword}</span>
                    </div>
                    <div className={`smart-input-group ${errors.confirmPassword ? 'has-error' : ''} ${success.confirmPassword ? 'has-success' : ''}`}>
                      <label>Confirm New Password</label>
                      <div className="input-wrapper">
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
                        <ValidatorIcon name="confirmPassword" />
                      </div>
                      <span className="error-msg">{errors.confirmPassword}</span>
                    </div>
                  </div>
                </div>

                {/* Fixed Action Footer */}
                <div className="profile-action-footer">
                  <button type="button" className="btn-cancel" onClick={() => navigate('/user-home')} disabled={loading}>
                    Discard Changes
                  </button>
                  <button type="submit" className={`btn-save ${loading ? 'syncing' : ''}`} disabled={loading}>
                    {loading ? 'Committing...' : 'Commit Identity'}
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      </PageContent>
    </PageWrapper>
  );
};

export default EditProfile;
