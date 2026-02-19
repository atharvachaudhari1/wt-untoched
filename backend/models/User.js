/**
 * User model - base account for all roles (student, teacher, parent, admin).
 * Links to role-specific profile via profileId.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 5, // allow 5-digit roll numbers as student password
      select: false, // don't return password in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'parent', 'admin'],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'profileModel',
      default: null,
    },
    profileModel: {
      type: String,
      enum: ['StudentProfile', 'TeacherProfile', 'ParentProfile', null],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
