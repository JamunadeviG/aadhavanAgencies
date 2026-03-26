const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['PRICE_UPDATE', 'GENERAL'], default: 'GENERAL' },
  referenceId: { type: mongoose.Schema.Types.ObjectId }, // Generic reference ID, could be to PriceUpdate
  isRead: { type: Boolean, default: false },
  forRoles: [{ type: String, enum: ['admin', 'user'], default: ['admin'] }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // optional, if for a specific user
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
