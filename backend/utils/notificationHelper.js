/**
 * Smart notification helper - create in-app notifications.
 */
const { Notification } = require('../models');

const createNotification = async (payload) => {
  const { userId, title, body, type = 'general', relatedId = null, relatedModel = null } = payload;
  if (!userId || !title) return null;
  try {
    const notif = await Notification.create({
      user: userId,
      title,
      body: body || '',
      type,
      relatedId,
      relatedModel,
    });
    return notif;
  } catch (err) {
    console.error('createNotification error:', err);
    return null;
  }
};

const createBulkForUserIds = async (userIds, payload) => {
  const { title, body, type = 'general', relatedId = null, relatedModel = null } = payload;
  if (!userIds?.length || !title) return;
  try {
    await Notification.insertMany(
      userIds.map((user) => ({
        user,
        title,
        body: body || '',
        type,
        relatedId,
        relatedModel,
      }))
    );
  } catch (err) {
    console.error('createBulkForUserIds error:', err);
  }
};

module.exports = { createNotification, createBulkForUserIds };
