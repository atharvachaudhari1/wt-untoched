/**
 * Announcements - by admin/teacher; target by role or specific IDs.
 */
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Target: 'all' | 'students' | 'teachers' | 'parents' | 'department'
    targetType: {
      type: String,
      enum: ['all', 'students', 'teachers', 'parents', 'department'],
      default: 'all',
    },
    targetDepartment: {
      type: String,
      trim: true,
      default: null,
    },
    targetStudentIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
    }],
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ targetType: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
