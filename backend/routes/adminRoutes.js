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
const academicUpdatesController = require('../controllers/academicUpdatesController');
const upload = require('../middleware/uploadMiddleware');

router.use(authMiddleware);
router.use(authorizeRoles('admin'));

router.post('/users', adminController.createUser);
router.post('/assign-mentor', adminController.assignMentor);
router.get('/students', adminController.getAllStudents);
router.get('/students/:studentId/progress', adminController.getStudentProgress);
router.get('/teachers', adminController.getAllTeachers);
router.get('/sessions', adminController.getAllSessions);
router.get('/sessions/:id', sessionController.getSessionById);
router.get('/analytics', adminController.analytics);
router.get('/announcements', adminController.getAllAnnouncements);
router.post('/announcements', announcementController.createAnnouncement);
router.get('/activities', activityController.getAllActivities);
router.patch('/activities/:id/approve', activityController.approveActivity);
router.patch('/activities/:id/reject', activityController.rejectActivity);
router.delete('/activities', activityController.deleteAllActivities);
router.delete('/activities/:id', activityController.deleteOneActivity);
router.post('/activities/delete-selected', activityController.deleteSelectedActivities);

router.get('/academic-updates', academicUpdatesController.list);
router.post('/academic-updates', upload.single('file'), academicUpdatesController.create);
router.delete('/academic-updates/:id', academicUpdatesController.delete);

module.exports = router;
