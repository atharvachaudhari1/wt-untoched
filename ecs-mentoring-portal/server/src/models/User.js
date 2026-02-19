const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true, minlength: 6, select: false },
  role:         { type: String, required: true, enum: ['student', 'teacher', 'parent', 'admin'] },
  phone:        { type: String, default: '' },
  avatar:       { type: String, default: '' },
  isActive:     { type: Boolean, default: true },
  refreshToken: { type: String, default: null, select: false },
  lastLogin:    { type: Date, default: null },
}, { timestamps: true, discriminatorKey: 'role' });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
