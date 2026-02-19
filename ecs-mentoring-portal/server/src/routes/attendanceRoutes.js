const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/attendanceController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/student/:studentId/summary', authorize('teacher', 'student', 'parent'), ctrl.getStudentSummary);
router.get('/session/:sessionId', authorize('teacher', 'admin'), ctrl.getForSession);
router.post('/session/:sessionId', authorize('teacher', 'admin'), ctrl.bulkMark);
router.put('/:id', authorize('teacher', 'admin'), ctrl.updateSingle);

module.exports = router;
