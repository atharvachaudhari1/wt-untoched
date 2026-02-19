const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/parentController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/:id', authorize('parent', 'admin'), ctrl.getById);
router.get('/:id/children', authorize('parent', 'admin'), ctrl.getChildren);

module.exports = router;
