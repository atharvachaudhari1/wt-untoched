/**
 * Academic college updates - read-only for parent & teacher (and admin).
 * POST/DELETE are on admin routes.
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const academicUpdatesController = require('../controllers/academicUpdatesController');

router.use(authMiddleware);
router.get('/', authorizeRoles('admin', 'parent', 'teacher'), academicUpdatesController.list);

module.exports = router;
