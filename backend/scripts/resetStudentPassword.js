/**
 * Reset a student's password to their roll number so they can log in.
 * Run from backend folder: node scripts/resetStudentPassword.js <rollNo>
 * Example: node scripts/resetStudentPassword.js 10514
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { User, StudentProfile } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecs_mentoring';
const DEFAULT_PASSWORD = 'student123';

async function run() {
  const rollRaw = process.argv[2];
  if (!rollRaw) {
    console.log('Usage: node scripts/resetStudentPassword.js <rollNo>');
    console.log('Example: node scripts/resetStudentPassword.js 10514');
    process.exit(1);
  }
  const rollStr = String(rollRaw).trim().toLowerCase();
  const password = rollStr.length >= 5 ? rollStr : DEFAULT_PASSWORD;

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const profile = await StudentProfile.findOne({ rollNo: rollStr });
  if (!profile) {
    console.log('No student found with roll no:', rollStr);
    process.exit(1);
  }

  const user = await User.findById(profile.user).select('+password');
  if (!user) {
    console.log('No user linked to this student profile.');
    process.exit(1);
  }

  user.password = password;
  await user.save();
  console.log('Password reset for roll', rollStr);
  console.log('Login with:');
  console.log('  Email:   ', user.email);
  console.log('  Password:', password);
  console.log('  Role:    Student');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
