/**
 * Student activity requests (hackathon, workshop, etc.) - student submit, admin approve/reject.
 */
const { StudentActivity, StudentProfile, User } = require('../models');

/** Student: create activity request */
exports.createActivity = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(403).json({ success: false, message: 'Student profile not found.' });
    }
    const { type, title, description, startDate, endDate } = req.body;
    if (!type || !title || !startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'type, title, startDate and endDate required.' });
    }
    const validTypes = ['hackathon', 'workshop', 'event', 'other'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be hackathon, workshop, event, or other.' });
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return res.status(400).json({ success: false, message: 'Invalid startDate or endDate.' });
    }
    const activity = await StudentActivity.create({
      student: profile._id,
      type,
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      startDate: start,
      endDate: end,
      status: 'pending',
    });
    const populated = await StudentActivity.findById(activity._id)
      .populate('student', 'user rollNo');
    res.status(201).json({ success: true, activity: populated });
  } catch (err) {
    next(err);
  }
};

/** Student: list my activity requests */
exports.getMyActivities = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) return res.json({ success: true, activities: [] });
    const { status, limit = 50 } = req.query;
    const query = { student: profile._id };
    if (status && ['pending', 'approved', 'rejected'].includes(status)) query.status = status;
    const activities = await StudentActivity.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.json({ success: true, activities });
  } catch (err) {
    next(err);
  }
};

/** Admin: list all activity requests (optional filter by status) */
exports.getAllActivities = async (req, res, next) => {
  try {
    const { status, studentId, limit = 100 } = req.query;
    const query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) query.status = status;
    if (studentId) query.student = studentId;
    const activities = await StudentActivity.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('student', 'user rollNo department')
      .populate('student.user', 'name email')
      .populate('approvedBy', 'name');
    res.json({ success: true, activities });
  } catch (err) {
    next(err);
  }
};

/** Admin: approve activity */
exports.approveActivity = async (req, res, next) => {
  try {
    const activity = await StudentActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }
    if (activity.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Activity is not pending.' });
    }
    activity.status = 'approved';
    activity.approvedBy = req.user.id;
    activity.approvedAt = new Date();
    activity.rejectedReason = '';
    await activity.save();
    const populated = await StudentActivity.findById(activity._id)
      .populate('student', 'user rollNo')
      .populate('approvedBy', 'name');
    res.json({ success: true, activity: populated });
  } catch (err) {
    next(err);
  }
};

/** Admin: reject activity */
exports.rejectActivity = async (req, res, next) => {
  try {
    const activity = await StudentActivity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }
    if (activity.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Activity is not pending.' });
    }
    const { reason } = req.body || {};
    activity.status = 'rejected';
    activity.approvedBy = null;
    activity.approvedAt = null;
    activity.rejectedReason = reason ? String(reason).trim() : '';
    await activity.save();
    const populated = await StudentActivity.findById(activity._id)
      .populate('student', 'user rollNo');
    res.json({ success: true, activity: populated });
  } catch (err) {
    next(err);
  }
};
