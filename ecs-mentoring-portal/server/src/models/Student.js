const mongoose = require('mongoose');
const User = require('./User');

const studentSchema = new mongoose.Schema({
  rollNumber:   { type: String, required: true, unique: true },
  semester:     { type: Number, required: true, min: 1, max: 8 },
  section:      { type: String, enum: ['A', 'B', 'C', 'D'], default: 'A' },
  batch:        { type: String, default: '' },
  mentor:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  parentId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  healthScore:  { type: Number, default: 50, min: 0, max: 100 },
  academicInfo: {
    cgpa:     { type: Number, default: 0 },
    backlogs: { type: Number, default: 0 },
  },
});

const Student = User.discriminator('student', studentSchema);
module.exports = Student;
