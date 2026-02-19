/**
 * Student API: mentor, upcoming sessions, Meet link, attendance, notes, announcements.
 */
const { Session, StudentProfile, TeacherProfile, Attendance } = require('../models');
const { calculateMentoringHealthScore } = require('../utils/mentoringHealthScore');

exports.dashboard = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id })
      .populate('mentor', 'user department designation')
      .populate('mentor.user', 'name email');
    if (!profile) {
      return res.json({ success: true, profile: null, upcomingSessions: [], healthScore: null });
    }
    const upcomingSessions = await Session.find({
      students: profile._id,
      scheduledAt: { $gte: new Date() },
      status: 'scheduled',
    })
      .sort({ scheduledAt: 1 })
      .limit(10)
      .populate('teacher', 'user department')
      .populate('teacher.user', 'name');
    let healthScore = profile.mentoringHealthScore;
    if (healthScore == null) {
      healthScore = await calculateMentoringHealthScore(profile._id);
      profile.mentoringHealthScore = healthScore;
      await profile.save();
    }
    res.json({ success: true, profile, upcomingSessions, healthScore });
  } catch (err) {
    next(err);
  }
};

exports.getMentor = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id }).populate('mentor');
    if (!profile || !profile.mentor) {
      return res.status(404).json({ success: false, message: 'No mentor assigned.' });
    }
    const mentorProfile = await TeacherProfile.findById(profile.mentor._id).populate('user', 'name email');
    res.json({ success: true, mentor: mentorProfile });
  } catch (err) {
    next(err);
  }
};

exports.upcomingSessions = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) return res.json({ success: true, sessions: [] });
    const sessions = await Session.find({
      students: profile._id,
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

/**
 * GET /api/student/live-sessions - Sessions that have a Meet link (student can join).
 */
exports.getLiveSessions = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) return res.json({ success: true, sessions: [] });
    const sessions = await Session.find({
      students: profile._id,
      meetLink: { $exists: true, $ne: null, $ne: '' },
    })
      .sort({ scheduledAt: 1 })
      .populate('teacher', 'user department')
      .populate('teacher.user', 'name')
      .select('_id title meetLink scheduledAt duration');
    res.json({ success: true, sessions });
  } catch (err) {
    next(err);
  }
};

exports.getMeetLink = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) return res.status(403).json({ success: false, message: 'Student profile not found.' });
    const session = await Session.findOne({
      _id: req.params.id,
      students: profile._id,
    }).select('meetLink title scheduledAt liveSessionStatus');
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    res.json({
      success: true,
      meetLink: session.meetLink,
      title: session.title,
      scheduledAt: session.scheduledAt,
      liveSessionStatus: session.liveSessionStatus,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAttendance = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) return res.json({ success: true, attendance: [] });
    const attendance = await Attendance.find({ student: profile._id })
      .sort({ createdAt: -1 })
      .populate('session', 'title scheduledAt')
      .limit(Number(req.query.limit) || 50);
    res.json({ success: true, attendance });
  } catch (err) {
    next(err);
  }
};

exports.getMentoringNotes = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) return res.json({ success: true, notes: [] });
    const sessions = await Session.find({
      students: profile._id,
      mentoringNotes: { $exists: true, $ne: null, $ne: '' },
    })
      .sort({ scheduledAt: -1 })
      .select('title scheduledAt mentoringNotes')
      .limit(50);
    const notes = sessions.map((s) => ({
      sessionId: s._id,
      title: s.title,
      date: s.scheduledAt,
      notes: s.mentoringNotes,
    }));
    res.json({ success: true, notes });
  } catch (err) {
    next(err);
  }
};
