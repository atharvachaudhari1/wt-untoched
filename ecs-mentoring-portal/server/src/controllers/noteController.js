const MentoringNote = require('../models/MentoringNote');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notificationService');
const { computeHealthScore } = require('../services/healthScoreService');

const list = asyncHandler(async (req, res) => {
  const query = req.user.role === 'teacher' ? { mentor: req.user._id } : {};
  const notes = await MentoringNote.find(query)
    .populate('student', 'name rollNumber').populate('mentor', 'name').populate('session', 'title date').sort({ createdAt: -1 });
  res.json({ notes });
});

const getById = asyncHandler(async (req, res) => {
  const note = await MentoringNote.findById(req.params.id)
    .populate('student', 'name rollNumber').populate('mentor', 'name').populate('session', 'title date');
  if (!note) throw new ApiError(404, 'Note not found');
  res.json({ note });
});

const create = asyncHandler(async (req, res) => {
  const note = await MentoringNote.create({ ...req.body, mentor: req.user._id });
  await ActivityLog.create({
    actor: req.user._id, action: 'note_added', entityType: 'note', entityId: note._id,
    description: `${req.user.name} added a ${note.category} note`,
  });
  createNotification({ recipient: note.student, type: 'note_added', title: 'New Mentoring Note', message: `Your mentor added a new ${note.category} note`, link: '/student/notes', relatedEntity: note._id }).catch(console.error);
  computeHealthScore(note.student).catch(console.error);
  const populated = await MentoringNote.findById(note._id).populate('student', 'name rollNumber').populate('mentor', 'name');
  res.status(201).json({ note: populated });
});

const update = asyncHandler(async (req, res) => {
  const note = await MentoringNote.findById(req.params.id);
  if (!note) throw new ApiError(404, 'Note not found');
  if (req.user.role === 'teacher' && !note.mentor.equals(req.user._id)) throw new ApiError(403, 'Not authorized');
  Object.assign(note, req.body);
  await note.save();
  const populated = await MentoringNote.findById(note._id).populate('student', 'name rollNumber').populate('mentor', 'name');
  res.json({ note: populated });
});

const remove = asyncHandler(async (req, res) => {
  const note = await MentoringNote.findById(req.params.id);
  if (!note) throw new ApiError(404, 'Note not found');
  if (req.user.role === 'teacher' && !note.mentor.equals(req.user._id)) throw new ApiError(403, 'Not authorized');
  await MentoringNote.findByIdAndDelete(req.params.id);
  res.json({ message: 'Note deleted' });
});

module.exports = { list, getById, create, update, remove };
