const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/overview', authorize('admin'), ctrl.overview);
router.get('/attendance', authorize('admin', 'teacher'), ctrl.attendanceTrends);
router.get('/health-scores', authorize('admin'), ctrl.healthScoreDistribution);
router.get('/activity-timeline', authorize('admin', 'teacher'), ctrl.activityTimeline);
router.get('/mentor-performance', authorize('admin'), ctrl.mentorPerformance);

module.exports = router;
