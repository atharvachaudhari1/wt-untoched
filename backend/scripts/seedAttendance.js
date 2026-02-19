/**
 * Seed students from EDA Attendance report (Excel).
 * Usage (from backend folder):
 *   set ATTENDANCE_XLS_PATH=d:\EDA Attendance report as on 4th Sept.xls
 *   npm run seed-attendance
 * Or copy the .xls file to backend/scripts/ as "EDA Attendance report as on 4th Sept.xls" and run:
 *   npm run seed-attendance
 *
 * Creates User (student) + StudentProfile for each row. Default password: student123
 * Department: ECS, Year: 2 (second year).
 */
require('dotenv').config();
const path = require('path');
const XLSX = require('xlsx');
const mongoose = require('mongoose');
const { User, StudentProfile, TeacherProfile } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecs_mentoring';
const DEFAULT_XLS_PATH = path.resolve(__dirname, 'EDA Attendance report as on 4th Sept.xls');
const XLS_PATH = process.env.ATTENDANCE_XLS_PATH || process.argv[2] || DEFAULT_XLS_PATH;
const DEFAULT_PASSWORD = process.env.SEED_STUDENT_PASSWORD || 'student123';
const DEPARTMENT = 'ECS';
const YEAR = 2;

function findColumnKey(obj, ...patterns) {
  const keys = Object.keys(obj || {});
  const lower = (s) => (s == null ? '' : String(s).toLowerCase());
  for (const key of keys) {
    const k = lower(key).replace(/\s/g, '');
    for (const p of patterns) {
      if (k.includes(lower(p).replace(/\s/g, ''))) return key;
    }
  }
  return null;
}

function getCell(row, key) {
  if (!key || row[key] == null) return '';
  const v = row[key];
  if (typeof v === 'number') return String(v).trim();
  return String(v).trim();
}

async function run() {
  let workbook;
  try {
    workbook = XLSX.readFile(XLS_PATH);
  } catch (e) {
    console.error('Could not read file:', XLS_PATH);
    console.error('Set ATTENDANCE_XLS_PATH or pass path as first argument, or copy the file to backend/scripts/');
    process.exit(1);
  }

  const sheetName = workbook.SheetNames[0];
  const ws = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (!rawRows.length) {
    console.log('No rows in sheet.');
    process.exit(0);
  }

  function cellStr(val) {
    if (val == null) return '';
    return String(val).trim();
  }
  function looksLikeHeader(cell) {
    const s = cellStr(cell).toLowerCase();
    return /roll|name|student|candidate|reg|registration|sr\.?\s*no|s\.?no/.test(s);
  }

  let headerRowIndex = -1;
  let rollCol = -1;
  let nameCol = -1;
  for (let r = 0; r < Math.min(15, rawRows.length); r++) {
    const row = rawRows[r] || [];
    for (let c = 0; c < row.length; c++) {
      const cell = cellStr(row[c]).toLowerCase();
      if (cell && looksLikeHeader(row[c])) {
        if (headerRowIndex < 0) headerRowIndex = r;
        if (/roll|reg|registration|sr\.?\s*no|s\.?no/.test(cell) && rollCol < 0) rollCol = c;
        if (/name|student|candidate/.test(cell) && nameCol < 0) nameCol = c;
      }
    }
    if (headerRowIndex >= 0 && (rollCol >= 0 || nameCol >= 0)) break;
  }

  if (headerRowIndex < 0 || (rollCol < 0 && nameCol < 0)) {
    console.log('Sample of first 3 rows:', rawRows.slice(0, 3));
    console.log('Could not detect Roll No or Name column. Ensure the sheet has a header row with "Roll" or "Name".');
    process.exit(1);
  }

  const dataRows = rawRows.slice(headerRowIndex + 1).filter((row) => {
    const r = rollCol >= 0 ? cellStr((row || [])[rollCol]) : '';
    const n = nameCol >= 0 ? cellStr((row || [])[nameCol]) : '';
    return r || n;
  });

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB. Importing from:', XLS_PATH, '| Rows:', dataRows.length);

  let teacherProfile = await TeacherProfile.findOne();
  if (!teacherProfile) {
    console.log('No teacher in DB. Run seed.js first so at least one teacher exists for mentor assignment.');
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i] || [];
    const rollNo = rollCol >= 0 ? cellStr(row[rollCol]) : '';
    const name = nameCol >= 0 ? cellStr(row[nameCol]) : '';
    const rollStr = (rollNo || name || 'row' + i).toString().trim();
    const nameStr = (name || rollStr || 'Student').toString().trim();
    if (!rollStr && !nameStr) {
      skipped++;
      continue;
    }
    const emailLocal = rollStr.toLowerCase().replace(/\s/g, '').replace(/[^a-z0-9._-]/g, '');
    const email = emailLocal ? emailLocal + '@ecs.edu' : 'student' + i + '@ecs.edu';
    if (!email || email === '@ecs.edu') {
      skipped++;
      continue;
    }

    let user = await User.findOne({ email }).select('+password');
    if (user) {
      user.name = nameStr;
      user.password = DEFAULT_PASSWORD;
      await user.save();
      let profile = await StudentProfile.findOne({ user: user._id });
      if (!profile) {
        profile = await StudentProfile.create({
          user: user._id,
          rollNo: rollStr,
          department: DEPARTMENT,
          year: YEAR,
          mentor: teacherProfile ? teacherProfile._id : null,
        });
        user.profileId = profile._id;
        user.profileModel = 'StudentProfile';
        await user.save();
        created++;
      } else {
        profile.rollNo = rollStr;
        profile.department = DEPARTMENT;
        profile.year = YEAR;
        await profile.save();
        updated++;
      }
    } else {
      user = await User.create({
        email,
        password: DEFAULT_PASSWORD,
        name: nameStr,
        role: 'student',
      });
      const profile = await StudentProfile.create({
        user: user._id,
        rollNo: rollStr,
        department: DEPARTMENT,
        year: YEAR,
        mentor: teacherProfile ? teacherProfile._id : null,
      });
      user.profileId = profile._id;
      user.profileModel = 'StudentProfile';
      await user.save();
      if (teacherProfile && !teacherProfile.assignedStudents.some(id => id.toString() === profile._id.toString())) {
        teacherProfile.assignedStudents.push(profile._id);
        await teacherProfile.save();
      }
      created++;
    }
  }

  console.log('Done. Created:', created, 'Updated:', updated, 'Skipped:', skipped);
  console.log('Students can log in with email: <rollno>@ecs.edu, password:', DEFAULT_PASSWORD);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
