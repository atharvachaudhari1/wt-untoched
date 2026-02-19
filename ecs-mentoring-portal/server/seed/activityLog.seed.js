const ActivityLog = require('../src/models/ActivityLog');

async function seedActivityLog(users) {
  const { admin, anita, vikram, meera } = users;
  const now = new Date();
  const daysAgo = (d) => new Date(now - d * 24 * 60 * 60 * 1000);
  const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000);

  const activities = [
    { actor: admin._id, action: 'announcement_created', entityType: 'announcement', description: 'Dr. Rajesh Kumar posted "Mid-Semester Examination Schedule Released"', createdAt: daysAgo(14) },
    { actor: anita._id, action: 'session_created', entityType: 'session', description: 'Prof. Anita Sharma created session "Semester Progress Review"', createdAt: daysAgo(13) },
    { actor: anita._id, action: 'attendance_marked', entityType: 'attendance', description: 'Prof. Anita Sharma marked attendance for "Semester Progress Review"', createdAt: daysAgo(12) },
    { actor: vikram._id, action: 'session_created', entityType: 'session', description: 'Prof. Vikram Patel created session "Project Discussion"', createdAt: daysAgo(11) },
    { actor: vikram._id, action: 'note_added', entityType: 'note', description: 'Prof. Vikram Patel added a career note for Sneha Iyer', createdAt: daysAgo(10) },
    { actor: meera._id, action: 'session_created', entityType: 'session', description: 'Prof. Meera Desai created session "Welcome & Introduction"', createdAt: daysAgo(9) },
    { actor: anita._id, action: 'note_added', entityType: 'note', description: 'Prof. Anita Sharma added a critical academic note for Nikhil Joshi', createdAt: daysAgo(8) },
    { actor: admin._id, action: 'user_created', entityType: 'user', description: 'Dr. Rajesh Kumar created student account for Kavya Reddy', createdAt: daysAgo(7) },
    { actor: admin._id, action: 'mentor_assigned', entityType: 'user', description: 'Prof. Meera Desai assigned as mentor for Kavya Reddy', createdAt: daysAgo(7) },
    { actor: vikram._id, action: 'attendance_marked', entityType: 'attendance', description: 'Prof. Vikram Patel marked attendance for "Technical Skills Assessment"', createdAt: daysAgo(5) },
    { actor: meera._id, action: 'attendance_marked', entityType: 'attendance', description: 'Prof. Meera Desai marked attendance for "Study Plan Discussion"', createdAt: daysAgo(4) },
    { actor: anita._id, action: 'session_created', entityType: 'session', description: 'Prof. Anita Sharma created session "Group Mentoring - February"', createdAt: daysAgo(3) },
    { actor: admin._id, action: 'announcement_created', entityType: 'announcement', description: 'Dr. Rajesh Kumar posted "Parent-Teacher Meeting: February 28"', createdAt: daysAgo(2) },
    { actor: anita._id, action: 'note_added', entityType: 'note', description: 'Prof. Anita Sharma added a personal note for Nikhil Joshi', createdAt: daysAgo(1) },
    { actor: anita._id, action: 'session_live', entityType: 'session', description: 'Prof. Anita Sharma started live session "Emergency Academic Counseling"', createdAt: hoursAgo(1) },
  ];

  await ActivityLog.create(activities);
  console.log(`  ✓ ${activities.length} activity log entries`);
}

module.exports = seedActivityLog;
