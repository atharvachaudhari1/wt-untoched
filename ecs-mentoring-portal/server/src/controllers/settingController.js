const SystemSetting = require('../models/SystemSetting');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const settings = await SystemSetting.find().sort({ key: 1 });
  res.json({ settings });
});

const update = asyncHandler(async (req, res) => {
  const { value } = req.body;
  const setting = await SystemSetting.findOneAndUpdate(
    { key: req.params.key },
    { value, updatedBy: req.user._id },
    { new: true, upsert: true }
  );
  res.json({ setting });
});

module.exports = { list, update };
