const { body, param } = require('express-validator');

const createUserValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['student', 'teacher', 'parent', 'admin']).withMessage('Valid role is required'),
  body('phone').optional().trim(),
];

const updateUserValidator = [
  param('id').isMongoId().withMessage('Valid user ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
];

module.exports = { createUserValidator, updateUserValidator };
