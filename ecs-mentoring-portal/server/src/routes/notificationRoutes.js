const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);
router.get('/unread-count', ctrl.unreadCount);
router.get('/', ctrl.list);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.markRead);

module.exports = router;
