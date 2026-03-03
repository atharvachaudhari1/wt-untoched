/**
 * Counselor (Concilar) API: view all students and their full progress + follow-up.
 */
const { StudentProfile, Session, Attendance, StudentActivity, CourseAttendance, StudentNotepad } = require('../models');

/**
 * GET /counselor/students - List all students (same as admin). Query: department, year, limit.
 */
exports.getStudents = async (req, res, next) => {
  try {
    const { department, year, limit = 500 } = req.query;
    const query = {};
    if (department) query.department = department;
    if (year) query.year = Number(year);
    const profiles = await StudentProfile.find(query)
      .sort({ rollNo: 1 })
      .limit(Number(limit))
      .populate('user', 'name email')
      .populate({ path: 'mentor', select: 'user department', populate: { path: 'user', select: 'name email' } });
    res.json({ success: true, students: profiles });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /counselor/students/:studentId - Full student detail + progress + follow-up (attendance, activities, course attendance, mentoring notes from sessions).
 */
exports.getStudentDetail = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await StudentProfile.findById(studentId)
      .populate('user', 'name email')
      .populate({ path: 'mentor', select: 'user department', populate: { path: 'user', select: 'name email' } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    const limit = Number(req.query.limit) || 50;
    const [attendance, approvedActivities, courseAttendance, followUpSessions] = await Promise.all([
      Attendance.find({ student: studentId })
        .sort({ createdAt: -1 })
        .populate('session', 'title scheduledAt mentoringNotes')
        .limit(limit),
      StudentActivity.find({ student: studentId, status: 'approved' })
        .sort({ startDate: -1 })
        .limit(50),
      CourseAttendance.find({ student: studentId }).sort({ courseCode: 1 }).lean(),
      Session.find({ students: studentId })
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
    res.json({
      success: true,
      student,
      attendance,
      approvedActivities,
      courseAttendance,
      followUp,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /counselor/students/:studentId/notepad - Get notepad for any student.
 */
exports.getStudentNotepad = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await StudentProfile.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
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
 * PUT /counselor/students/:studentId/notepad - Update notepad for any student. Body: { content }.
 */
exports.updateStudentNotepad = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const student = await StudentProfile.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
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

/**
 * PATCH /counselor/sessions/:sessionId/notes - Counselor can edit follow-up notes for a session.
 * Teacher edits via PUT /teacher/sessions/:id. Only teacher and counselor can edit; students only view.
 */
exports.updateSessionNotes = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { mentoringNotes } = req.body || {};
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }
    session.mentoringNotes = typeof mentoringNotes === 'string' ? mentoringNotes.trim() || null : (mentoringNotes ?? null);
    await session.save();
    res.json({
      success: true,
      session: {
        _id: session._id,
        title: session.title,
        scheduledAt: session.scheduledAt,
        mentoringNotes: session.mentoringNotes,
      },
    });
  } catch (err) {
    next(err);
  }
};
