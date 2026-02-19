const Student = require('../src/models/Student');
const Teacher = require('../src/models/Teacher');
const Parent = require('../src/models/Parent');
const Admin = require('../src/models/Admin');

async function seedUsers() {
  const admin = await Admin.create({
    name: 'Dr. Rajesh Kumar', email: 'admin@ecs.edu', password: 'password123',
    role: 'admin', phone: '9876543210', department: 'ECS', isSuperAdmin: true,
  });

  const anita = await Teacher.create({
    name: 'Prof. Anita Sharma', email: 'anita.sharma@ecs.edu', password: 'password123',
    role: 'teacher', phone: '9876543211', employeeId: 'ECS-T001',
    designation: 'Associate Professor', specialization: 'Machine Learning',
  });
  const vikram = await Teacher.create({
    name: 'Prof. Vikram Patel', email: 'vikram.patel@ecs.edu', password: 'password123',
    role: 'teacher', phone: '9876543212', employeeId: 'ECS-T002',
    designation: 'Assistant Professor', specialization: 'Embedded Systems',
  });
  const meera = await Teacher.create({
    name: 'Prof. Meera Desai', email: 'meera.desai@ecs.edu', password: 'password123',
    role: 'teacher', phone: '9876543213', employeeId: 'ECS-T003',
    designation: 'Professor', specialization: 'Data Science',
  });
  console.log('  ✓ 3 teachers');

  const aarav = await Student.create({ name: 'Aarav Mehta', email: 'aarav.mehta@ecs.edu', password: 'password123', role: 'student', rollNumber: 'ECS2023001', semester: 4, section: 'A', batch: '2023-27', mentor: anita._id, academicInfo: { cgpa: 8.5, backlogs: 0 } });
  const priya = await Student.create({ name: 'Priya Nair', email: 'priya.nair@ecs.edu', password: 'password123', role: 'student', rollNumber: 'ECS2023002', semester: 4, section: 'A', batch: '2023-27', mentor: anita._id, academicInfo: { cgpa: 9.1, backlogs: 0 } });
  const rohan = await Student.create({ name: 'Rohan Singh', email: 'rohan.singh@ecs.edu', password: 'password123', role: 'student', rollNumber: 'ECS2023003', semester: 4, section: 'B', batch: '2023-27', mentor: anita._id, academicInfo: { cgpa: 6.8, backlogs: 2 } });
  const sneha = await Student.create({ name: 'Sneha Iyer', email: 'sneha.iyer@ecs.edu', password: 'password123', role: 'student', rollNumber: 'ECS2023004', semester: 6, section: 'A', batch: '2022-26', mentor: vikram._id, academicInfo: { cgpa: 7.9, backlogs: 1 } });
  const arjun = await Student.create({ name: 'Arjun Das', email: 'arjun.das@ecs.edu', password: 'password123', role: 'student', rollNumber: 'ECS2023005', semester: 6, section: 'B', batch: '2022-26', mentor: vikram._id, academicInfo: { cgpa: 8.2, backlogs: 0 } });
  const kavya = await Student.create({ name: 'Kavya Reddy', email: 'kavya.reddy@ecs.edu', password: 'password123', role: 'student', rollNumber: 'ECS2023006', semester: 2, section: 'A', batch: '2024-28', mentor: meera._id, academicInfo: { cgpa: 9.4, backlogs: 0 } });
  const nikhil = await Student.create({ name: 'Nikhil Joshi', email: 'nikhil.joshi@ecs.edu', password: 'password123', role: 'student', rollNumber: 'ECS2023007', semester: 4, section: 'A', batch: '2023-27', mentor: anita._id, academicInfo: { cgpa: 5.2, backlogs: 3 } });
  const divya = await Student.create({ name: 'Divya Kulkarni', email: 'divya.kulkarni@ecs.edu', password: 'password123', role: 'student', rollNumber: 'ECS2023008', semester: 6, section: 'A', batch: '2022-26', mentor: meera._id, academicInfo: { cgpa: 8.8, backlogs: 0 } });
  console.log('  ✓ 8 students');

  // Update teacher assigned students arrays
  await Teacher.findByIdAndUpdate(anita._id, { assignedStudents: [aarav._id, priya._id, rohan._id, nikhil._id] });
  await Teacher.findByIdAndUpdate(vikram._id, { assignedStudents: [sneha._id, arjun._id] });
  await Teacher.findByIdAndUpdate(meera._id, { assignedStudents: [kavya._id, divya._id] });

  const suresh = await Parent.create({ name: 'Suresh Mehta', email: 'suresh.mehta@gmail.com', password: 'password123', role: 'parent', phone: '9876543220', relation: 'father', occupation: 'Business Owner', children: [aarav._id] });
  const lakshmi = await Parent.create({ name: 'Lakshmi Nair', email: 'lakshmi.nair@gmail.com', password: 'password123', role: 'parent', phone: '9876543221', relation: 'mother', occupation: 'Software Engineer', children: [priya._id] });
  const rajendra = await Parent.create({ name: 'Rajendra Singh', email: 'rajendra.singh@gmail.com', password: 'password123', role: 'parent', phone: '9876543222', relation: 'father', occupation: 'Government Officer', children: [rohan._id] });
  const padma = await Parent.create({ name: 'Padma Iyer', email: 'padma.iyer@gmail.com', password: 'password123', role: 'parent', phone: '9876543223', relation: 'mother', occupation: 'Teacher', children: [sneha._id] });
  console.log('  ✓ 4 parents');

  // Link parents to students
  await Student.findByIdAndUpdate(aarav._id, { parentId: suresh._id });
  await Student.findByIdAndUpdate(priya._id, { parentId: lakshmi._id });
  await Student.findByIdAndUpdate(rohan._id, { parentId: rajendra._id });
  await Student.findByIdAndUpdate(sneha._id, { parentId: padma._id });

  return { admin, anita, vikram, meera, aarav, priya, rohan, sneha, arjun, kavya, nikhil, divya, suresh, lakshmi, rajendra, padma };
}

module.exports = seedUsers;
