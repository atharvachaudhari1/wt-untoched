const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getById = asyncHandler(async (req, res) => {
  const parent = await User.findById(req.params.id);
  if (!parent || parent.role !== 'parent') throw new ApiError(404, 'Parent not found');
  if (req.user.role === 'parent' && req.user._id.toString() !== req.params.id) throw new ApiError(403, 'Access denied');
  res.json({ parent });
});

const getChildren = asyncHandler(async (req, res) => {
  const parent = await User.findById(req.params.id).populate({
    path: 'children',
    select: 'name email rollNumber semester section healthScore academicInfo mentor',
    populate: { path: 'mentor', select: 'name email designation phone' },
  });
  if (!parent || parent.role !== 'parent') throw new ApiError(404, 'Parent not found');
  if (req.user.role === 'parent' && req.user._id.toString() !== req.params.id) throw new ApiError(403, 'Access denied');
  res.json({ children: parent.children || [] });
});

module.exports = { getById, getChildren };
