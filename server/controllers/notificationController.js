const Notification = require('../models/Notification');

// Get all notifications for admin
exports.getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ forRoles: 'admin' })
      .sort({ createdAt: -1 })
      .limit(50); // Get recent 50
    // Get unread count
    const unreadCount = await Notification.countDocuments({ forRoles: 'admin', isRead: false });

    res.status(200).json({ success: true, unreadCount, count: notifications.length, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, message: 'Marked as read', notification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ forRoles: 'admin', isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
