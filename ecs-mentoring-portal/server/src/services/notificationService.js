const Notification = require('../models/Notification');

const createNotification = async ({ recipient, type, title, message, link, relatedEntity }) => {
  return Notification.create({ recipient, type: type || 'general', title, message, link: link || '', relatedEntity });
};

const createBulkNotifications = async (recipients, { type, title, message, link, relatedEntity }) => {
  if (!recipients || recipients.length === 0) return [];
  const notifications = recipients.map(recipientId => ({
    recipient: recipientId,
    type: type || 'general',
    title, message,
    link: link || '',
    relatedEntity,
  }));
  return Notification.insertMany(notifications);
};

module.exports = { createNotification, createBulkNotifications };
