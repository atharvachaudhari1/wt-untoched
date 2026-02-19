const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  content:        { type: String, required: true },
  author:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scope:          { type: String, enum: ['department', 'mentor_group', 'specific'], default: 'department' },
  targetRoles:    [{ type: String, enum: ['student', 'teacher', 'parent', 'admin'] }],
  targetStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  priority:       { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  isActive:       { type: Boolean, default: true },
  expiresAt:      { type: Date, default: null },
}, { timestamps: true });

announcementSchema.index({ scope: 1, isActive: 1 });

module.exports = mongoose.model('Announcement', announcementSchema);
