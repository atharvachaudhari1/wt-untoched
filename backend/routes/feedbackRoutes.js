const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const feedbackController = require('../controllers/feedbackController');

router.post('/quick', authMiddleware, authorizeRoles('student'), feedbackController.submitQuickFeedback);
router.get('/my', authMiddleware, authorizeRoles('student'), feedbackController.myFeedback);

module.exports = router;
