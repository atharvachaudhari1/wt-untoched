const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/announcementController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authorize('teacher', 'admin'), ctrl.create);
router.put('/:id', authorize('teacher', 'admin'), ctrl.update);
router.delete('/:id', authorize('teacher', 'admin'), ctrl.remove);

module.exports = router;
