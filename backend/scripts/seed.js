/**
 * Seed: ensures default login users exist (creates any that are missing).
 * Run standalone: node scripts/seed.js
 * Or runs automatically when server starts.
 */
const { User, StudentProfile, TeacherProfile, ParentProfile, Session } = require('../models');

const DEFAULTS = {
  admin: { email: 'admin@ecs.edu', password: 'admin123', name: 'Admin User', role: 'admin' },
  teacher: { email: 'teacher@ecs.edu', password: 'teacher123', name: 'Sarah Chen', role: 'teacher' },
  student: { email: 'student@ecs.edu', password: 'student123', name: 'Alex Student', role: 'student' },
  parent: { email: 'parent@ecs.edu', password: 'parent123', name: 'Parent User', role: 'parent' },
};

async function ensureUser(email, defaults) {
  let u = await User.findOne({ email });
  if (!u) {
    u = await User.create(defaults);
    return u;
  }
  u = await User.findOne({ email }).select('+password');
  u.password = defaults.password;
  await u.save();
  return u;
}

async function runSeed() {
  let teacherProfile = await TeacherProfile.findOne().populate('user');
  if (!teacherProfile) {
    const u = await ensureUser(DEFAULTS.teacher.email, DEFAULTS.teacher);
    teacherProfile = await TeacherProfile.create({
      user: u._id,
      department: 'CSE',
      designation: 'Associate Professor',
      employeeId: 'EMP001',
    });
    u.profileId = teacherProfile._id;
    u.profileModel = 'TeacherProfile';
    await u.save();
    console.log('Created teacher:', u.email);
  }

  let studentProfile = await StudentProfile.findOne().populate('user');
  if (!studentProfile) {
    const u = await ensureUser(DEFAULTS.student.email, DEFAULTS.student);
    studentProfile = await StudentProfile.create({
      user: u._id,
      rollNo: 'CS2024001',
      department: 'CSE',
      year: 2,
      mentor: teacherProfile._id,
    });
    u.profileId = studentProfile._id;
    u.profileModel = 'StudentProfile';
    await u.save();
    if (!teacherProfile.assignedStudents.some(id => id.toString() === studentProfile._id.toString())) {
      teacherProfile.assignedStudents.push(studentProfile._id);
      await teacherProfile.save();
    }
    console.log('Created student:', u.email);
  }

  await ensureUser(DEFAULTS.admin.email, DEFAULTS.admin);

  let parentUser = await User.findOne({ email: DEFAULTS.parent.email });
  if (!parentUser) {
    parentUser = await ensureUser(DEFAULTS.parent.email, DEFAULTS.parent);
    const parentProfile = await ParentProfile.create({
      user: parentUser._id,
      phone: '9876543210',
      linkedStudents: [studentProfile._id],
    });
    parentUser.profileId = parentProfile._id;
    parentUser.profileModel = 'ParentProfile';
    await parentUser.save();
    console.log('Created parent:', parentUser.email);
  }

  const sessionCount = await Session.countDocuments({ students: studentProfile._id });
  if (sessionCount === 0) {
    const inTwoDays = new Date();
    inTwoDays.setDate(inTwoDays.getDate() + 2);
    const teacherUser = await User.findOne({ email: DEFAULTS.teacher.email });
    await Session.create({
      title: 'UI/UX Fundamentals',
      teacher: teacherProfile._id,
      students: [studentProfile._id],
      scheduledAt: inTwoDays,
      duration: 45,
      meetLink: 'https://meet.google.com/abc-defg-hij',
      createdBy: teacherUser ? teacherUser._id : teacherProfile.user._id,
    });
    console.log('Created sample session for student.');
  }

  console.log('--- Login: student@ecs.edu / student123 (role: Student) ---');
}

if (require.main === module) {
  require('dotenv').config();
  const mongoose = require('mongoose');
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecs_mentoring';
  mongoose.connect(MONGODB_URI)
    .then(() => runSeed())
    .then(() => { console.log('Seed done.'); process.exit(0); })
    .catch((err) => { console.error(err); process.exit(1); });
} else {
  module.exports = { runSeed };
}
