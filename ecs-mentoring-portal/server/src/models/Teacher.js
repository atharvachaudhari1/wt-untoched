const mongoose = require('mongoose');
const User = require('./User');

const teacherSchema = new mongoose.Schema({
  employeeId:       { type: String, required: true, unique: true },
  designation:      { type: String, default: 'Assistant Professor' },
  specialization:   { type: String, default: '' },
  assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxStudents:      { type: Number, default: 20 },
});

const Teacher = User.discriminator('teacher', teacherSchema);
module.exports = Teacher;
