/**
 * Parent API - read-only: linked students schedule, attendance, mentor remarks, academic updates.
 */
const { StudentProfile, Session, Attendance, ParentProfile } = require('../models');

async function getLinkedStudentIds(userId) {
  const parent = await ParentProfile.findOne({ user: userId }).select('linkedStudents');
  return (parent && parent.linkedStudents) ? parent.linkedStudents : [];
}

exports.linkedStudents = async (req, res, next) => {
  try {
    const ids = await getLinkedStudentIds(req.user.id);
    const profiles = await StudentProfile.find({ _id: { $in: ids } })
      .populate('user', 'name email')
      .populate('mentor', 'user department')
      .populate('mentor.user', 'name');
    res.json({ success: true, students: profiles });
  } catch (err) {
    next(err);
  }
};

exports.studentSchedule = async (req, res, next) => {
  try {
    const ids = await getLinkedStudentIds(req.user.id);
    if (!ids.some((id) => id.toString() === req.params.studentId)) {
      return res.status(403).json({ success: false, message: 'Student not linked to you.' });
    }
    const sessions = await Session.find({
      students: req.params.studentId,
      scheduledAt: { $gte: new Date() },
      status: 'scheduled',
    })
      .sort({ scheduledAt: 1 })
      .populate('teacher', 'user department')
      .populate('teacher.user', 'name');
    res.json({ success: true, sessions });
  } catch (err) {
    next(err);
  }
};

exports.studentAttendance = async (req, res, next) => {
  try {
    const ids = await getLinkedStudentIds(req.user.id);
    if (!ids.some((id) => id.toString() === req.params.studentId)) {
      return res.status(403).json({ success: false, message: 'Student not linked to you.' });
    }
    const attendance = await Attendance.find({ student: req.params.studentId })
      .sort({ createdAt: -1 })
      .populate('session', 'title scheduledAt')
      .limit(Number(req.query.limit) || 50);
    res.json({ success: true, attendance });
  } catch (err) {
    next(err);
  }
};

exports.mentorRemarks = async (req, res, next) => {
  try {
    const ids = await getLinkedStudentIds(req.user.id);
    if (!ids.some((id) => id.toString() === req.params.studentId)) {
      return res.status(403).json({ success: false, message: 'Student not linked to you.' });
    }
    const sessions = await Session.find({
      students: req.params.studentId,
      mentoringNotes: { $exists: true, $ne: null, $ne: '' },
    })
      .sort({ scheduledAt: -1 })
      .select('title scheduledAt mentoringNotes')
      .limit(50);
    res.json({ success: true, remarks: sessions });
  } catch (err) {
    next(err);
  }
};

exports.academicUpdates = async (req, res, next) => {
  try {
    const ids = await getLinkedStudentIds(req.user.id);
    if (!ids.some((id) => id.toString() === req.params.studentId)) {
      return res.status(403).json({ success: false, message: 'Student not linked to you.' });
    }
    const profile = await StudentProfile.findById(req.params.studentId)
      .select('mentoringHealthScore department year rollNo')
      .populate('mentor', 'user')
      .populate('mentor.user', 'name');
    const recentAtt = await Attendance.find({ student: req.params.studentId }).sort({ createdAt: -1 }).limit(10);
    const presentCount = recentAtt.filter((a) => a.status === 'present' || a.status === 'late').length;
    res.json({
      success: true,
      student: profile,
      recentAttendanceSummary: { total: recentAtt.length, present: presentCount },
    });
  } catch (err) {
    next(err);
  }
};
