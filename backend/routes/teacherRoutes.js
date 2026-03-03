/**
 * Teacher routes: sessions, attendance, notes, announcements, student performance.
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const sessionController = require('../controllers/sessionController');
const attendanceController = require('../controllers/attendanceController');
const announcementController = require('../controllers/announcementController');
const teacherController = require('../controllers/teacherController');

router.use(authMiddleware);
router.use(authorizeRoles('teacher'));

// Assigned students (mentees) and their progress
router.get('/students', teacherController.getAssignedStudents);
router.get('/students/:studentId/progress', teacherController.getStudentProgress);
router.get('/students/:studentId/notepad', teacherController.getStudentNotepad);
router.put('/students/:studentId/notepad', teacherController.updateStudentNotepad);

// Sessions
router.get('/sessions', sessionController.listSessions);
router.put('/session/:id/meet-link', sessionController.updateMeetLink);
router.get('/sessions/:id', sessionController.getSessionById);
router.post('/sessions', sessionController.createSession);
router.put('/sessions/:id', sessionController.updateSession);
router.delete('/sessions/:id', sessionController.deleteSession);

// Attendance
router.post('/attendance/mark', attendanceController.markAttendance);
router.get('/attendance', attendanceController.getAttendanceHistory);

// Announcements (create + list)
router.get('/announcements', announcementController.getAnnouncements);
router.post('/announcements', announcementController.createAnnouncement);

module.exports = router;
