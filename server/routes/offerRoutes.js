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

// GET all offers (admin)
router.get('/', getOffers);

// GET active offers (public/customer)
router.get('/active', getActiveOffers);

// GET offer by ID
router.get('/:id', getOfferById);

// POST create new offer
router.post('/', createOffer);

// PUT update offer
router.put('/:id', updateOffer);

// DELETE offer
router.delete('/:id', deleteOffer);

// POST generate coupon code for offer
router.post('/:id/generate-coupon', generateCouponCode);

module.exports = router;
