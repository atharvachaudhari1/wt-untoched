/**
 * Department Activity Timeline API - recent sessions, attendance, notes by department.
 */
const { Session, Attendance, StudentProfile, TeacherProfile } = require('../models');

/**
 * GET /api/timeline/department/:department - recent activity for a department (admin/teacher).
 */
exports.departmentTimeline = async (req, res, next) => {
  try {
    const { department } = req.params;
    const limit = Number(req.query.limit) || 30;
    const teachers = await TeacherProfile.find({ department }).select('_id');
    const teacherIds = teachers.map((t) => t._id);
    const sessions = await Session.find({ teacher: { $in: teacherIds } })
      .sort({ scheduledAt: -1 })
      .limit(limit)
      .populate('teacher', 'user department')
      .populate('teacher.user', 'name')
      .populate('students', 'rollNo user');
    const events = sessions.map((s) => ({
      type: 'session',
      id: s._id,
      title: s.title,
      scheduledAt: s.scheduledAt,
      status: s.status,
      liveSessionStatus: s.liveSessionStatus,
      teacher: s.teacher,
      studentCount: (s.students && s.students.length) || 0,
    }));
    res.json({ success: true, department, timeline: events });
  } catch (err) {
    next(err);
  }
};
