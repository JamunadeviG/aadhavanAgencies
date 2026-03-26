const express = require('express');
const router = express.Router();
const priceUpdateController = require('../controllers/priceUpdateController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, priceUpdateController.getPendingUpdates);
router.post('/:id/approve', protect, adminOnly, priceUpdateController.approveUpdate);
router.post('/:id/reject', protect, adminOnly, priceUpdateController.rejectUpdate);

module.exports = router;
