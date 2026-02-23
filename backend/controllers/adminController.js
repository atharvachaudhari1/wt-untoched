/**
 * Admin API: create users, assign mentor, view all sessions, analytics, announcements.
 */
const { User, StudentProfile, TeacherProfile, ParentProfile, Session, Announcement, Attendance, StudentActivity } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * Create user (student/teacher/parent). Body: email, password, name, role, profileData (role-specific).
 */
exports.createUser = async (req, res, next) => {
  try {
    const { email, password, name, role, profileData } = req.body;
    if (!email || !password || !name || !role) {
      return res.status(400).json({ success: false, message: 'email, password, name, role required.' });
    }
    if (!['student', 'teacher', 'parent'].includes(role)) {
      return res.status(400).json({ success: false, message: 'role must be student, teacher, or parent.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });

    const user = await User.create({ email: email.toLowerCase(), password, name, role });
    let profileId = null;
    let profileModel = null;

    if (role === 'student' && profileData) {
      const profile = await StudentProfile.create({
        user: user._id,
        rollNo: profileData.rollNo || '',
        department: profileData.department || '',
        year: profileData.year,
      });
      profileId = profile._id;
      profileModel = 'StudentProfile';
    } else if (role === 'teacher' && profileData) {
      const profile = await TeacherProfile.create({
        user: user._id,
        employeeId: profileData.employeeId,
        department: profileData.department || '',
        designation: profileData.designation,
      });
      profileId = profile._id;
      profileModel = 'TeacherProfile';
    } else if (role === 'parent' && profileData) {
      const profile = await ParentProfile.create({
        user: user._id,
        phone: profileData.phone,
        linkedStudents: profileData.linkedStudents || [],
      });
      profileId = profile._id;
      profileModel = 'ParentProfile';
    }
    user.profileId = profileId;
    user.profileModel = profileModel;
    await user.save();

    const created = await User.findById(user._id).select('-password');
    res.status(201).json({ success: true, user: created });
  } catch (err) {
    next(err);
  }
};

/**
 * Assign mentor to student. Body: studentId (StudentProfile id), mentorId (TeacherProfile id).
 */
exports.assignMentor = async (req, res, next) => {
  try {
    const { studentId, mentorId } = req.body;
    if (!studentId || !mentorId) {
      return res.status(400).json({ success: false, message: 'studentId and mentorId required.' });
    }
    const student = await StudentProfile.findById(studentId);
    const teacher = await TeacherProfile.findById(mentorId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found.' });

    student.mentor = mentorId;
    await student.save();
    if (!teacher.assignedStudents.includes(studentId)) {
      teacher.assignedStudents.push(studentId);
      await teacher.save();
    }
    res.json({ success: true, message: 'Mentor assigned.', student, mentor: teacher });
  } catch (err) {
    next(err);
  }
};

/**
 * List all sessions (admin). Query: status, from, to, limit.
 */
exports.getAllSessions = async (req, res, next) => {
  try {
    const { status, from, to, limit = 100 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (from || to) {
      query.scheduledAt = {};
      if (from) query.scheduledAt.$gte = new Date(from);
      if (to) query.scheduledAt.$lte = new Date(to);
    }
    const sessions = await Session.find(query)
      .sort({ scheduledAt: -1 })
      .limit(Number(limit))
      .populate('teacher', 'user department')
      .populate('teacher.user', 'name')
      .populate('students', 'user rollNo');
    res.json({ success: true, sessions });
  } catch (err) {
    next(err);
  }
};

/**
 * Analytics: counts and basic stats for dashboard.
 */
exports.analytics = async (req, res, next) => {
  try {
    const [userCounts, sessionCount, sessionUpcoming, announcementCount] = await Promise.all([
      User.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$role', count: { $sum: 1 } } }]),
      Session.countDocuments({ status: 'scheduled' }),
      Session.countDocuments({ status: 'scheduled', scheduledAt: { $gte: new Date() } }),
      Announcement.countDocuments(),
    ]);
    const byRole = {};
    userCounts.forEach((r) => { byRole[r._id] = r.count; });
    res.json({
      success: true,
      analytics: {
        usersByRole: byRole,
        totalSessions: sessionCount,
        upcomingSessions: sessionUpcoming,
        totalAnnouncements: announcementCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: list all students (User + StudentProfile). Query: department, year, limit.
 */
exports.getAllStudents = async (req, res, next) => {
  try {
    const { department, year, limit = 500 } = req.query;
    const query = {};
    if (department) query.department = department;
    if (year) query.year = Number(year);
    const profiles = await StudentProfile.find(query)
      .sort({ rollNo: 1 })
      .limit(Number(limit))
      .populate('user', 'name email');
    res.json({ success: true, students: profiles });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: list all teachers (mentors). Query: department, limit.
 */
exports.getAllTeachers = async (req, res, next) => {
  try {
    const { department, limit = 100 } = req.query;
    const query = {};
    if (department) query.department = department;
    const teachers = await TeacherProfile.find(query)
      .sort({ department: 1 })
      .limit(Number(limit))
      .populate('user', 'name email')
      .populate('assignedStudents', 'user rollNo department year')
      .populate('assignedStudents.user', 'name email');
    res.json({ success: true, teachers });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: get a student's progress (attendance + approved activities). :studentId = StudentProfile id.
 */
exports.getStudentProgress = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await StudentProfile.findById(studentId).populate('user', 'name email').populate('mentor', 'user department').populate('mentor.user', 'name');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const limit = Number(req.query.limit) || 50;
    const [attendance, approvedActivities] = await Promise.all([
      Attendance.find({ student: studentId })
        .sort({ createdAt: -1 })
        .populate('session', 'title scheduledAt')
        .limit(limit),
      StudentActivity.find({ student: studentId, status: 'approved' })
        .sort({ startDate: -1 })
        .limit(50),
    ]);
    res.json({ success: true, student, attendance, approvedActivities });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: list/create/update announcements - create uses announcementController; list all.
 */
exports.getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({})
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 50)
      .populate('author', 'name email');
    res.json({ success: true, announcements });
  } catch (err) {
    next(err);
  }
};
