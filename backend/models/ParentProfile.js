/**
 * Parent profile - links to one or more students (e.g. siblings).
 */
const mongoose = require('mongoose');

const parentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    linkedStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ParentProfile', parentProfileSchema);
