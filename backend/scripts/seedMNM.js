/**
 * Seed Mathematics and Numerical Methods (MNM) attendance from Attendance_MNM.xlsx.
 * Creates missing students (User + StudentProfile) so ALL can login and see marks.
 *
 * Run from backend folder:
 *   node scripts/seedMNM.js "C:\Users\Lenovo\Desktop\Attendance_MNM.xlsx"
 */
require('dotenv').config();
const path = require('path');
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const { User, StudentProfile, CourseAttendance } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecs_mentoring';
const DEFAULT_DEPARTMENT = 'ECS';
const DEFAULT_YEAR = 2;
const DEFAULT_PASSWORD = 'student123';
const MNM_COURSE_CODE = 'MNM';
const MNM_COURSE_NAME = 'Mathematics and Numerical Methods';
const TOTAL_LECTURES = 13;

const xlsxPath = process.env.MNM_XLS_PATH || process.argv[2] || path.join(__dirname, '..', '..', 'Attendance_MNM.xlsx');

function cellStr(val) {
  if (val == null) return '';
  return String(val).trim();
}

function normalizeRoll(rollRaw) {
  if (rollRaw == null || rollRaw === '') return '';
  const s = typeof rollRaw === 'number' ? String(rollRaw) : cellStr(rollRaw);
  return s;
}

async function findOrCreateStudent(rollNo, name) {
  const rollStr = normalizeRoll(rollNo);
  if (!rollStr) return null;

  const emailEcs = rollStr.toLowerCase() + '@ecs.edu';
  const emailCrce = rollStr.toLowerCase() + '@crce.edu.in';
  const password = rollStr.length >= 5 ? rollStr : DEFAULT_PASSWORD;
  const displayName = name && cellStr(name) ? cellStr(name) : 'Student ' + rollStr;

  let user = await User.findOne({ email: emailEcs }).select('+password');
  if (!user) user = await User.findOne({ email: emailCrce }).select('+password');
  if (user) {
    user.name = displayName;
    user.role = 'student';
    await user.save();
  } else {
    user = await User.create({
      email: emailEcs,
      password,
      name: displayName,
      role: 'student',
    });
  }

  let profile = await StudentProfile.findOne({ user: user._id });
  if (!profile) {
    profile = await StudentProfile.findOne({ rollNo: rollStr });
    if (profile) {
      profile.user = user._id;
      await profile.save();
    }
  }
  if (!profile) {
    profile = await StudentProfile.create({
      user: user._id,
      rollNo: rollStr,
      department: DEFAULT_DEPARTMENT,
      year: DEFAULT_YEAR,
    });
    user.profileId = profile._id;
    user.profileModel = 'StudentProfile';
    await user.save();
  } else if (profile.rollNo !== rollStr) {
    profile.rollNo = rollStr;
    await profile.save();
  }

  return profile;
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');
  console.log('Reading:', xlsxPath);

  const wb = XLSX.readFile(xlsxPath);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const dataStart = 2;
  const logins = [];

  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    const rollRaw = row[0];
    const name = row[1];
    const attendedRaw = row[2];
    const pctRaw = row[3];

    const rollStr = normalizeRoll(rollRaw);
    if (!rollStr) {
      if (rollRaw === '' && (cellStr(name) === '' && attendedRaw === '')) break;
      skipped++;
      continue;
    }

    const attended = typeof attendedRaw === 'number' ? attendedRaw : parseInt(cellStr(attendedRaw), 10);
    const percentage = typeof pctRaw === 'number' ? pctRaw : parseFloat(cellStr(pctRaw)) || 0;

    try {
      const profile = await findOrCreateStudent(rollStr, name);
      if (!profile) {
        skipped++;
        continue;
      }

      const existed = await CourseAttendance.findOne({ student: profile._id, courseCode: MNM_COURSE_CODE });
      if (existed) {
        existed.totalLectures = TOTAL_LECTURES;
        existed.attended = isNaN(attended) ? existed.attended : attended;
        existed.percentage = isNaN(percentage) ? existed.percentage : percentage;
        await existed.save();
        updated++;
      } else {
        await CourseAttendance.create({
          student: profile._id,
          courseCode: MNM_COURSE_CODE,
          courseName: MNM_COURSE_NAME,
          totalLectures: TOTAL_LECTURES,
          attended: isNaN(attended) ? 0 : attended,
          percentage: isNaN(percentage) ? 0 : percentage,
        });
        created++;
      }
      const pwd = rollStr.length >= 5 ? rollStr : DEFAULT_PASSWORD;
      const u = await User.findById(profile.user).select('email');
      logins.push({ roll: rollStr, email: u ? u.email : rollStr.toLowerCase() + '@ecs.edu', password: pwd });
    } catch (err) {
      console.error('Row', i, 'roll', rollStr, err.message);
      skipped++;
    }
  }

  console.log('MNM seed done. Course records created:', created, 'updated:', updated, 'skipped:', skipped);
  console.log('Student login: email = rollno@ecs.edu, password = roll number (e.g. 10514). Role = Student.');
  if (logins.length <= 10) {
    console.log('Logins:', logins);
  } else {
    console.log('First 5 logins:', logins.slice(0, 5));
    console.log('Last 5 logins:', logins.slice(-5));
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
