const express = require('express');
const Order = require('../models/Order.js');
const Product = require('../models/Product.js');
const { protect, adminOnly } = require('../middleware/auth.js');

const router = express.Router();

// POST /api/orders - Create new order
router.post('/', protect, async (req, res) => {
  try {
    console.log('📦 ORDER API CALL START');
    console.log('📦 Request body:', req.body);
    console.log('📦 User ID:', req.user.id);

    const {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryDate,
      deliveryTime,
      notes,
      total,
      items,
      userId,
      userEmail,
      userName
    } = req.body;

    // Validate required fields
    if (!customerName || !customerPhone || !deliveryAddress || !deliveryDate || !deliveryTime) {
      console.log('❌ Missing required fields:', { customerName, customerPhone, deliveryAddress, deliveryDate, deliveryTime });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customerName, customerPhone, deliveryAddress, deliveryDate, deliveryTime'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      console.log('❌ Invalid or empty items:', items);
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.productId || !item.name || !item.price || !item.quantity || !item.unit) {
        console.log(`❌ Invalid item at index ${i}:`, item);
        return res.status(400).json({
          success: false,
          message: `Invalid item data: ${item.name || 'Unknown item'}`
        });
      }
    }

    // Create order with all fields
    const orderData = {
      customerName,
      customerPhone,
      deliveryAddress,
      deliveryDate,
      deliveryTime,
      notes: notes || '',
      total: parseFloat(total),
      status: 'pending',
      userId: userId || req.user.id,
      userEmail: userEmail || req.user.email,
      userName: userName || req.user.name || req.user.username,
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
        unit: item.unit,
        subtotal: parseFloat(item.subtotal)
      }))
    };

    console.log('📦 Creating order with data:', orderData);

    const order = await Order.create(orderData);
    console.log('✅ Order created successfully:', order);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: order
    });

  } catch (err) {
    console.error('📦 ORDER API ERROR:', err);
    console.error('📦 Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: err.message
    });
  }
});

// Clean up all test data immediately
router.get('/cleanup-all-test-data', protect, async (req, res) => {
  try {
    console.log('🧹 CLEANING ALL TEST DATA...');

    // Delete all orders that look like test data
    const deleteResult = await Order.deleteMany({
      $or: [
        // Test customer names
        { customerName: { $in: ['Test User', 'Sample Customer', 'Jaya Stores', 'SK Supermart', 'A1 Grocers', 'Test Customer', 'Sample User'] } },
        // Test order IDs
        { orderId: { $regex: /^TEST/ } },
        { orderId: { $regex: /^ORD-102/ } },
        // Test amounts
        { total: { $in: [12450, 8930, 5110, 100] } },
        // Missing real customer data
        { customerName: { $exists: false } },
        { customerName: '' },
        { customerName: null }
      ]
    });

    console.log(`🧹 Deleted ${deleteResult.deletedCount} test orders`);

    // Get remaining orders to show what's left
    const remainingOrders = await Order.find({});
    console.log(`📊 Remaining orders: ${remainingOrders.length}`);

    res.json({
      success: true,
      message: `Cleaned up ${deleteResult.deletedCount} test orders. ${remainingOrders.length} real orders remaining.`,
      deletedCount: deleteResult.deletedCount,
      remainingCount: remainingOrders.length,
      remainingOrders: remainingOrders.map(order => ({
        orderId: order.orderId,
        userId: order.userId,
        customerName: order.customerName,
        total: order.total
      }))
    });
  } catch (err) {
    console.error('🧹 CLEANUP ERROR:', err);
    res.status(500).json({ success: false, message: 'Cleanup failed', error: err.message });
  }
});

// GET /api/orders/my - Get user's orders
router.get('/my', protect, async (req, res) => {
  try {
    console.log('🔍 USER INFO:', {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name
    });

    // Get only real user orders - simple and direct
    const orders = await Order.find({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    console.log('📦 Retrieved user orders:', orders.length);
    console.log('📦 User ID filter:', req.user.id);

    // Log each order for debugging
    orders.forEach((order, index) => {
      console.log(`📦 Order ${index}:`, {
        orderId: order.orderId,
        userId: order.userId,
        customerName: order.customerName,
        total: order.total,
        status: order.status
      });
    });

    res.json({ success: true, orders });
  } catch (err) {
    console.error('📦 GET USER ORDERS ERROR:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
});

// GET /api/orders - Get all orders (admin)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    console.log('📦 Retrieved all orders:', orders.length);
    res.json({ success: true, orders });
  } catch (err) {
    console.error('📦 GET ALL ORDERS ERROR:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders', error: err.message });
  }
});

// GET /api/orders/:id - Get specific order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    console.log('📦 Retrieved order:', order._id);
    res.json({ success: true, order });
  } catch (err) {
    console.error('📦 GET ORDER ERROR:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch order', error: err.message });
  }
});

// PUT /api/orders/:id/status - Update order status (admin)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    console.log('📦 Updating order status for ID:', orderId);
    console.log('📦 New status:', status);

    // Find order by custom orderId field (not _id)
    const order = await Order.findOne({ orderId: orderId });

    if (!order) {
      console.log('📦 Order not found with ID:', orderId);
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = status;
    order.updatedAt = new Date();

    if ((status.toLowerCase() === 'shipped' || status.toLowerCase() === 'delivered') && !order.stockDeducted) {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          if (item.productId) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
          }
        }
        order.stockDeducted = true;
      }
    } else if (status.toLowerCase() === 'cancelled' && order.stockDeducted) {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          if (item.productId) {
            await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.quantity } });
          }
        }
        order.stockDeducted = false;
      }
    }

    await order.save();

    console.log('📦 Updated order status:', order.orderId, 'to:', order.status);
    res.json({ success: true, order });
  } catch (err) {
    console.error('📦 UPDATE ORDER STATUS ERROR:', err);
    console.error('📦 Error stack:', err.stack);
    res.status(500).json({ success: false, message: 'Failed to update order status', error: err.message });
  }
});

// GET /api/orders/stats - Get order statistics (admin)
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    console.log('📦 Fetching order statistics...');

    // Get total orders count
    const totalOrders = await Order.countDocuments();

    // Get orders by status
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Get recent orders (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOrders = await Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Get total revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get average order value
    const avgOrderResult = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, avgOrderValue: { $avg: '$total' } } }
    ]);
    const avgOrderValue = avgOrderResult.length > 0 ? Math.round(avgOrderResult[0].avgOrderValue) : 0;

    console.log('📦 Order stats calculated:', {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      recentOrders,
      totalRevenue,
      avgOrderValue
    });

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        recentOrders,
        totalRevenue,
        avgOrderValue,
        completionRate: totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0
      }
    });
  } catch (error) {
    console.error('📦 Error fetching order statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order statistics',
      error: error.message
    });
  }
});

module.exports = router;
