const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  session:     { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  student:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating:      { type: Number, required: true, min: 1, max: 5 },
  comment:     { type: String, default: '' },
  isAnonymous: { type: Boolean, default: false },
}, { timestamps: true });

feedbackSchema.index({ session: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
