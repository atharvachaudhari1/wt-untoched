const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/feedbackController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.post('/', authorize('student'), ctrl.create);
router.get('/session/:sessionId', authorize('teacher', 'admin'), ctrl.getForSession);
router.get('/student/:studentId', authorize('teacher', 'admin'), ctrl.getForStudent);

module.exports = router;
