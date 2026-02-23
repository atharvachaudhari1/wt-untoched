/**
 * Seed: ensures default login users exist (creates any that are missing).
 * Run standalone: node scripts/seed.js
 * Or runs automatically when server starts.
 */
const { User, StudentProfile, TeacherProfile, ParentProfile, Session, CourseAttendance } = require('../models');

const DEFAULTS = {
  admin: { email: 'admin@ecs.edu', password: 'admin123', name: 'Admin User', role: 'admin' },
  teachers: [],
  student: null,
  parent: null,
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
  const teacherProfiles = [];
  for (const t of DEFAULTS.teachers) {
    let u = await User.findOne({ email: t.email });
    let profile = u ? await TeacherProfile.findOne({ user: u._id }) : null;
    if (profile) {
      teacherProfiles.push(profile);
      continue;
    }
    u = await ensureUser(t.email, { email: t.email, password: t.password, name: t.name, role: t.role });
    profile = await TeacherProfile.create({
      user: u._id,
      department: t.department || 'CSE',
      designation: t.designation || 'Faculty',
      employeeId: t.employeeId || '',
    });
    u.profileId = profile._id;
    u.profileModel = 'TeacherProfile';
    await u.save();
    console.log('Created teacher:', u.email);
    teacherProfiles.push(profile);
  }
  const teacherProfile = teacherProfiles[0];
  let studentProfile = await StudentProfile.findOne().populate('user');

  if (DEFAULTS.student && teacherProfile) {
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
  }

  await ensureUser(DEFAULTS.admin.email, DEFAULTS.admin);

  if (DEFAULTS.parent && studentProfile) {
    const parentUser = await User.findOne({ email: DEFAULTS.parent.email });
    if (!parentUser) {
      const p = await ensureUser(DEFAULTS.parent.email, DEFAULTS.parent);
      const parentProfile = await ParentProfile.create({
        user: p._id,
        phone: '9876543210',
        linkedStudents: [studentProfile._id],
      });
      p.profileId = parentProfile._id;
      p.profileModel = 'ParentProfile';
      await p.save();
      console.log('Created parent:', p.email);
    }
  }

  if (teacherProfile && studentProfile) {
    const sessionCount = await Session.countDocuments({ students: studentProfile._id });
    if (sessionCount === 0 && DEFAULTS.teachers.length > 0) {
      const inTwoDays = new Date();
      inTwoDays.setDate(inTwoDays.getDate() + 2);
      const teacherUser = await User.findOne({ email: DEFAULTS.teachers[0].email });
      await Session.create({
        title: 'Mentoring',
        teacher: teacherProfile._id,
        students: [studentProfile._id],
        scheduledAt: inTwoDays,
        duration: 45,
        meetLink: 'https://meet.google.com/abc-defg-hij',
        createdBy: teacherUser ? teacherUser._id : teacherProfile.user._id,
      });
      console.log('Created sample session for student.');
    }

    const courseAttendanceCount = await CourseAttendance.countDocuments({ student: studentProfile._id });
    if (courseAttendanceCount === 0) {
      await CourseAttendance.create([
        { student: studentProfile._id, courseCode: 'MATH101', courseName: 'Mathematics', totalLectures: 30, attended: 26, percentage: 86.67 },
        { student: studentProfile._id, courseCode: 'MNM', courseName: 'Mathematics and Numerical Methods', totalLectures: 13, attended: 11, percentage: 84.62 },
      ]);
      console.log('Created sample course attendance for student.');
    }
  }

  console.log('--- Login: admin@ecs.edu / admin123 (Admin). Add mentors/students via seed-ecs2025 or admin UI. ---');
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
