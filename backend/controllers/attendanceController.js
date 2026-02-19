/**
 * Attendance controller - mark and fetch attendance.
 */
const { Attendance, Session, StudentProfile, TeacherProfile } = require('../models');

exports.markAttendance = async (req, res, next) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({ user: req.user.id });
    if (!teacherProfile) {
      return res.status(403).json({ success: false, message: 'Teacher profile not found.' });
    }
    const { sessionId, records } = req.body;
    if (!sessionId || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: 'sessionId and records array required.' });
    }
    const session = await Session.findOne({ _id: sessionId, teacher: teacherProfile._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }
    const results = [];
    for (const r of records) {
      const { studentId, status, remarks } = r;
      if (!studentId || !['present', 'absent', 'late', 'excused'].includes(status)) continue;
      const studentInSession = session.students.some((s) => s.toString() === studentId);
      if (!studentInSession) continue;
      const att = await Attendance.findOneAndUpdate(
        { session: sessionId, student: studentId },
        { status, remarks: remarks || '', markedBy: req.user.id },
        { new: true, upsert: true }
      ).populate('student', 'user rollNo');
      results.push(att);
    }
    res.json({ success: true, attendance: results });
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceHistory = async (req, res, next) => {
  try {
    const { studentId, sessionId, limit = 50 } = req.query;
    let query = {};
    if (req.user.role === 'student') {
      const profile = await StudentProfile.findOne({ user: req.user.id });
      if (!profile) return res.json({ success: true, attendance: [] });
      query.student = profile._id;
    } else if (req.user.role === 'teacher') {
      const profile = await TeacherProfile.findOne({ user: req.user.id });
      if (!profile) return res.json({ success: true, attendance: [] });
      const sessionIds = await Session.find({ teacher: profile._id }).distinct('_id');
      query.session = { $in: sessionIds };
    } else if (req.user.role === 'admin' && studentId) {
      query.student = studentId;
    }
    if (sessionId) query.session = sessionId;
    const attendance = await Attendance.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('session', 'title scheduledAt')
      .populate('student', 'user rollNo')
      .populate('markedBy', 'name');
    res.json({ success: true, attendance });
  } catch (err) {
    next(err);
  }
};
