const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/studentController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/search', authorize('admin', 'teacher'), ctrl.search);
router.get('/', authorize('admin', 'teacher'), ctrl.list);
router.get('/:id', authorize('admin', 'teacher', 'student'), ctrl.getById);
router.get('/:id/mentor', authorize('student', 'admin', 'teacher'), ctrl.getMentor);
router.get('/:id/sessions', authorize('student', 'teacher', 'parent'), ctrl.getSessions);
router.get('/:id/attendance', authorize('student', 'teacher', 'parent'), ctrl.getAttendance);
router.get('/:id/notes', authorize('student', 'teacher', 'parent'), ctrl.getNotes);
router.get('/:id/health-score', authorize('admin', 'teacher', 'student'), ctrl.getHealthScore);

module.exports = router;
