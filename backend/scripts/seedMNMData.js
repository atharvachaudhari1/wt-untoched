/**
 * Seed MNM (Mathematics and Numerical Methods) attendance from inline data.
 * Creates/updates CourseAttendance so each student sees MNM in "My progress" → Course attendance.
 *
 * Run from backend folder: node scripts/seedMNMData.js
 * Or: npm run seed-mnm-data (if added to package.json)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { User, StudentProfile, CourseAttendance } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ecs_mentoring';
const DEFAULT_DEPARTMENT = 'ECS';
const DEFAULT_YEAR = 2;
const DEFAULT_PASSWORD = 'student123';
const MNM_COURSE_CODE = 'MNM';
const MNM_COURSE_NAME = 'Mathematics and Numerical Methods';
const TOTAL_LECTURES = 13;

// MNM Attendance: roll_no, name, total_attended, percentage
const MNM_ATTENDANCE = [
  [10514, 'Adipelly Priyal Ravi', 11, 85],
  [10516, 'Almeida Evan Vijay', 13, 100],
  [10517, 'Ansari Obaid Ashfaq', 10, 77],
  [10518, 'Athalye Nishad Prasanna', 10, 77],
  [10519, 'Atul Thomas George', 13, 100],
  [10520, 'Bafna Jinish Hitesh', 10, 77],
  [10521, 'Bandgar Soham Sanjay', 11, 85],
  [10522, 'Bhuwad Kaashish Rajesh', 11, 85],
  [10523, 'Chamoli Saanvi Premlal', 12, 92],
  [10524, 'Chaudhari Atharva Pruthviraj', 10, 77],
  [10525, 'Chaurasia Vaidehi Sanjay', 11, 85],
  [10526, 'Chavan Bhoomi Santosh', 10, 77],
  [10527, 'Dabre Bonny Novel', 9, 69],
  [10528, 'Dcruz Thea Malcolm', 12, 92],
  [10529, 'Dsouza Brandon Martin', 8, 62],
  [10530, 'Fernandes Allan Francisco', 12, 92],
  [10531, 'Fernandes Caleb Paul', 13, 100],
  [10532, 'Fernandes Jostal Michael', 11, 85],
  [10533, 'Furtado Adolf Onil', 8, 62],
  [10534, 'Furtado Roosvel Ross Derick', 10, 77],
  [10535, 'Gadkari Atharrva Uday', 9, 69],
  [10536, 'Ghadi Manasvi Rajesh', 9, 69],
  [10537, 'Jaiswal Aryan Bablu', 10, 77],
  [10538, 'Jakkani Aayan Gangaprasad', 12, 92],
  [10539, 'Jhawar Keshav Arun Kumar', 11, 85],
  [10540, 'Jhawar Krishna Anil', 11, 85],
  [10541, 'Joel Wilfred', 3, 23],
  [10542, 'John Mathew Abraham', 13, 100],
  [10543, 'Joshi Karnav Niraj', 10, 77],
  [10544, 'Justin Shania Shanon', 9, 69],
  [10545, 'Kannamkunil Kristina Thomas', 11, 85],
  [10546, 'Kotian Sharanya Santosh', 12, 92],
  [10548, 'Lad Aarya Virag', 13, 100],
  [10549, 'Lobo Aaron Melville', 12, 92],
  [10550, 'Machado Nash Kevin', 11, 85],
  [10551, 'Malvankar Shivam Samir', 10, 77],
  [10554, 'Munde Rutuja Madhukar', 9, 69],
  [10555, 'Nadar Sagaya Agnel Gnana T.', 13, 100],
  [10556, 'Nahar Sanchit', 12, 92],
  [10557, 'Naik Disha Vikas', 11, 85],
  [10558, 'Naik Harsh Prasad', 12, 92],
  [10559, 'Patil Vedant Ramkrishna', 11, 85],
  [10560, 'Porwal Anushka Pramod', 10, 77],
  [10561, 'Rai Smruti Shivram', 12, 92],
  [10562, 'Raparthy Vinay Dasharath', 11, 85],
  [10563, 'Reddy Arnav Manoj', 5, 38],
  [10564, 'Reddy Sarissha Bhaskar', 8, 62],
  [10565, 'Rodricks Jadon Dominic', 11, 85],
  [10566, 'Rodrigues Breyon Rajesh', 9, 69],
  [10567, 'Sequeira Sheldon Samuel', 10, 77],
  [10568, 'Shahe Anushha Krishna', 12, 92],
  [10570, 'Sharma Neetish', 13, 100],
  [10571, 'Sharma Pranay Mohinderpal', 12, 92],
  [10572, 'Shetty Shloka Jayaprakash', 12, 92],
  [10573, 'Shivare Samarth Arun', 11, 85],
  [10574, 'Singh Amogh Ashutosh', 11, 85],
  [10575, 'Tellis Orrin Fabian', 10, 77],
  [10576, 'Tiwari Shaury Ashish', 11, 85],
  [10577, 'Yadav Aditya Indrajeet', 9, 69],
  [9863, 'Sharma Anurag', 13, 100],
  [10389, 'Saneesh', 13, 100],
  [9489, 'Shahaan Tufail', 13, 100],
  [10897, 'Chavan Sahil Nitin', 13, 100],
  [10898, 'Coutinho Ronan Moris', 6, 46],
  [10899, 'Dabre Dan Denis', 10, 77],
  [10900, 'Dabre Dean Denis', 10, 77],
  [10901, 'Gonsalves Naysa Albert', 8, 62],
  [10902, 'Manjrekar Advait Sunil', 9, 69],
  [10903, 'Patil Manasvi Balkrishna', 12, 92],
  [10904, 'Patil Rohit Arun', 13, 100],
  [10905, 'Sankhe Shravani Mangesh', 8, 62],
  [10906, 'Sequeira Julius Rocky', 7, 54],
  [10907, 'Vaz Ansh Rajesh', 11, 85],
];

function normalizeRoll(rollRaw) {
  if (rollRaw == null || rollRaw === '') return '';
  return String(rollRaw).trim();
}

async function findOrCreateStudent(rollStr, name) {
  if (!rollStr) return null;
  const emailEcs = rollStr.toLowerCase() + '@ecs.edu';
  const password = rollStr.length >= 4 ? rollStr : DEFAULT_PASSWORD;
  const displayName = (name && String(name).trim()) || 'Student ' + rollStr;

  let user = await User.findOne({ email: emailEcs }).select('+password');
  if (user) {
    user.name = displayName;
    user.role = 'student';
    user.password = password;
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
  console.log('Seeding MNM attendance (Total Lectures =', TOTAL_LECTURES + ')...');

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of MNM_ATTENDANCE) {
    const rollRaw = row[0];
    const name = row[1];
    const attended = typeof row[2] === 'number' ? row[2] : parseInt(String(row[2]), 10);
    const percentage = typeof row[3] === 'number' ? row[3] : parseFloat(String(row[3])) || 0;

    const rollStr = normalizeRoll(rollRaw);
    if (!rollStr) {
      skipped++;
      continue;
    }

    try {
      const profile = await findOrCreateStudent(rollStr, name);
      if (!profile) {
        skipped++;
        continue;
      }

      const existed = await CourseAttendance.findOne({ student: profile._id, courseCode: MNM_COURSE_CODE });
      if (existed) {
        existed.totalLectures = TOTAL_LECTURES;
        existed.attended = attended;
        existed.percentage = percentage;
        await existed.save();
        updated++;
      } else {
        await CourseAttendance.create({
          student: profile._id,
          courseCode: MNM_COURSE_CODE,
          courseName: MNM_COURSE_NAME,
          totalLectures: TOTAL_LECTURES,
          attended,
          percentage,
        });
        created++;
      }
    } catch (err) {
      console.error('Roll', rollStr, err.message);
      skipped++;
    }
  }

  console.log('MNM seed done. Created:', created, 'Updated:', updated, 'Skipped:', skipped);
  console.log('Students can log in (rollno@ecs.edu, password = roll number) and see MNM in My progress → Course attendance.');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
