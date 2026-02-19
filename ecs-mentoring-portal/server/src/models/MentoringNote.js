const mongoose = require('mongoose');

const mentoringNoteSchema = new mongoose.Schema({
  student:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentor:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  session:        { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null },
  category:       { type: String, enum: ['academic', 'behavioral', 'personal', 'career', 'general'], default: 'general' },
  content:        { type: String, required: true },
  isConfidential: { type: Boolean, default: false },
  severity:       { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
}, { timestamps: true });

mentoringNoteSchema.index({ student: 1, mentor: 1 });

module.exports = mongoose.model('MentoringNote', mentoringNoteSchema);
