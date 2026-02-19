const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  session:  { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  student:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:   { type: String, enum: ['present', 'absent', 'late', 'excused'], default: 'absent' },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks:  { type: String, default: '' },
  markedAt: { type: Date, default: Date.now },
}, { timestamps: true });

attendanceSchema.index({ session: 1, student: 1 }, { unique: true });
attendanceSchema.index({ student: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
