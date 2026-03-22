import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoredUser, updateUserProfile } from '../services/authService.js';
import { PageWrapper, PageContent } from '../components/Layout.jsx';
import UserNavbar from '../components/UserNavbar.jsx';
import './EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  
  // Get user data directly from localStorage
  const getUserData = () => {
    try {
      const userData = localStorage.getItem('user');
      console.log('Raw localStorage user data:', userData); // Debug raw data
      const parsed = userData ? JSON.parse(userData) : {};
      console.log('Parsed user data:', parsed); // Debug parsed data
      return parsed;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return {};
    }
  };
  
  const userData = getUserData();
  
  const [formData, setFormData] = useState({
    name: userData.name || '',
    email: userData.email || '',
    contactNumber: userData.contactNumber || userData.phone || '',
    addressLine1: userData.addressLine1 || userData.address || '',
    addressLine2: userData.addressLine2 || '',
    city: userData.city || '',
    state: userData.state || '',
    pincode: userData.pincode || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    if (!userData || !userData.id) {
      navigate('/login');
      return;
    }
  }, [userData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Create updated user object with all registration fields
      const updatedUser = { 
        ...userData, 
        ...formData,
        role: userData.role || 'user', // Preserve role
        updatedAt: new Date().toISOString()
      };
      
      // Update in localStorage (main storage)
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Save to user-specific storage for persistence
      if (userData.id) {
        localStorage.setItem(`user_${userData.id}`, JSON.stringify(updatedUser));
      }
      
      // Update current user in auth service
      updateUserProfile(updatedUser);
      
      // Simulate backend database update
      await simulateBackendUpdate(updatedUser);
      
      setMessage('Profile updated successfully in database!');
      setMessageType('success');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/user-home');
      }, 2000);
      
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage('Failed to update profile. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const simulateBackendUpdate = async (userData) => {
    // Simulate backend API call to update user in database
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful database update
    console.log('Backend updated with user data:', userData);
    return {
      success: true,
      message: 'Profile updated successfully in database',
      data: userData
    };
  };

  const handleCancel = () => {
    navigate('/user-home');
  };

  return (
    <PageWrapper>
      <UserNavbar />
      <PageContent>
        <div className="edit-profile-page">
      <div className="container">
        <div className="edit-profile-container">
          <div className="profile-header">
            <h2>Edit Profile</h2>
            <p>Update your personal and business information</p>
          </div>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number</label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Address Information</h3>
              <div className="form-group">
                <label htmlFor="addressLine1">Address Line 1</label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="addressLine2">Address Line 2</label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="state">State</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                >
                  <option value="">Select State</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="pincode">Pincode</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
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
