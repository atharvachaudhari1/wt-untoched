/**
 * Seed mentors and students as per SE ECS Mentoring Circular 2025.
 * Assigns each listed mentor to the given list of students.
 *
 * Data source: backend/scripts/ecsMentoring2025Data.js
 * Edit that file with mentor names and student (roll, name) from the PDF.
 *
 * Run from backend folder:
 *   node scripts/seedECSMentoring2025.js
 * Or: npm run seed-ecs2025
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { User, StudentProfile, TeacherProfile, Session } = require('../models');
const mentoringData = require('./ecsMentoring2025Data');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ecs_mentoring';
const DEFAULT_DEPARTMENT = 'ECS';
const DEFAULT_YEAR = 2;
const MENTOR_DEFAULT_PASSWORD = 'mentor123';
const STUDENT_EMAIL_DOMAIN = 'ecs.edu'; // or 'crce.edu.in' – students can use rollno@ecs.edu / rollno@crce.edu.in

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'mentor';
}

function mentorEmail(name) {
  return slugify(name) + '@' + STUDENT_EMAIL_DOMAIN;
}

function studentPassword(roll) {
  return String(roll).trim();
}

async function findOrCreateMentor(mentorName) {
  const email = mentorEmail(mentorName);
  let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (user) {
    if (user.role !== 'teacher') {
      user.role = 'teacher';
      user.name = mentorName;
      user.password = MENTOR_DEFAULT_PASSWORD;
      await user.save();
    }
  } else {
    user = await User.create({
      email: email.toLowerCase(),
      password: MENTOR_DEFAULT_PASSWORD,
      name: mentorName,
      role: 'teacher',
    });
  }

  let teacherProfile = await TeacherProfile.findOne({ user: user._id });
  if (!teacherProfile) {
    teacherProfile = await TeacherProfile.create({
      user: user._id,
      department: DEFAULT_DEPARTMENT,
      designation: 'Mentor',
      assignedStudents: [],
    });
    user.profileId = teacherProfile._id;
    user.profileModel = 'TeacherProfile';
    await user.save();
  }

  return teacherProfile;
}

async function findOrCreateStudent(roll, name, mentorProfileId) {
  const rollStr = String(roll).trim();
  const email = rollStr.toLowerCase() + '@' + STUDENT_EMAIL_DOMAIN;
  const password = studentPassword(roll);

  let user = await User.findOne({ email }).select('+password');
  if (user) {
    user.name = name;
    user.password = password;
    user.role = 'student';
    await user.save();
  } else {
    user = await User.create({
      email,
      password,
      name,
      role: 'student',
    });
  }

  let studentProfile = await StudentProfile.findOne({ user: user._id });
  if (!studentProfile) {
    studentProfile = await StudentProfile.create({
      user: user._id,
      rollNo: rollStr,
      department: DEFAULT_DEPARTMENT,
      year: DEFAULT_YEAR,
      mentor: mentorProfileId,
    });
    user.profileId = studentProfile._id;
    user.profileModel = 'StudentProfile';
    await user.save();
  } else {
    studentProfile.rollNo = rollStr;
    studentProfile.department = DEFAULT_DEPARTMENT;
    studentProfile.year = DEFAULT_YEAR;
    studentProfile.mentor = mentorProfileId;
    await studentProfile.save();
  }

  return studentProfile;
}

async function run() {
  if (!Array.isArray(mentoringData) || mentoringData.length === 0) {
    console.error('No data. Edit backend/scripts/ecsMentoring2025Data.js with mentor and student list from the PDF.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  console.log('SE ECS Mentoring Circular 2025 – assigning mentors to given students...\n');

  let mentorsProcessed = 0;
  let studentsProcessed = 0;

  for (const group of mentoringData) {
    const teacherProfile = await findOrCreateMentor(group.mentorName);
    const assignedIds = [];

    for (const s of group.students || []) {
      const studentProfile = await findOrCreateStudent(s.roll, s.name, teacherProfile._id);
      if (!teacherProfile.assignedStudents.some((id) => id.toString() === studentProfile._id.toString())) {
        teacherProfile.assignedStudents.push(studentProfile._id);
      }
      assignedIds.push(studentProfile._id);
      studentsProcessed++;
    }

    await teacherProfile.save();
    mentorsProcessed++;

    const existingSession = await Session.findOne({ teacher: teacherProfile._id, title: 'Mentoring' });
    if (!existingSession && assignedIds.length > 0) {
      const inOneWeek = new Date();
      inOneWeek.setDate(inOneWeek.getDate() + 7);
      await Session.create({
        title: 'Mentoring',
        teacher: teacherProfile._id,
        students: assignedIds,
        scheduledAt: inOneWeek,
        duration: 45,
        status: 'scheduled',
        createdBy: teacherProfile.user,
      });
    }

    console.log('Mentor:', group.mentorName, '| Assigned students:', (group.students || []).length);
  }

  console.log('\n--- Done (SE ECS Mentoring 2025) ---');
  console.log('Mentors:', mentorsProcessed);
  console.log('Students assigned:', studentsProcessed);
  console.log('\nStudent login: <rollno>@' + STUDENT_EMAIL_DOMAIN + ', password = roll number');
  console.log('Mentor login: <slug>@' + STUDENT_EMAIL_DOMAIN + ' (e.g. dr-d-v-bhoir@' + STUDENT_EMAIL_DOMAIN + '), password:', MENTOR_DEFAULT_PASSWORD);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
