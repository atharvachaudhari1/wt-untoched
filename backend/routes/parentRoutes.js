/**
 * Parent routes - read-only access to linked students.
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const parentController = require('../controllers/parentController');
const announcementController = require('../controllers/announcementController');

router.use(authMiddleware);
router.use(authorizeRoles('parent'));

router.get('/linked-students', parentController.linkedStudents);
router.get('/student/:studentId/schedule', parentController.studentSchedule);
router.get('/student/:studentId/attendance', parentController.studentAttendance);
router.get('/student/:studentId/mentor-remarks', parentController.mentorRemarks);
router.get('/student/:studentId/academic-updates', parentController.academicUpdates);
router.get('/announcements', announcementController.getAnnouncements);

module.exports = router;
