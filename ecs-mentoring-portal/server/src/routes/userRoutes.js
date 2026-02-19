const express = require('express');
const router = express.Router();
const { list, getById, create, update, softDelete, toggleActive } = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createUserValidator, updateUserValidator } = require('../validators/userValidators');

router.use(authenticate, authorize('admin'));
router.get('/', list);
router.get('/:id', getById);
router.post('/', createUserValidator, validate, create);
router.put('/:id', updateUserValidator, validate, update);
router.delete('/:id', softDelete);
router.patch('/:id/toggle-active', toggleActive);

module.exports = router;
