/**
 * One notepad per student. Editable by teacher (assigned only) and counselor (all).
 * Student can only view their own.
 */
const mongoose = require('mongoose');

const studentNotepadSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
      unique: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

studentNotepadSchema.index({ student: 1 }, { unique: true });

module.exports = mongoose.model('StudentNotepad', studentNotepadSchema);
