/**
 * Admin routes: users, assign mentor, sessions, analytics, announcements.
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');
const sessionController = require('../controllers/sessionController');
const announcementController = require('../controllers/announcementController');
const activityController = require('../controllers/activityController');

router.use(authMiddleware);
router.use(authorizeRoles('admin'));

router.post('/users', adminController.createUser);
router.post('/assign-mentor', adminController.assignMentor);
router.get('/students', adminController.getAllStudents);
router.get('/teachers', adminController.getAllTeachers);
router.get('/sessions', adminController.getAllSessions);
router.get('/sessions/:id', sessionController.getSessionById);
router.get('/analytics', adminController.analytics);
router.get('/announcements', adminController.getAllAnnouncements);
router.post('/announcements', announcementController.createAnnouncement);
router.get('/activities', activityController.getAllActivities);
router.patch('/activities/:id/approve', activityController.approveActivity);
router.patch('/activities/:id/reject', activityController.rejectActivity);

module.exports = router;
