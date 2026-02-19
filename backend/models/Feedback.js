/**
 * Feedback - quick feedback or session feedback from students.
 */
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null,
    },
    type: {
      type: String,
      enum: ['quick', 'session', 'general'],
      default: 'quick',
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      default: null,
    },
    // Optional: for department/mentor analytics
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherProfile',
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ fromUser: 1, createdAt: -1 });
feedbackSchema.index({ session: 1 });
feedbackSchema.index({ mentor: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
