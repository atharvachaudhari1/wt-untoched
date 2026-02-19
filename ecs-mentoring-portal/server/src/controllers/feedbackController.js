const Feedback = require('../models/Feedback');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { computeHealthScore } = require('../services/healthScoreService');

const create = asyncHandler(async (req, res) => {
  const existing = await Feedback.findOne({ session: req.body.session, student: req.user._id });
  if (existing) throw new ApiError(409, 'Feedback already submitted for this session');
  const feedback = await Feedback.create({ ...req.body, student: req.user._id });
  computeHealthScore(req.user._id).catch(console.error);
  res.status(201).json({ feedback });
});

const getForSession = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ session: req.params.sessionId }).populate('student', 'name rollNumber');
  res.json({ feedback });
});

const getForStudent = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ student: req.params.studentId }).populate('session', 'title date');
  res.json({ feedback });
});

module.exports = { create, getForSession, getForStudent };
