/**
 * Teacher profile - department, designation, assigned students.
 */
const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    assignedStudents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
    }],
  },
  { timestamps: true }
);

teacherProfileSchema.index({ department: 1 });

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);
