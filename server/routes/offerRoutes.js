const express = require('express');
const router = express.Router();
const {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  getActiveOffers,
  generateCouponCode
} = require('../controllers/offerController');

const { protect, adminOnly } = require('../middleware/auth.js');

// Get upload middleware from app
const uploadMiddleware = (req, res, next) => {
  const upload = req.app.get('upload');
  return upload.single('image')(req, res, next);
};

// GET all offers (admin)
router.get('/', getOffers);

// GET active offers (public/customer)
router.get('/active', getActiveOffers);

// GET offer by ID
router.get('/:id', getOfferById);

// POST create new offer
router.post('/', protect, adminOnly, uploadMiddleware, createOffer);

// PUT update offer
router.put('/:id', protect, adminOnly, uploadMiddleware, updateOffer);

// DELETE offer
router.delete('/:id', protect, adminOnly, deleteOffer);

// POST generate coupon code for offer
router.post('/:id/generate-coupon', generateCouponCode);

module.exports = router;
