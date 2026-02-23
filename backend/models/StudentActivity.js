/**
 * Student activity request (hackathon, workshop, etc.) on college days.
 * Admin must approve before it counts for attendance.
 */
const mongoose = require('mongoose');

const studentActivitySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    type: {
      type: String,
      enum: ['hackathon', 'workshop', 'event', 'other'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedReason: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

studentActivitySchema.index({ student: 1, createdAt: -1 });
studentActivitySchema.index({ status: 1 });
studentActivitySchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('StudentActivity', studentActivitySchema);
