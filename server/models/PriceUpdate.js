const mongoose = require('mongoose');

const priceUpdateSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  oldMrp: { type: Number, required: true },
  newMrp: { type: Number, required: true },
  sourceType: { type: String }, // API or SCRAPE
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  detectedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('PriceUpdate', priceUpdateSchema);
