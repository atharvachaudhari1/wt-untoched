const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title:          { type: String, required: true, trim: true },
  description:    { type: String, default: '' },
  mentor:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:           { type: Date, required: true },
  startTime:      { type: String, required: true },
  endTime:        { type: String, required: true },
  meetLink:       { type: String, default: '' },
  isLive:         { type: Boolean, default: false },
  type:           { type: String, enum: ['individual', 'group'], default: 'group' },
  targetStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:         { type: String, enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' },
  semester:       { type: Number },
  section:        { type: String },
}, { timestamps: true });

sessionSchema.index({ mentor: 1, date: 1 });
sessionSchema.index({ status: 1 });
sessionSchema.index({ date: 1 });

module.exports = mongoose.model('Session', sessionSchema);
