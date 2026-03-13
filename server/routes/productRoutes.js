const express = require('express');
const Product = require('../models/Product.js');
const productController = require('../controllers/productController.js');
const { protect, adminOnly } = require('../middleware/auth.js');

const router = express.Router();

// Public product listing + details
router.get('/', productController.getProducts);
// (for completeness) could add /:id handler here later

// Admin product management
router.post('/', protect, adminOnly, productController.createProduct);
router.put('/:id', protect, adminOnly, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

module.exports = router;
