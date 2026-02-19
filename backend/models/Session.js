/**
 * Mentoring session - created by teacher, has Meet link and live status.
 */
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherProfile',
      required: true,
    },
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
    }],
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 30,
      min: 5,
      max: 120,
    },
    meetLink: {
      type: String,
      trim: true,
      default: null,
    },
    liveSessionStatus: {
      type: String,
      enum: ['scheduled', 'live', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    mentoringNotes: {
      type: String,
      trim: true,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

sessionSchema.index({ teacher: 1, scheduledAt: 1 });
sessionSchema.index({ students: 1, scheduledAt: 1 });
sessionSchema.index({ scheduledAt: 1, status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
