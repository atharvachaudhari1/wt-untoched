/**
 * Mentoring Health Score calculation for a student.
 * Factors: attendance rate, session frequency, recency, feedback (if any).
 * Returns 0-100.
 */
const { Session, Attendance, Feedback, StudentProfile } = require('../models');

/**
 * Compute health score for a student (StudentProfile id).
 * @param {ObjectId} studentProfileId
 * @returns {Promise<number>} 0-100
 */
async function calculateMentoringHealthScore(studentProfileId) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const profile = await StudentProfile.findById(studentProfileId).select('user');
  const userId = profile ? profile.user : null;

  const [sessions, attendances, feedbacks] = await Promise.all([
    Session.find({ students: studentProfileId, scheduledAt: { $lte: now } }).select('_id scheduledAt'),
    Attendance.find({ student: studentProfileId }).select('session status'),
    userId
      ? Feedback.find({ fromUser: userId }).sort({ createdAt: -1 }).limit(20).select('rating')
      : [],
  ]);

  let score = 50; // base

  // Attendance: present % in last 30 days
  const recentSessionIds = sessions.filter((s) => s.scheduledAt >= thirtyDaysAgo).map((s) => s._id);
  const recentAtt = attendances.filter((a) => recentSessionIds.some((id) => id.equals(a.session)));

  if (recentAtt.length > 0) {
    const presentCount = recentAtt.filter((a) => a.status === 'present' || a.status === 'late').length;
    const attendanceRate = presentCount / recentAtt.length;
    score += (attendanceRate - 0.5) * 30; // -15 to +15
  }

  // Session frequency: more scheduled sessions in last 30 days = healthier
  if (recentSessionIds.length >= 2) score += 10;
  if (recentSessionIds.length >= 4) score += 5;

  // Recent feedback average
  if (feedbacks.length > 0) {
    const avgRating = feedbacks.reduce((a, f) => a + f.rating, 0) / feedbacks.length;
    score += (avgRating - 3) * 5; // 1-5 scale -> -10 to +10
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = { calculateMentoringHealthScore };
