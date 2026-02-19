const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Register all models
require('../src/models/User');
require('../src/models/Student');
require('../src/models/Teacher');
require('../src/models/Parent');
require('../src/models/Admin');
require('../src/models/Session');
require('../src/models/Attendance');
require('../src/models/MentoringNote');
require('../src/models/Announcement');
require('../src/models/Feedback');
require('../src/models/ActivityLog');
require('../src/models/Notification');
const SystemSetting = require('../src/models/SystemSetting');

const seedUsers = require('./users.seed');
const seedSessions = require('./sessions.seed');
const seedAttendance = require('./attendance.seed');
const seedNotes = require('./notes.seed');
const seedAnnouncements = require('./announcements.seed');
const seedFeedback = require('./feedback.seed');
const seedActivityLog = require('./activityLog.seed');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecs-mentoring';

async function seed() {
  try {
    console.log('\n🌱 ECS Mentoring Portal — Database Seeder');
    console.log('==========================================');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    console.log('⚠️  Dropping existing collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      await mongoose.connection.db.dropCollection(col.name);
    }
    console.log(`✅ Dropped ${collections.length} collection(s)\n`);

    console.log('👥 Seeding users...');
    const users = await seedUsers();

    console.log('\n📅 Seeding sessions...');
    const sessions = await seedSessions(users);

    console.log('\n✅ Seeding attendance...');
    await seedAttendance(users, sessions);

    console.log('\n📝 Seeding mentoring notes...');
    await seedNotes(users);

    console.log('\n📢 Seeding announcements...');
    await seedAnnouncements(users);

    console.log('\n⭐ Seeding feedback...');
    await seedFeedback(users, sessions);

    console.log('\n📊 Seeding activity log...');
    await seedActivityLog(users);

    console.log('\n⚙️  Seeding system settings...');
    await SystemSetting.create([
      { key: 'academic_year', value: '2025-26', description: 'Current academic year' },
      { key: 'department_name', value: 'Electronics & Computer Science', description: 'Department full name' },
      { key: 'department_code', value: 'ECS', description: 'Department short code' },
      { key: 'college_name', value: 'National Engineering College', description: 'Institution name' },
      { key: 'max_students_per_mentor', value: 20, description: 'Maximum students assignable to one mentor' },
      { key: 'health_score_weights', value: { attendance: 40, feedback: 20, engagement: 15, academic: 15, notes: 10 }, description: 'Health score weights' },
      { key: 'session_reminder_hours', value: 24, description: 'Hours before session to send reminder' },
    ]);
    console.log('  ✓ 7 system settings');

    console.log('\n==========================================');
    console.log('✅ Seed completed successfully!');
    console.log('==========================================');
    console.log('\n🔐 Login Credentials (password: password123)');
    console.log('  Admin:    admin@ecs.edu');
    console.log('  Teacher:  anita.sharma@ecs.edu');
    console.log('  Teacher:  vikram.patel@ecs.edu');
    console.log('  Teacher:  meera.desai@ecs.edu');
    console.log('  Student:  aarav.mehta@ecs.edu');
    console.log('  Student:  priya.nair@ecs.edu');
    console.log('  Student:  nikhil.joshi@ecs.edu');
    console.log('  Parent:   suresh.mehta@gmail.com');
    console.log('  Parent:   lakshmi.nair@gmail.com');
    console.log('==========================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

seed();
