const express = require('express');
const Product = require('../models/Product.js');
const productController = require('../controllers/productController.js');
const { protect, adminOnly } = require('../middleware/auth.js');

const router = express.Router();

// Get upload middleware from app
const uploadMiddleware = (req, res, next) => {
  const upload = req.app.get('upload');
  return upload.single('image')(req, res, next);
};

// Public product listing + details
router.get('/', productController.getProducts);
// (for completeness) could add /:id handler here later

// Admin product management
router.post('/', protect, adminOnly, uploadMiddleware, productController.createProduct);
router.put('/:id', protect, adminOnly, uploadMiddleware, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

// GET /api/products/stats - Get product statistics (admin)
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    console.log('🛍️ Fetching product statistics...');
    
    // Get total products count
    const totalProducts = await Product.countDocuments();
    
    // Get products by category
    const categories = await Product.distinct('category');
    const categoryCount = categories.length;
    
    // Get low stock products (less than 10 units)
    const lowStockProducts = await Product.countDocuments({ 
      $or: [
        { stock: { $lt: 10 } },
        { quantity: { $lt: 10 } }
      ]
    });
    
    // Get out of stock products
    const outOfStockProducts = await Product.countDocuments({ 
      $or: [
        { stock: 0 },
        { quantity: 0 }
      ]
    });
    
    // Get total inventory value
    const inventoryValue = await Product.aggregate([
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$price', { $ifNull: ['$stock', '$quantity', 1] }] } } } }
    ]);
    const totalInventoryValue = inventoryValue.length > 0 ? inventoryValue[0].totalValue : 0;
    
    // Get average product price
    const avgPriceResult = await Product.aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]);
    const avgPrice = avgPriceResult.length > 0 ? Math.round(avgPriceResult[0].avgPrice) : 0;
    
    console.log('🛍️ Product stats calculated:', {
      totalProducts,
      categoryCount,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue,
      avgPrice
    });
    
    res.json({
      success: true,
      stats: {
        totalProducts,
        categoryCount,
        lowStockProducts,
        outOfStockProducts,
        totalInventoryValue,
        avgPrice,
        stockHealth: totalProducts > 0 ? Math.round(((totalProducts - lowStockProducts - outOfStockProducts) / totalProducts) * 100) : 0
      }
    });
  } catch (error) {
    console.error('🛍️ Error fetching product statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics',
      error: error.message
    });
  }
});

module.exports = router;
