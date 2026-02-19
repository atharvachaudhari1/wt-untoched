const Session = require('../models/Session');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createBulkNotifications } = require('../services/notificationService');

const list = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (req.user.role === 'teacher') query.mentor = req.user._id;
  else if (req.user.role === 'student') query.targetStudents = req.user._id;
  else if (req.user.role === 'parent') {
    const parent = await User.findById(req.user._id);
    query.targetStudents = { $in: parent.children || [] };
  }
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [sessions, total] = await Promise.all([
    Session.find(query).populate('mentor', 'name email').skip(skip).limit(parseInt(limit)).sort({ date: -1 }),
    Session.countDocuments(query),
  ]);
  res.json({ sessions, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
});

const getById = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id)
    .populate('mentor', 'name email designation').populate('targetStudents', 'name rollNumber');
  if (!session) throw new ApiError(404, 'Session not found');
  res.json({ session });
});

const create = asyncHandler(async (req, res) => {
  const mentorId = req.user.role === 'teacher' ? req.user._id : req.body.mentor;
  const session = await Session.create({ ...req.body, mentor: mentorId });
  await ActivityLog.create({
    actor: req.user._id, action: 'session_created', entityType: 'session', entityId: session._id,
    description: `${req.user.name} created session "${session.title}"`,
  });
  if (session.targetStudents && session.targetStudents.length > 0) {
    await createBulkNotifications(session.targetStudents, {
      type: 'session_reminder', title: 'New Mentoring Session',
      message: `A new session "${session.title}" has been scheduled for ${new Date(session.date).toLocaleDateString()}`,
      link: '/student/sessions', relatedEntity: session._id,
    });
  }
  res.status(201).json({ session });
});

const update = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Session not found');
  if (req.user.role === 'teacher' && !session.mentor.equals(req.user._id)) throw new ApiError(403, 'Not authorized');
  const { mentor, ...updateData } = req.body;
  Object.assign(session, updateData);
  await session.save();
  res.json({ session });
});

const remove = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Session not found');
  if (req.user.role === 'teacher' && !session.mentor.equals(req.user._id)) throw new ApiError(403, 'Not authorized');
  await Session.findByIdAndDelete(req.params.id);
  res.json({ message: 'Session deleted' });
});

const updateMeetLink = asyncHandler(async (req, res) => {
  const { meetLink } = req.body;
  const session = await Session.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Session not found');
  if (!session.mentor.equals(req.user._id)) throw new ApiError(403, 'Not authorized');
  session.meetLink = meetLink;
  await session.save();
  res.json({ session });
});

const goLive = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Session not found');
  if (!session.mentor.equals(req.user._id)) throw new ApiError(403, 'Not authorized');
  session.isLive = true;
  session.status = 'in_progress';
  await session.save();
  await ActivityLog.create({
    actor: req.user._id, action: 'session_live', entityType: 'session', entityId: session._id,
    description: `${req.user.name} started live session "${session.title}"`,
  });
  if (session.targetStudents && session.targetStudents.length > 0) {
    await createBulkNotifications(session.targetStudents, {
      type: 'session_live', title: '🔴 Session is LIVE!',
      message: `"${session.title}" is now live. Join now!`,
      link: '/student/sessions', relatedEntity: session._id,
    });
  }
  res.json({ session });
});

const endLive = asyncHandler(async (req, res) => {
  const session = await Session.findById(req.params.id);
  if (!session) throw new ApiError(404, 'Session not found');
  if (!session.mentor.equals(req.user._id)) throw new ApiError(403, 'Not authorized');
  session.isLive = false;
  session.status = 'completed';
  await session.save();
  res.json({ session });
});

const getUpcoming = asyncHandler(async (req, res) => {
  const now = new Date();
  const nextWeek = new Date(); nextWeek.setDate(nextWeek.getDate() + 7);
  const query = { date: { $gte: now, $lte: nextWeek }, status: { $in: ['scheduled', 'in_progress'] } };
  if (req.user.role === 'teacher') query.mentor = req.user._id;
  else if (req.user.role === 'student') query.targetStudents = req.user._id;
  else if (req.user.role === 'parent') {
    const parent = await User.findById(req.user._id);
    query.targetStudents = { $in: parent.children || [] };
  }
  const sessions = await Session.find(query).populate('mentor', 'name email').sort({ date: 1 });
  res.json({ sessions });
});

const getLive = asyncHandler(async (req, res) => {
  const query = { isLive: true };
  if (req.user.role === 'teacher') query.mentor = req.user._id;
  else if (req.user.role === 'student') query.targetStudents = req.user._id;
  else if (req.user.role === 'parent') {
    const parent = await User.findById(req.user._id);
    query.targetStudents = { $in: parent.children || [] };
  }
  const sessions = await Session.find(query).populate('mentor', 'name email');
  res.json({ sessions });
});

module.exports = { list, getById, create, update, remove, updateMeetLink, goLive, endLive, getUpcoming, getLive };
