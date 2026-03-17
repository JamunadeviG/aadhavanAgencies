const Offer = require('../models/Offer');
const Product = require('../models/Product');

// Get all offers
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({})
      .populate('applicableProducts', 'name unit')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      offers: offers
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offers',
      error: error.message
    });
  }
};

// Get offer by ID
const getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate('applicableProducts', 'name unit');
    
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }
    
    res.json({
      success: true,
      offer: offer
    });
  } catch (error) {
    console.error('Error fetching offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offer',
      error: error.message
    });
  }
};

// Create new offer
const createOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      discount,
      discountType,
      startDate,
      endDate,
      applicableProducts,
      minOrderAmount,
      maxDiscountAmount,
      isActive,
      usageLimit,
      couponCode
    } = req.body;

    // Validate required fields
    if (!title || !description || discount === undefined || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, discount, start date, and end date are required'
      });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Check if coupon code already exists (if provided)
    if (couponCode) {
      const existingOffer = await Offer.findOne({ couponCode: couponCode.toUpperCase() });
      if (existingOffer) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
    }

    // Validate applicable products if provided
    if (applicableProducts && applicableProducts.length > 0) {
      const products = await Product.find({ _id: { $in: applicableProducts } });
      if (products.length !== applicableProducts.length) {
        return res.status(400).json({
          success: false,
          message: 'Some specified products do not exist'
        });
      }
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const offer = new Offer({
      title,
      description,
      discount,
      discountType: discountType || 'percentage',
      startDate: start,
      endDate: end,
      applicableProducts: applicableProducts ? (typeof applicableProducts === 'string' ? applicableProducts.split(',') : applicableProducts) : [],
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      isActive: isActive !== undefined ? isActive === 'true' || isActive === true : true,
      usageLimit: usageLimit || null,
      couponCode: couponCode ? couponCode.toUpperCase() : null,
      image: imageUrl
    });

    const savedOffer = await offer.save();
    
    // Populate applicable products for response
    await savedOffer.populate('applicableProducts', 'name unit');

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      offer: savedOffer
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating offer',
      error: error.message
    });
  }
};

// Update offer
const updateOffer = async (req, res) => {
  try {
    const {
      title,
      description,
      discount,
      discountType,
      startDate,
      endDate,
      applicableProducts,
      minOrderAmount,
      maxDiscountAmount,
      isActive,
      usageLimit,
      couponCode
    } = req.body;

    const offerId = req.params.id;

    // Check if offer exists
    const existingOffer = await Offer.findById(offerId);
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    }

    // Check if coupon code already exists (if provided and different from current)
    if (couponCode && couponCode !== existingOffer.couponCode) {
      const existingCoupon = await Offer.findOne({ 
        couponCode: couponCode.toUpperCase(),
        _id: { $ne: offerId }
      });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
    }

    // Validate applicable products if provided
    if (applicableProducts && applicableProducts.length > 0) {
      const products = await Product.find({ _id: { $in: applicableProducts } });
      if (products.length !== applicableProducts.length) {
        return res.status(400).json({
          success: false,
          message: 'Some specified products do not exist'
        });
      }
    }

    // Update offer fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (discount !== undefined) updateData.discount = discount;
    if (discountType !== undefined) updateData.discountType = discountType;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (applicableProducts !== undefined) updateData.applicableProducts = (typeof applicableProducts === 'string' ? applicableProducts.split(',') : applicableProducts);
    if (minOrderAmount !== undefined) updateData.minOrderAmount = minOrderAmount;
    if (maxDiscountAmount !== undefined) updateData.maxDiscountAmount = maxDiscountAmount;
    if (isActive !== undefined) updateData.isActive = isActive === 'true' || isActive === true;
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit;
    if (couponCode !== undefined) updateData.couponCode = couponCode ? couponCode.toUpperCase() : null;

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
      offerId,
      updateData,
      { new: true, runValidators: true }
    ).populate('applicableProducts', 'name unit');

    res.json({
      success: true,
      message: 'Offer updated successfully',
      offer: updatedOffer
    });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating offer',
      error: error.message
    });
  }
};

// Delete offer
const deleteOffer = async (req, res) => {
  try {
    const offerId = req.params.id;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    await Offer.findByIdAndDelete(offerId);

    res.json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting offer',
      error: error.message
    });
  }
};

// Get active offers for customers
const getActiveOffers = async (req, res) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    })
    .populate('applicableProducts', 'name unit')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      offers: offers
    });
  } catch (error) {
    console.error('Error fetching active offers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active offers',
      error: error.message
    });
  }
};

// Generate coupon code for offer
const generateCouponCode = async (req, res) => {
  try {
    const offerId = req.params.id;
    
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    let couponCode;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      couponCode = offer.generateCouponCode();
      
      const existingOffer = await Offer.findOne({ couponCode: couponCode });
      if (!existingOffer) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Unable to generate unique coupon code'
      });
    }

    offer.couponCode = couponCode;
    await offer.save();

    res.json({
      success: true,
      message: 'Coupon code generated successfully',
      couponCode: couponCode
    });
  } catch (error) {
    console.error('Error generating coupon code:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating coupon code',
      error: error.message
    });
  }
};

module.exports = {
  getOffers,
  getOfferById,
  createOffer,
  updateOffer,
  deleteOffer,
  getActiveOffers,
  generateCouponCode
};
