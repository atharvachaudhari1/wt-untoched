const express = require('express');
const router = express.Router();

router.use('/auth',          require('./authRoutes'));
router.use('/users',         require('./userRoutes'));
router.use('/students',      require('./studentRoutes'));
router.use('/teachers',      require('./teacherRoutes'));
router.use('/parents',       require('./parentRoutes'));
router.use('/sessions',      require('./sessionRoutes'));
router.use('/attendance',    require('./attendanceRoutes'));
router.use('/notes',         require('./noteRoutes'));
router.use('/announcements', require('./announcementRoutes'));
router.use('/feedback',      require('./feedbackRoutes'));
router.use('/analytics',     require('./analyticsRoutes'));
router.use('/notifications', require('./notificationRoutes'));
router.use('/settings',      require('./settingRoutes'));

module.exports = router;
