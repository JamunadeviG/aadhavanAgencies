import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout.jsx';
import { getUsers, deleteUser } from '../services/userService.js';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('👥 Fetching users...');

      const response = await getUsers();
      console.log('👥 Users response:', response);

      if (response.success && response.users) {
        setUsers(response.users);
        console.log('👥 Loaded users:', response.users.length);
      } else if (response.users) {
        setUsers(response.users);
        console.log('👥 Loaded users:', response.users.length);
      } else {
        console.warn('👥 Unexpected response format:', response);
        setUsers([]);
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('👥 Error fetching users:', error);

      // Handle different error types
      if (error.code === 'NETWORK_ERROR') {
        setError('Network error. Unable to connect to server.');
      } else if (error.response?.status === 401) {
        setError('Unauthorized. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        const errorMessage = error.message || 'Failed to load users. Please try again.';
        setError(errorMessage);
      }

      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetails = (user) => {
    console.log('👥 User data for details:', user);
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedUser(null);
  };

  const handleAddUser = () => {
    window.location.href = '/register';
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      console.log('👥 Delete user requested:', userId);
      await deleteUser(userId);
      console.log('👥 User deleted successfully:', userId);
      setUsers(users.filter(user => user._id !== userId));
    } catch (error) {
      console.error('👥 Error deleting user:', error);
      setError('Failed to delete user.');
    }
  };

  return (
    <AdminLayout active="users" title="Users & Customers">
      <div className="admin-table">
        <div className="admin-table-head">
          <div>
            <div className="kicker">Access control</div>
            <h2>Manage accounts</h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" style={{ width: 'auto' }} onClick={handleAddUser}>
              Add User
            </button>
            <button className="btn" onClick={fetchUsers}>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '1rem', padding: '1rem' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Loading users...</div>
          </div>
        ) : users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>No users found</div>
            <div style={{ color: '#666', marginBottom: '1.5rem', fontSize: '1rem' }}>No registered users in the database yet.</div>
            <button className="btn btn-primary" onClick={handleAddUser}>
              Add First User
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Store Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#333' }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#333' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#333' }}>{user.name}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#555' }}>{user.storeName || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: '#555' }}>{user.email}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span
                      className={`status-chip ${user.role === 'Admin' ? 'admin' : 'customer'
                        }`}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        backgroundColor: user.role === 'Admin' ? '#dc3545' : '#28a745',
                        color: 'white'
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      <button
                        className="btn ghost"
                        onClick={() => handleShowDetails(user)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        Details
                      </button>
                      {user.role !== 'Admin' && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteUser(user._id)}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* User Details Modal */}
        {showDetailsModal && selectedUser && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '2rem',
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#333' }}>User Details</h2>
                <button
                  onClick={handleCloseDetails}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: '#666',
                    padding: '0.25rem'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Basic Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>Name:</strong>
                  <span>{selectedUser.name || 'N/A'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>Email:</strong>
                  <span>{selectedUser.email || 'N/A'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>Role:</strong>
                  <span>
                    <span
                      className={`status-chip ${selectedUser.role === 'Admin' ? 'admin' : 'customer'
                        }`}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        backgroundColor: selectedUser.role === 'Admin' ? '#dc3545' : '#28a745',
                        color: 'white'
                      }}
                    >
                      {selectedUser.role || 'N/A'}
                    </span>
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>User ID:</strong>
                  <span>{selectedUser.userId || 'N/A'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>Store Name:</strong>
                  <span>{selectedUser.storeName || 'N/A'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>Store Type:</strong>
                  <span>{selectedUser.storeType || 'N/A'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>GST Number:</strong>
                  <span>{selectedUser.gstNumber || 'N/A'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>Contact Number:</strong>
                  <span>{selectedUser.contactNumber || 'N/A'}</span>
                </div>

                {/* Address Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>Address Line 1:</strong>
                  <span>{selectedUser.addressLine1 || 'N/A'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>Address Line 2:</strong>
                  <span>{selectedUser.addressLine2 || 'N/A'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>City:</strong>
                  <span>{selectedUser.city || 'N/A'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>State:</strong>
                  <span>{selectedUser.state || 'N/A'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>Pincode:</strong>
                  <span>{selectedUser.pincode || 'N/A'}</span>
                </div>

                {/* System Information */}
                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>Account Created:</strong>
                  <span>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>Last Updated:</strong>
                  <span>{selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '0.5rem' }}>
                  <strong style={{ color: '#555' }}>Database ID:</strong>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>{selectedUser._id || 'N/A'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', gap: '0.5rem' }}>
                <button
                  onClick={handleCloseDetails}
                  className="btn"
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Users;
