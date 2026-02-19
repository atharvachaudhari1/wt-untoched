const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const teachers = await User.find({ role: 'teacher' }).sort({ name: 1 });
  res.json({ teachers });
});

const getById = asyncHandler(async (req, res) => {
  const teacher = await User.findById(req.params.id);
  if (!teacher || teacher.role !== 'teacher') throw new ApiError(404, 'Teacher not found');
  res.json({ teacher });
});

const getStudents = asyncHandler(async (req, res) => {
  const teacher = await User.findById(req.params.id).populate({
    path: 'assignedStudents',
    select: 'name email rollNumber semester section healthScore academicInfo',
  });
  if (!teacher || teacher.role !== 'teacher') throw new ApiError(404, 'Teacher not found');
  res.json({ students: teacher.assignedStudents || [] });
});

const assignStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  const teacher = await User.findById(req.params.id);
  if (!teacher || teacher.role !== 'teacher') throw new ApiError(404, 'Teacher not found');
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') throw new ApiError(404, 'Student not found');

  // Remove from old mentor
  if (student.mentor && student.mentor.toString() !== req.params.id) {
    await User.findByIdAndUpdate(student.mentor, { $pull: { assignedStudents: studentId } });
  }

  if (!teacher.assignedStudents.map(id => id.toString()).includes(studentId)) {
    teacher.assignedStudents.push(studentId);
    await teacher.save({ validateBeforeSave: false });
  }

  student.mentor = teacher._id;
  await student.save({ validateBeforeSave: false });

  await ActivityLog.create({
    actor: req.user._id, action: 'mentor_assigned', entityType: 'user', entityId: student._id,
    description: `${student.name} assigned to mentor ${teacher.name}`,
  });
  res.json({ message: 'Student assigned successfully' });
});

const unassignStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  await User.findByIdAndUpdate(req.params.id, { $pull: { assignedStudents: studentId } });
  await User.findByIdAndUpdate(studentId, { mentor: null });
  res.json({ message: 'Student unassigned successfully' });
});

module.exports = { list, getById, getStudents, assignStudent, unassignStudent };
