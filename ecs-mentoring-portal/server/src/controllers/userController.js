const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const Admin = require('../models/Admin');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role) query.role = role;
  if (search) query.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
    User.countDocuments(query),
  ]);
  res.json({ users, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
});

const getById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user });
});

const create = asyncHandler(async (req, res) => {
  const { role, ...userData } = req.body;
  let user;
  if (role === 'student') user = await Student.create({ ...userData, role });
  else if (role === 'teacher') user = await Teacher.create({ ...userData, role });
  else if (role === 'parent') user = await Parent.create({ ...userData, role });
  else if (role === 'admin') user = await Admin.create({ ...userData, role });
  else throw new ApiError(400, 'Invalid role');

  await ActivityLog.create({
    actor: req.user._id, action: 'user_created', entityType: 'user', entityId: user._id,
    description: `${req.user.name} created ${role} account for ${user.name}`,
  });
  res.status(201).json({ user });
});

const update = asyncHandler(async (req, res) => {
  const { password, role, ...updateData } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user });
});

const softDelete = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ message: 'User deactivated', user });
});

const toggleActive = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.isActive = !user.isActive;
  await user.save({ validateBeforeSave: false });
  res.json({ user });
});

module.exports = { list, getById, create, update, softDelete, toggleActive };
