const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/noteController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/', authorize('teacher', 'admin'), ctrl.list);
router.get('/:id', authorize('teacher', 'admin'), ctrl.getById);
router.post('/', authorize('teacher'), ctrl.create);
router.put('/:id', authorize('teacher'), ctrl.update);
router.delete('/:id', authorize('teacher', 'admin'), ctrl.remove);

module.exports = router;
