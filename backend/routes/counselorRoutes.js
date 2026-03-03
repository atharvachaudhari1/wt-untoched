/**
 * Counselor (Concilar) routes - view all students, student detail + follow-up.
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const counselorController = require('../controllers/counselorController');

router.use(authMiddleware);
router.use(authorizeRoles('counselor'));

router.get('/students', counselorController.getStudents);
router.get('/students/:studentId', counselorController.getStudentDetail);
router.get('/students/:studentId/notepad', counselorController.getStudentNotepad);
router.put('/students/:studentId/notepad', counselorController.updateStudentNotepad);
router.patch('/sessions/:sessionId/notes', counselorController.updateSessionNotes);

module.exports = router;
