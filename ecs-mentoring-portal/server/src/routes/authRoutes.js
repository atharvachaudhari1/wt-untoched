const express = require('express');
const router = express.Router();
const { login, refresh, logout, getMe, changePassword } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { loginValidator, changePasswordValidator } = require('../validators/authValidators');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/login', authLimiter, loginValidator, validate, login);
router.post('/refresh', refresh);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePasswordValidator, validate, changePassword);

module.exports = router;
