const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  actor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action:     { type: String, required: true },
  entityType: { type: String, enum: ['session', 'attendance', 'note', 'announcement', 'user', 'feedback'] },
  entityId:   { type: mongoose.Schema.Types.ObjectId },
  description:{ type: String, required: true },
  metadata:   { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
