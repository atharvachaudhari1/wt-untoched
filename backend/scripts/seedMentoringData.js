/**
 * Bulk insert mentoring data: mentors (teachers) + students, with assignments.
 * Run: node scripts/seedMentoringData.js (from backend folder)
 * Or: npm run seed-mentoring (if added to package.json)
 *
 * Student login: email = rollno@crce.edu.in, password = roll no (e.g. 10514).
 * Mentor login: email = mentor slug @crce.edu.in, password = mentor123 (see output).
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { User, StudentProfile, TeacherProfile, Session } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecs_mentoring';
const DEFAULT_DEPARTMENT = 'ECS';
const DEFAULT_YEAR = 2;
const MENTOR_DEFAULT_PASSWORD = 'mentor123';

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
  return slugify(name) + '@crce.edu.in';
}

function studentPassword(roll) {
  return String(roll).trim();
}

const mentoringData = [
  {
    mentorName: 'Dr. D.V. Bhoir',
    students: [
      { roll: '10514', name: 'ADIPILLY PRIYAL RAVI' },
      { roll: '10573', name: 'SHIVARE SAMARTH ARUN' },
      { roll: '10574', name: 'SINGH AMOGH ASHUTOSH' },
      { roll: '10575', name: 'TELLIS ORRIN FABIAN' },
      { roll: '10576', name: 'TIWARI SHAURY ASHISH' },
      { roll: '10577', name: 'YADAV ADITYA INDRAJEET' },
      { roll: '10529', name: 'DSOUZA BRANDON MARTIN' },
    ],
  },
  {
    mentorName: 'Dr. Swapnali Makdey',
    students: [
      { roll: '10517', name: 'ANSARI OBAID ASHFAQ' },
      { roll: '10562', name: 'RAPARTHY VINAY DASHARATH' },
      { roll: '10563', name: 'REDDY ARNAV MANOJ' },
      { roll: '10564', name: 'REDDY SARISHKA BHASKAR' },
      { roll: '10565', name: 'RODRICKS JADON DOMINIC' },
      { roll: '10566', name: 'RODRIGUES BREYON RAJESH' },
      { roll: '10567', name: 'SEQUEIRA SHELDON SAMUEL' },
    ],
  },
  {
    mentorName: 'Prof. Archana Lopes',
    students: [
      { roll: '10519', name: 'ATUL THOMAS GEORGE' },
      { roll: '10549', name: 'LOBO AARON MELVILLE' },
      { roll: '10550', name: 'MACHADO NASH KEVIN' },
      { roll: '10551', name: 'MALVANKAR SHIVAM SAMIR' },
      { roll: '10552', name: 'MARK ELISH JOHNSON' },
      { roll: '10553', name: 'MOMIN JUNAID JAVID' },
      { roll: '10554', name: 'MUNDE RUTUJA MADHUKAR' },
    ],
  },
  {
    mentorName: 'Dr. Sailakshmi Paravathi',
    students: [
      { roll: '10522', name: 'BHUWAD KAASHISH RAJESH' },
      { roll: '10530', name: 'FERNANDES ALLAN FRANCISCO' },
      { roll: '10531', name: 'FERNANDES CALEB PAUL' },
      { roll: '10532', name: 'FERNANDES JOSTAL MICHAEL' },
      { roll: '10533', name: 'FURTADO ADOLF ONIL' },
      { roll: '10534', name: 'FURTADO ROOSVEL ROSS DERICK' },
      { roll: '10535', name: 'GADKARI ATHARRVA UDAY' },
      { roll: '10536', name: 'GHADI MANASVI RAJESH' },
      { roll: '10537', name: 'JAISWAL ARYAN BABLU' },
    ],
  },
  {
    mentorName: 'Dr. Inderkumar Kochar',
    students: [
      { roll: '10523', name: 'CHAMOLI SAANVI PREMLAL' },
      { roll: '10524', name: 'CHAUDHARI ATHARVA PRUTHVIRAJ' },
      { roll: '10525', name: 'CHAURASIA VAIDEHI SANJAY' },
      { roll: '10526', name: 'CHAVAN BHOOMI SANTOSH' },
      { roll: '10527', name: 'DABRE BONNY NOVEL' },
      { roll: '10528', name: 'DCRUZ THEA MALCOLM' },
    ],
  },
];

async function findOrCreateMentor(mentorName) {
  const email = mentorEmail(mentorName);
  let user = await User.findOne({ email }).select('+password');
  if (user) {
    if (user.role !== 'teacher') {
      user.role = 'teacher';
      user.name = mentorName;
      user.password = MENTOR_DEFAULT_PASSWORD;
      await user.save();
    }
  } else {
    user = await User.create({
      email,
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
  const email = `${String(roll).trim().toLowerCase()}@crce.edu.in`;
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
      rollNo: String(roll).trim(),
      department: DEFAULT_DEPARTMENT,
      year: DEFAULT_YEAR,
      mentor: mentorProfileId,
    });
    user.profileId = studentProfile._id;
    user.profileModel = 'StudentProfile';
    await user.save();
  } else {
    studentProfile.rollNo = String(roll).trim();
    studentProfile.department = DEFAULT_DEPARTMENT;
    studentProfile.year = DEFAULT_YEAR;
    studentProfile.mentor = mentorProfileId;
    await studentProfile.save();
  }

  return studentProfile;
}

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  let mentorsCreated = 0;
  let studentsCreated = 0;

  for (const group of mentoringData) {
    const teacherProfile = await findOrCreateMentor(group.mentorName);
    const existingCount = await TeacherProfile.countDocuments({ user: teacherProfile.user });
    if (existingCount <= 1) mentorsCreated++;

    const assignedIds = [];

    for (const s of group.students) {
      const studentProfile = await findOrCreateStudent(s.roll, s.name, teacherProfile._id);
      if (!teacherProfile.assignedStudents.some((id) => id.toString() === studentProfile._id.toString())) {
        teacherProfile.assignedStudents.push(studentProfile._id);
      }
      assignedIds.push(studentProfile._id);
      studentsCreated++;
    }

    await teacherProfile.save();

    // Ensure this teacher has at least one "Mentoring" session (for Meet link dropdown)
    const existingSession = await Session.findOne({ teacher: teacherProfile._id, title: 'Mentoring' });
    if (!existingSession) {
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
      console.log('Mentor:', group.mentorName, '| Students:', group.students.length, '| Session: Mentoring created');
    } else {
      console.log('Mentor:', group.mentorName, '| Students:', group.students.length);
    }
  }

  console.log('\n--- Done ---');
  console.log('Mentors processed:', mentoringData.length);
  console.log('Students processed:', studentsCreated);
  console.log('\nStudent login: email = <rollno>@crce.edu.in, password = roll no (e.g. 10514)');
  console.log('Mentor login: email = <slug>@crce.edu.in (e.g. dr-d-v-bhoir@crce.edu.in), password =', MENTOR_DEFAULT_PASSWORD);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
