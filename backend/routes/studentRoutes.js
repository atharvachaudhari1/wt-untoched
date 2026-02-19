/**
 * Student routes - all require auth + role student.
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const studentController = require('../controllers/studentController');
const announcementController = require('../controllers/announcementController');

router.use(authMiddleware);
router.use(authorizeRoles('student'));

router.get('/dashboard', studentController.dashboard);
router.get('/mentor', studentController.getMentor);
router.get('/live-sessions', studentController.getLiveSessions);
router.get('/sessions/upcoming', studentController.upcomingSessions);
router.get('/sessions/:id/meet-link', studentController.getMeetLink);
router.get('/attendance', studentController.getAttendance);
router.get('/notes', studentController.getMentoringNotes);
router.get('/announcements', announcementController.getAnnouncements);

module.exports = router;
