/**
 * Course/subject-wise attendance (e.g. MNM - Mathematics and Numerical Methods).
 * One record per student per course.
 */
const mongoose = require('mongoose');

const courseAttendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    courseCode: {
      type: String,
      required: true,
      trim: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    totalLectures: {
      type: Number,
      required: true,
      min: 0,
    },
    attended: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

courseAttendanceSchema.index({ student: 1, courseCode: 1 }, { unique: true });
courseAttendanceSchema.index({ courseCode: 1 });

module.exports = mongoose.model('CourseAttendance', courseAttendanceSchema);
