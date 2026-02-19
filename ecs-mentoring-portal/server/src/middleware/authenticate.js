const jwt = require('jsonwebtoken');
const User = require('../models/User');
// Ensure discriminators are registered
require('../models/Student');
require('../models/Teacher');
require('../models/Parent');
require('../models/Admin');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token required');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) throw new ApiError(401, 'User not found');
      if (!user.isActive) throw new ApiError(403, 'Account has been deactivated');

      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      throw new ApiError(401, 'Invalid token');
    }
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
