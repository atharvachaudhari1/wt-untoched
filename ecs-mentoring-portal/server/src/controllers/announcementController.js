const Announcement = require('../models/Announcement');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  let query = { isActive: true };
  if (req.user.role !== 'admin') {
    query = {
      isActive: true,
      $or: [
        { scope: 'department', targetRoles: req.user.role },
        { scope: 'mentor_group' },
        { scope: 'specific', targetStudents: req.user._id },
      ],
    };
  }
  const announcements = await Announcement.find(query).populate('author', 'name role').sort({ createdAt: -1 });
  res.json({ announcements });
});

const getById = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id).populate('author', 'name role');
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  res.json({ announcement });
});

const create = asyncHandler(async (req, res) => {
  const announcement = await Announcement.create({ ...req.body, author: req.user._id });
  await ActivityLog.create({
    actor: req.user._id, action: 'announcement_created', entityType: 'announcement', entityId: announcement._id,
    description: `${req.user.name} posted announcement "${announcement.title}"`,
  });
  const populated = await Announcement.findById(announcement._id).populate('author', 'name role');
  res.status(201).json({ announcement: populated });
});

const update = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  if (req.user.role !== 'admin' && !announcement.author.equals(req.user._id)) throw new ApiError(403, 'Not authorized');
  Object.assign(announcement, req.body);
  await announcement.save();
  const populated = await Announcement.findById(announcement._id).populate('author', 'name role');
  res.json({ announcement: populated });
});

const remove = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  if (req.user.role !== 'admin' && !announcement.author.equals(req.user._id)) throw new ApiError(403, 'Not authorized');
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ message: 'Announcement deleted' });
});

module.exports = { list, getById, create, update, remove };
