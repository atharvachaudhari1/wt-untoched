const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teacherController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.use(authenticate);
router.get('/', authorize('admin'), ctrl.list);
router.get('/:id', authorize('admin', 'teacher'), ctrl.getById);
router.get('/:id/students', authorize('admin', 'teacher'), ctrl.getStudents);
router.post('/:id/assign-student', authorize('admin'), ctrl.assignStudent);
router.delete('/:id/unassign-student/:studentId', authorize('admin'), ctrl.unassignStudent);

module.exports = router;
