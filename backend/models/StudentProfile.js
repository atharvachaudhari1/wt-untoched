/**
 * Student profile - roll number, department, assigned mentor, etc.
 */
const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    rollNo: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: Number,
      min: 1,
      max: 5,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeacherProfile',
      default: null,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ParentProfile',
      default: null,
    },
    // Cached for quick dashboard; updated when mentor is assigned
    mentoringHealthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  { timestamps: true }
);

studentProfileSchema.index({ rollNo: 1, department: 1 }, { unique: true });
studentProfileSchema.index({ mentor: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
