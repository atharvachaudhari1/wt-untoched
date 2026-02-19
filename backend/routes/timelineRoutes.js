const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const timelineController = require('../controllers/timelineController');

router.get('/department/:department', authMiddleware, authorizeRoles('admin', 'teacher'), timelineController.departmentTimeline);

module.exports = router;
