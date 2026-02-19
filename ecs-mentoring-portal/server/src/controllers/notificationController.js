const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  res.json({ notifications });
});

const unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.user._id, isRead: false });
  res.json({ count });
});

const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { isRead: true });
  res.json({ message: 'Marked as read' });
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'All notifications marked as read' });
});

module.exports = { list, unreadCount, markRead, markAllRead };
