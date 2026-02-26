/**
 * Ensure mentor godbole@fragnel.edu exists and can log in (password: mentor123).
 * Run from backend folder: node scripts/ensureGodboleMentor.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { User, TeacherProfile } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ecs_mentoring';
const EMAIL = 'godbole@fragnel.edu';
const PASSWORD = 'mentor123';
const NAME = 'Prof. Godbole';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  let user = await User.findOne({ email: EMAIL }).select('+password');
  if (user) {
    user.password = PASSWORD;
    user.name = NAME;
    user.role = 'teacher';
    await user.save();
    console.log('Updated existing user:', EMAIL, '| password reset to:', PASSWORD);
  } else {
    user = await User.create({
      email: EMAIL,
      password: PASSWORD,
      name: NAME,
      role: 'teacher',
    });
    console.log('Created user:', EMAIL, '| password:', PASSWORD);
  }

  let profile = await TeacherProfile.findOne({ user: user._id });
  if (!profile) {
    profile = await TeacherProfile.create({
      user: user._id,
      department: 'ECS',
      designation: 'Mentor',
      assignedStudents: [],
    });
    user.profileId = profile._id;
    user.profileModel = 'TeacherProfile';
    await user.save();
    console.log('Created TeacherProfile for', EMAIL);
  }

  console.log('\n--- Login ---');
  console.log('Email:', EMAIL);
  console.log('Password:', PASSWORD);
  console.log('Role: Teacher (select Teacher on login page)');
  console.log('Refresh Admin → Mentors to see Prof. Godbole in the list.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
