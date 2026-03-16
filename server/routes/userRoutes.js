const express = require('express');
const User = require('../models/User.js');
const { protect, adminOnly } = require('../middleware/auth.js');

const router = express.Router();

// GET /api/users/health - Database health check
router.get('/health', async (req, res) => {
  try {
    console.log('👥 Backend: Database health check request received');
    console.log('👥 Backend: Request headers:', req.headers);
    console.log('👥 Backend: Request origin:', req.headers.origin);
    
    // Test database connection
    const userCount = await User.countDocuments();
    console.log('👥 Backend: Database connected. User count:', userCount);
    
    // Get a sample user to verify data
    const sampleUser = await User.findOne().select('name email role').limit(1);
    console.log('👥 Backend: Sample user:', sampleUser);
    
    const response = {
      success: true,
      message: 'Database connected successfully',
      userCount: userCount,
      sampleUser: sampleUser,
      timestamp: new Date().toISOString()
    };
    
    console.log('👥 Backend: Sending health check response:', response);
    res.json(response);
  } catch (error) {
    console.error('👥 Backend: Database health check failed:', error);
    console.error('👥 Backend: Error details:', error.message);
    console.error('👥 Backend: Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      details: error.toString()
    });
  }
});

// POST /api/users/test - Create a test user (for development only)
router.post('/test', async (req, res) => {
  try {
    console.log('👥 Creating test user...');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      return res.json({
        success: true,
        message: 'Test user already exists',
        user: existingUser
      });
    }
    
    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user',
      storeName: 'Test Store',
      storeType: 'Retail',
      contactNumber: '1234567890',
      addressLine1: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      ownerName: 'Test Owner',
      ownerEmail: 'owner@test.com',
      ownerPhone: '0987654321'
    });
    
    await testUser.save();
    console.log('👥 Test user created successfully');
    
    res.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        _id: testUser._id,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role,
        storeName: testUser.storeName
      }
    });
  } catch (error) {
    console.error('👥 Error creating test user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test user',
      error: error.message
    });
  }
});

// GET /api/users - Get all users (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    console.log('👥 Backend: Fetch all users request received');
    console.log('👥 Backend: Request user:', req.user);
    console.log('👥 Backend: Request headers:', req.headers.authorization);
    
    // First verify database connection
    const dbTest = await User.findOne().select('_id');
    console.log('👥 Backend: Database test successful:', !!dbTest);
    
    // Fetch all users, exclude password field
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    console.log('👥 Backend: Found users:', users.length);
    
    // Format user data for frontend
    const formattedUsers = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role === 'admin' ? 'Admin' : 'Customer',
      storeName: user.storeName || 'N/A',
      storeType: user.storeType || 'N/A',
      contactNumber: user.contactNumber || 'N/A',
      city: user.city || 'N/A',
      state: user.state || 'N/A',
      lastLogin: user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Never',
      createdAt: user.createdAt,
      status: 'Active' // All registered users are considered active
    }));
    
    console.log('👥 Backend: Formatted users:', formattedUsers.length);
    
    const response = {
      success: true,
      users: formattedUsers,
      count: formattedUsers.length
    };
    
    console.log('👥 Backend: Sending users response:', response);
    res.json(response);
  } catch (error) {
    console.error('👥 Backend: Error fetching users:', error);
    console.error('👥 Backend: Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// GET /api/users/:id - Get user by ID (admin only)
router.get('/:id', protect, adminOnly, async (req, res) => {
  try {
    console.log('👥 Fetching user by ID:', req.params.id);
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('👥 Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// PUT /api/users/:id/role - Update user role (admin only)
router.put('/:id/role', protect, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user or admin'
      });
    }
    
    console.log('👥 Updating user role:', req.params.id, 'to', role);
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User role updated successfully',
      user: user
    });
  } catch (error) {
    console.error('👥 Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    console.log('👥 Deleting user:', req.params.id);
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('👥 Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// GET /api/users/stats - Get user statistics (admin)
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    console.log('👥 Fetching user statistics...');
    
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get users by role
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userCount = await User.countDocuments({ role: 'user' });
    
    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    
    // Get active users (users who have placed orders)
    const activeUsers = await User.distinct('userId').length;
    
    console.log('👥 User stats calculated:', {
      totalUsers,
      adminCount,
      userCount,
      recentUsers,
      activeUsers
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        adminCount,
        userCount,
        recentUsers,
        activeUsers,
        recentGrowth: totalUsers > 0 ? Math.round((recentUsers / totalUsers) * 100) : 0
      }
    });
  } catch (error) {
    console.error('👥 Error fetching user statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
});

module.exports = router;
