const User = require('../models/User');
const Session = require('../models/Session');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

const overview = asyncHandler(async (req, res) => {
  const [totalStudents, totalTeachers, totalParents, totalSessions, completedSessions, totalAttendance, presentAttendance] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'teacher', isActive: true }),
    User.countDocuments({ role: 'parent', isActive: true }),
    Session.countDocuments(),
    Session.countDocuments({ status: 'completed' }),
    Attendance.countDocuments(),
    Attendance.countDocuments({ status: { $in: ['present', 'late'] } }),
  ]);
  const avgAttendance = totalAttendance > 0 ? Math.round((presentAttendance / totalAttendance) * 100) : 0;
  const students = await User.find({ role: 'student', isActive: true }).select('healthScore');
  const avgHealthScore = students.length > 0 ? Math.round(students.reduce((s, st) => s + (st.healthScore || 0), 0) / students.length) : 0;
  res.json({ stats: { totalStudents, totalTeachers, totalParents, totalSessions, completedSessions, avgAttendance, avgHealthScore } });
});

const attendanceTrends = asyncHandler(async (req, res) => {
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const trends = await Attendance.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['present', 'late']] }, 1, 0] } } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
  const formatted = trends.map(t => ({
    month: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
    total: t.total, present: t.present,
    percentage: t.total > 0 ? Math.round((t.present / t.total) * 100) : 0,
  }));
  res.json({ trends: formatted });
});

const healthScoreDistribution = asyncHandler(async (req, res) => {
  const students = await User.find({ role: 'student', isActive: true }).select('healthScore');
  const distribution = { critical: 0, low: 0, medium: 0, good: 0, excellent: 0 };
  students.forEach(s => {
    const score = s.healthScore || 0;
    if (score <= 20) distribution.critical++;
    else if (score <= 40) distribution.low++;
    else if (score <= 60) distribution.medium++;
    else if (score <= 80) distribution.good++;
    else distribution.excellent++;
  });
  res.json({ distribution });
});

const activityTimeline = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const activities = await ActivityLog.find().populate('actor', 'name role').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  res.json({ activities });
});

const mentorPerformance = asyncHandler(async (req, res) => {
  const teachers = await User.find({ role: 'teacher', isActive: true }).select('name employeeId assignedStudents');
  const performance = await Promise.all(teachers.map(async (teacher) => {
    const [sessionCount, completedCount] = await Promise.all([
      Session.countDocuments({ mentor: teacher._id }),
      Session.countDocuments({ mentor: teacher._id, status: 'completed' }),
    ]);
    const sessions = await Session.find({ mentor: teacher._id }).select('_id');
    const sessionIds = sessions.map(s => s._id);
    const feedbacks = await Feedback.find({ session: { $in: sessionIds } });
    const avgRating = feedbacks.length > 0 ? +(feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : 0;
    return { teacher: { _id: teacher._id, name: teacher.name, employeeId: teacher.employeeId }, studentCount: (teacher.assignedStudents || []).length, sessionCount, completedCount, avgRating };
  }));
  res.json({ performance });
});

module.exports = { overview, attendanceTrends, healthScoreDistribution, activityTimeline, mentorPerformance };
