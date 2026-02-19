/**
 * Smart Notification system - list and mark read.
 */
const { Notification } = require('../models');

/**
 * GET /api/notifications - list for current user.
 */
exports.list = async (req, res, next) => {
  try {
    const { unreadOnly, limit = 30 } = req.query;
    const query = { user: req.user.id };
    if (unreadOnly === 'true') query.read = false;
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/:id/read - mark one as read.
 */
exports.markRead = async (req, res, next) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true, readAt: new Date() },
      { new: true }
    );
    if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });
    res.json({ success: true, notification: notif });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all - mark all as read for current user.
 */
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true, readAt: new Date() });
    res.json({ success: true, message: 'All marked as read.' });
  } catch (err) {
    next(err);
  }
};
