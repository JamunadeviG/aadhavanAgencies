const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: String,
    trim: true
  }],
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    unique: true,
    sparse: true,
    uppercase: true,
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
offerSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if offer is currently active
offerSchema.methods.isActiveNow = function () {
  const now = new Date();
  return this.isActive &&
    this.startDate <= now &&
    this.endDate >= now &&
    (this.usageLimit === null || this.usedCount < this.usageLimit);
};

// Method to calculate discount amount
offerSchema.methods.calculateDiscount = function (orderAmount) {
  if (!this.isActiveNow()) return 0;

  if (this.minOrderAmount > 0 && orderAmount < this.minOrderAmount) return 0;

  let discountAmount = 0;

  if (this.discountType === 'percentage') {
    discountAmount = orderAmount * (this.discount / 100);
  } else {
    discountAmount = this.discount;
  }

  // Apply maximum discount limit if set
  if (this.maxDiscountAmount && discountAmount > this.maxDiscountAmount) {
    discountAmount = this.maxDiscountAmount;
  }

  return discountAmount;
};

// Method to generate coupon code
offerSchema.methods.generateCouponCode = function () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
