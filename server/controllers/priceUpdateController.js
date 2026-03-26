const PriceUpdate = require('../models/PriceUpdate');
const Product = require('../models/Product');
const Notification = require('../models/Notification');

// Get all pending price updates
exports.getPendingUpdates = async (req, res) => {
  try {
    const updates = await PriceUpdate.find({ status: 'PENDING' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: updates.length, updates });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Approve a price update
exports.approveUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await PriceUpdate.findById(id);
    if (!update) return res.status(404).json({ success: false, message: 'Price update not found' });
    if (update.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Price update already processed' });

    // Update Product
    const product = await Product.findById(update.product);
    if (!product) return res.status(404).json({ success: false, message: 'Product no longer exists' });

    product.mrp = update.newMrp;
    product.price = update.newMrp; // Or custom logic if price varies from MRP
    await product.save();

    // Mark as approved
    update.status = 'APPROVED';
    update.resolvedAt = Date.now();
    await update.save();

    // Mark associated notifications as read
    await Notification.updateMany({ referenceId: update._id }, { isRead: true });

    res.status(200).json({ success: true, message: 'Price updated successfully', update });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Reject a price update
exports.rejectUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const update = await PriceUpdate.findById(id);
    if (!update) return res.status(404).json({ success: false, message: 'Price update not found' });
    if (update.status !== 'PENDING') return res.status(400).json({ success: false, message: 'Price update already processed' });

    update.status = 'REJECTED';
    update.resolvedAt = Date.now();
    await update.save();

    // Mark associated notifications as read
    await Notification.updateMany({ referenceId: update._id }, { isRead: true });

    res.status(200).json({ success: true, message: 'Price update rejected successfully', update });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
