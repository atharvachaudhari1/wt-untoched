const User = require('../models/User');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const MentoringNote = require('../models/MentoringNote');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { computeHealthScore } = require('../services/healthScoreService');

const list = asyncHandler(async (req, res) => {
  const { search, semester, section, page = 1, limit = 20 } = req.query;
  const query = { role: 'student' };
  if (req.user.role === 'teacher') query._id = { $in: req.user.assignedStudents || [] };
  if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { rollNumber: { $regex: search, $options: 'i' } }];
  if (semester) query.semester = parseInt(semester);
  if (section) query.section = section;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [students, total] = await Promise.all([
    User.find(query).populate('mentor', 'name email').skip(skip).limit(parseInt(limit)).sort({ rollNumber: 1 }),
    User.countDocuments(query),
  ]);
  res.json({ students, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
});

const getById = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id).populate('mentor', 'name email designation specialization phone');
  if (!student || student.role !== 'student') throw new ApiError(404, 'Student not found');
  if (req.user.role === 'student' && req.user._id.toString() !== req.params.id) throw new ApiError(403, 'Access denied');
  res.json({ student });
});

const getMentor = asyncHandler(async (req, res) => {
  const student = await User.findById(req.params.id).populate('mentor', 'name email designation specialization phone employeeId');
  if (!student || student.role !== 'student') throw new ApiError(404, 'Student not found');
  if (!student.mentor) throw new ApiError(404, 'No mentor assigned');
  res.json({ mentor: student.mentor });
});

const getSessions = asyncHandler(async (req, res) => {
  const sessions = await Session.find({ targetStudents: req.params.id }).populate('mentor', 'name').sort({ date: -1 });
  res.json({ sessions });
});

const getAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({ student: req.params.id })
    .populate('session', 'title date startTime endTime').sort({ createdAt: -1 });
  res.json({ attendance });
});

const getNotes = asyncHandler(async (req, res) => {
  const query = { student: req.params.id };
  if (req.user.role === 'parent') query.isConfidential = false;
  const notes = await MentoringNote.find(query)
    .populate('mentor', 'name').populate('session', 'title date').sort({ createdAt: -1 });
  res.json({ notes });
});

const getHealthScore = asyncHandler(async (req, res) => {
  const score = await computeHealthScore(req.params.id);
  if (score === null) throw new ApiError(404, 'Student not found');
  res.json({ healthScore: score });
});

const search = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) throw new ApiError(400, 'Search query required');
  const query = { role: 'student', $or: [{ name: { $regex: q, $options: 'i' } }, { rollNumber: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] };
  if (req.user.role === 'teacher') query._id = { $in: req.user.assignedStudents || [] };
  const students = await User.find(query).limit(10).select('name rollNumber email semester section healthScore');
  res.json({ students });
});

module.exports = { list, getById, getMentor, getSessions, getAttendance, getNotes, getHealthScore, search };
