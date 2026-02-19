const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const MentoringNote = require('../models/MentoringNote');
const Session = require('../models/Session');
const User = require('../models/User');

const computeHealthScore = async (studentId) => {
  const student = await User.findById(studentId);
  if (!student || student.role !== 'student') return null;

  // Attendance score (40%)
  const totalAttendance = await Attendance.countDocuments({ student: studentId });
  const presentAttendance = await Attendance.countDocuments({ student: studentId, status: { $in: ['present', 'late'] } });
  const attendanceScore = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 50;

  // Feedback participation (20%)
  const completedSessions = await Session.countDocuments({ targetStudents: studentId, status: 'completed' });
  const feedbackCount = await Feedback.countDocuments({ student: studentId });
  const feedbackScore = completedSessions > 0 ? Math.min((feedbackCount / completedSessions) * 100, 100) : 50;

  // Engagement - recent attendance (15%)
  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentSessions = await Attendance.countDocuments({ student: studentId, status: 'present', createdAt: { $gte: thirtyDaysAgo } });
  const engagementScore = Math.min(recentSessions * 25, 100);

  // Academic standing (15%)
  const cgpa = student.academicInfo?.cgpa || 0;
  const backlogs = student.academicInfo?.backlogs || 0;
  const academicScore = Math.max((cgpa / 10) * 100 - backlogs * 10, 0);

  // Note severity (10%)
  const criticalNotes = await MentoringNote.countDocuments({ student: studentId, severity: 'critical' });
  const warningNotes = await MentoringNote.countDocuments({ student: studentId, severity: 'warning' });
  const noteScore = Math.max(100 - criticalNotes * 30 - warningNotes * 15, 0);

  const totalScore = Math.round(
    (attendanceScore * 40 + feedbackScore * 20 + engagementScore * 15 + academicScore * 15 + noteScore * 10) / 100
  );
  const finalScore = Math.max(0, Math.min(100, totalScore));

  await User.findByIdAndUpdate(studentId, { healthScore: finalScore });
  return finalScore;
};

module.exports = { computeHealthScore };
