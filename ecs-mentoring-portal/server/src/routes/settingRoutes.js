const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settingController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate, authorize('admin'));
router.get('/', ctrl.list);
router.put('/:key', ctrl.update);

module.exports = router;
