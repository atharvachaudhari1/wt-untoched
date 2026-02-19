/**
 * Authentication controller - login per role, JWT generation.
 */
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * POST /api/auth/login
 * Body: { email, password, role? } - role optional; if provided, validated against user.role
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password, role: requestedRole } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated.' });
    }

    if (requestedRole && user.role !== requestedRole) {
      return res.status(403).json({ success: false, message: 'Login not allowed for this role.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    const userObj = await User.findById(user._id).select('-password');
    return res.status(200).json({
      success: true,
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me - current user (requires auth)
 */
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('profileId', '-__v')
      .select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
