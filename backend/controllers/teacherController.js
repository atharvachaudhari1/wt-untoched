/**
 * Teacher API: assigned students (mentees) and their progress.
 */
const { TeacherProfile, StudentProfile, Attendance, StudentActivity, CourseAttendance, Session, StudentNotepad } = require('../models');

/**
 * GET /teacher/students - List students assigned to this teacher (mentees).
 */
exports.getAssignedStudents = async (req, res, next) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({ user: req.user._id });
    if (!teacherProfile || !teacherProfile.assignedStudents || teacherProfile.assignedStudents.length === 0) {
      return res.json({ success: true, students: [] });
    }
    const profiles = await StudentProfile.find({ _id: { $in: teacherProfile.assignedStudents } })
      .sort({ rollNo: 1 })
      .populate('user', 'name email')
      .populate({ path: 'mentor', select: 'user department', populate: { path: 'user', select: 'name email' } });
    res.json({ success: true, students: profiles });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /teacher/students/:studentId/progress - Progress for one assigned student (same shape as admin getStudentProgress).
 * Only allowed if studentId is in this teacher's assignedStudents.
 */
exports.getStudentProgress = async (req, res, next) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({ user: req.user._id });
    if (!teacherProfile) {
      return res.status(403).json({ success: false, message: 'Teacher profile not found.' });
    }
    const { studentId } = req.params;
    const isAssigned = (teacherProfile.assignedStudents || []).some(
      (id) => id && id.toString() === studentId.toString()
    );
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'You can only view progress for your assigned students.' });
    }
    const student = await StudentProfile.findById(studentId)
      .populate('user', 'name email')
      .populate('mentor', 'user department')
      .populate('mentor.user', 'name');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const limit = Number(req.query.limit) || 50;
    const [attendance, approvedActivities, courseAttendance, followUpSessions] = await Promise.all([
      Attendance.find({ student: studentId })
        .sort({ createdAt: -1 })
        .populate('session', 'title scheduledAt')
        .limit(limit),
      StudentActivity.find({ student: studentId, status: 'approved' })
        .sort({ startDate: -1 })
        .limit(50),
      CourseAttendance.find({ student: studentId }).sort({ courseCode: 1 }).lean(),
      Session.find({ students: studentId, mentoringNotes: { $exists: true, $ne: null, $ne: '' } })
        .sort({ scheduledAt: -1 })
        .limit(50)
        .populate({ path: 'teacher', select: 'user', populate: { path: 'user', select: 'name' } })
        .select('title scheduledAt mentoringNotes'),
    ]);
    const followUp = followUpSessions.map((s) => ({
      sessionId: s._id,
      title: s.title,
      scheduledAt: s.scheduledAt,
      mentoringNotes: s.mentoringNotes,
      mentorName: (s.teacher && s.teacher.user && s.teacher.user.name) ? s.teacher.user.name : null,
    }));
    res.json({ success: true, student, attendance, approvedActivities, courseAttendance, followUp });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /teacher/students/:studentId/notepad - Get notepad for an assigned student only.
 */
exports.getStudentNotepad = async (req, res, next) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({ user: req.user._id });
    if (!teacherProfile) {
      return res.status(403).json({ success: false, message: 'Teacher profile not found.' });
    }
    const { studentId } = req.params;
    const isAssigned = (teacherProfile.assignedStudents || []).some(
      (id) => id && id.toString() === studentId.toString()
    );
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'You can only view notepads for your assigned students.' });
    }
    let notepad = await StudentNotepad.findOne({ student: studentId });
    if (!notepad) {
      notepad = await StudentNotepad.create({ student: studentId, content: '' });
    }
    res.json({ success: true, notepad: { content: notepad.content || '', updatedAt: notepad.updatedAt } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /teacher/students/:studentId/notepad - Update notepad for an assigned student only. Body: { content }.
 */
exports.updateStudentNotepad = async (req, res, next) => {
  try {
    const teacherProfile = await TeacherProfile.findOne({ user: req.user._id });
    if (!teacherProfile) {
      return res.status(403).json({ success: false, message: 'Teacher profile not found.' });
    }
    const { studentId } = req.params;
    const isAssigned = (teacherProfile.assignedStudents || []).some(
      (id) => id && id.toString() === studentId.toString()
    );
    if (!isAssigned) {
      return res.status(403).json({ success: false, message: 'You can only edit notepads for your assigned students.' });
    }
    const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';
    let notepad = await StudentNotepad.findOne({ student: studentId });
    if (!notepad) {
      notepad = await StudentNotepad.create({ student: studentId, content });
    } else {
      notepad.content = content;
      await notepad.save();
    }
    res.json({ success: true, notepad: { content: notepad.content || '', updatedAt: notepad.updatedAt } });
  } catch (err) {
    next(err);
  }
};
