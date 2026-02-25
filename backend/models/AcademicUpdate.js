/**
 * Academic college updates - published by admin; visible to parents and teachers.
 * Supports message and optional file attachment.
 */
const mongoose = require('mongoose');

const academicUpdateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      default: '',
    },
    filePath: {
      type: String,
      trim: true,
      default: null,
    },
    fileName: {
      type: String,
      trim: true,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

academicUpdateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AcademicUpdate', academicUpdateSchema);
