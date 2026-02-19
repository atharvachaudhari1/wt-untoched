const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateAccessToken = (user) =>
  jwt.sign({ userId: user._id, role: user.role }, env.ACCESS_TOKEN_SECRET, { expiresIn: env.ACCESS_TOKEN_EXPIRY });

const generateRefreshToken = (user) =>
  jwt.sign({ userId: user._id }, env.REFRESH_TOKEN_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRY });

const verifyAccessToken = (token) => jwt.verify(token, env.ACCESS_TOKEN_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, env.REFRESH_TOKEN_SECRET);

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken };
