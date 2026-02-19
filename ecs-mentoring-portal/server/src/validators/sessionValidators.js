const { body, param } = require('express-validator');

const createSessionValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^\d{2}:\d{2}$/).withMessage('Start time must be HH:MM format'),
  body('endTime').matches(/^\d{2}:\d{2}$/).withMessage('End time must be HH:MM format'),
  body('type').optional().isIn(['individual', 'group']).withMessage('Type must be individual or group'),
  body('meetLink').optional().trim(),
  body('description').optional().trim(),
];

const updateSessionValidator = [
  param('id').isMongoId().withMessage('Valid session ID is required'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('startTime').optional().matches(/^\d{2}:\d{2}$/).withMessage('Start time must be HH:MM format'),
  body('endTime').optional().matches(/^\d{2}:\d{2}$/).withMessage('End time must be HH:MM format'),
];

module.exports = { createSessionValidator, updateSessionValidator };
