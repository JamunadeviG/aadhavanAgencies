const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, notificationController.getAdminNotifications);
router.put('/:id/read', protect, adminOnly, notificationController.markAsRead);
router.put('/read-all', protect, adminOnly, notificationController.markAllAsRead);

module.exports = router;
