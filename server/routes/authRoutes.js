const express = require('express');
const authController = require('../controllers/authController.js');
const { protect } = require('../middleware/auth.js');

const router = express.Router();

// Public routes - no authentication required
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', protect, authController.getProfile);

module.exports = router;
