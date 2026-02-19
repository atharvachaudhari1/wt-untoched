const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:          {
    type: String,
    enum: ['session_reminder', 'session_live', 'attendance_marked', 'note_added',
           'announcement', 'feedback_request', 'health_score_change', 'general'],
    default: 'general',
  },
  title:         { type: String, required: true },
  message:       { type: String, required: true },
  isRead:        { type: Boolean, default: false },
  link:          { type: String, default: '' },
  relatedEntity: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
