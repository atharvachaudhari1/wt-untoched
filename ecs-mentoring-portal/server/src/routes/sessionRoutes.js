const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sessionController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createSessionValidator, updateSessionValidator } = require('../validators/sessionValidators');

router.use(authenticate);
router.get('/upcoming', ctrl.getUpcoming);
router.get('/live', ctrl.getLive);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.post('/', authorize('teacher', 'admin'), createSessionValidator, validate, ctrl.create);
router.put('/:id', authorize('teacher', 'admin'), updateSessionValidator, validate, ctrl.update);
router.delete('/:id', authorize('teacher', 'admin'), ctrl.remove);
router.patch('/:id/meet-link', authorize('teacher'), ctrl.updateMeetLink);
router.patch('/:id/go-live', authorize('teacher'), ctrl.goLive);
router.patch('/:id/end-live', authorize('teacher'), ctrl.endLive);

module.exports = router;
