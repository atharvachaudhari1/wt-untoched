const Attendance = require('../models/Attendance');
const Session = require('../models/Session');
const ActivityLog = require('../models/ActivityLog');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { createNotification } = require('../services/notificationService');
const { computeHealthScore } = require('../services/healthScoreService');

const getForSession = asyncHandler(async (req, res) => {
  const attendance = await Attendance.find({ session: req.params.sessionId })
    .populate('student', 'name rollNumber email semester section').populate('markedBy', 'name');
  res.json({ attendance });
});

const bulkMark = asyncHandler(async (req, res) => {
  const { records } = req.body;
  const session = await Session.findById(req.params.sessionId);
  if (!session) throw new ApiError(404, 'Session not found');
  if (req.user.role === 'teacher' && !session.mentor.equals(req.user._id)) throw new ApiError(403, 'Not authorized');

  const results = [];
  for (const record of records) {
    const attendance = await Attendance.findOneAndUpdate(
      { session: req.params.sessionId, student: record.studentId },
      { session: req.params.sessionId, student: record.studentId, status: record.status, remarks: record.remarks || '', markedBy: req.user._id, markedAt: new Date() },
      { upsert: true, new: true, runValidators: true }
    );
    results.push(attendance);
    createNotification({ recipient: record.studentId, type: 'attendance_marked', title: 'Attendance Marked', message: `Your attendance for "${session.title}" has been marked as ${record.status}`, link: '/student/attendance', relatedEntity: attendance._id }).catch(console.error);
    computeHealthScore(record.studentId).catch(console.error);
  }

  await ActivityLog.create({
    actor: req.user._id, action: 'attendance_marked', entityType: 'attendance', entityId: session._id,
    description: `${req.user.name} marked attendance for "${session.title}" (${records.length} students)`,
  });
  res.json({ attendance: results });
});

const updateSingle = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  const attendance = await Attendance.findByIdAndUpdate(
    req.params.id,
    { status, remarks, markedBy: req.user._id, markedAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!attendance) throw new ApiError(404, 'Attendance record not found');
  computeHealthScore(attendance.student).catch(console.error);
  res.json({ attendance });
});

const getStudentSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const [total, present, absent, late, excused] = await Promise.all([
    Attendance.countDocuments({ student: studentId }),
    Attendance.countDocuments({ student: studentId, status: 'present' }),
    Attendance.countDocuments({ student: studentId, status: 'absent' }),
    Attendance.countDocuments({ student: studentId, status: 'late' }),
    Attendance.countDocuments({ student: studentId, status: 'excused' }),
  ]);
  const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
  res.json({ summary: { total, present, absent, late, excused, percentage } });
});

module.exports = { getForSession, bulkMark, updateSingle, getStudentSummary };
