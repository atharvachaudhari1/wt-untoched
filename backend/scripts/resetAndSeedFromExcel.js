/**
 * Wipe MongoDB and re-seed from the Excel sheet only. Everything is new.
 * Creates: admin user + all students (and MNM course attendance) from Excel.
 *
 * Run from backend folder:
 *   node scripts/resetAndSeedFromExcel.js "C:\Users\Lenovo\Desktop\Attendance_MNM.xlsx"
 * Or set MNM_XLS_PATH in .env and: npm run reset-db
 * With path: npm run reset-db -- "C:\path\to\Attendance_MNM.xlsx"
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
const ADMIN_EMAIL = 'admin@ecs.edu';
const ADMIN_PASSWORD = 'admin123';

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

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) throw new Error('No database connection');
  await db.dropDatabase();
  console.log('Dropped database. Starting fresh.');

  // 1) Create admin user only
  await User.create({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name: 'Admin User',
    role: 'admin',
  });
  console.log('Created admin:', ADMIN_EMAIL, '/', ADMIN_PASSWORD);

  // 2) Seed all students and MNM data from Excel
  console.log('Reading Excel:', xlsxPath);
  const wb = XLSX.readFile(xlsxPath);
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  const dataStart = 2;
  const logins = [];
  let created = 0;

  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    const rollRaw = row[0];
    const name = row[1];
    const attendedRaw = row[2];
    const pctRaw = row[3];

    const rollStr = normalizeRoll(rollRaw);
    if (!rollStr) {
      if (rollRaw === '' && cellStr(name) === '' && attendedRaw === '') break;
      continue;
    }

    const emailEcs = rollStr.toLowerCase() + '@ecs.edu';
    const password = rollStr.length >= 5 ? rollStr : DEFAULT_PASSWORD;
    const displayName = name && cellStr(name) ? cellStr(name) : 'Student ' + rollStr;

    const user = await User.create({
      email: emailEcs,
      password,
      name: displayName,
      role: 'student',
    });

    const profile = await StudentProfile.create({
      user: user._id,
      rollNo: rollStr,
      department: DEFAULT_DEPARTMENT,
      year: DEFAULT_YEAR,
    });
    user.profileId = profile._id;
    user.profileModel = 'StudentProfile';
    await user.save();

    const attended = typeof attendedRaw === 'number' ? attendedRaw : parseInt(cellStr(attendedRaw), 10);
    const percentage = typeof pctRaw === 'number' ? pctRaw : parseFloat(cellStr(pctRaw)) || 0;
    await CourseAttendance.create({
      student: profile._id,
      courseCode: MNM_COURSE_CODE,
      courseName: MNM_COURSE_NAME,
      totalLectures: TOTAL_LECTURES,
      attended: isNaN(attended) ? 0 : attended,
      percentage: isNaN(percentage) ? 0 : percentage,
    });
    created++;
    logins.push({ roll: rollStr, email: emailEcs, password });
  }

  console.log('Created', created, 'students from Excel. All can log in with:');
  console.log('  Email: rollno@ecs.edu, Password: roll number (e.g. 10514), Role: Student');
  if (logins.length <= 15) {
    console.log('Logins:', logins);
  } else {
    console.log('First 5:', logins.slice(0, 5));
    console.log('Last 5:', logins.slice(-5));
  }
  console.log('Admin:', ADMIN_EMAIL, '/', ADMIN_PASSWORD);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
