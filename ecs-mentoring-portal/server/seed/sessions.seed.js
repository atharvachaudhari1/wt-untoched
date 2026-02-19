const Session = require('../src/models/Session');

async function seedSessions(users) {
  const { anita, vikram, meera, aarav, priya, rohan, sneha, arjun, kavya, nikhil, divya } = users;

  const sessions = await Session.create([
    { title: 'Semester Progress Review', description: 'Review mid-semester academic performance', mentor: anita._id, date: new Date('2026-01-15'), startTime: '10:00', endTime: '11:00', type: 'group', status: 'completed', targetStudents: [aarav._id, priya._id, rohan._id, nikhil._id] },
    { title: 'Career Guidance Session', description: 'Discuss internship and placement preparation', mentor: anita._id, date: new Date('2026-01-29'), startTime: '14:00', endTime: '15:00', type: 'group', status: 'completed', targetStudents: [aarav._id, priya._id, rohan._id, nikhil._id] },
    { title: 'Individual Check-in: Rohan', description: 'Discuss backlog recovery plan', mentor: anita._id, date: new Date('2026-02-05'), startTime: '11:00', endTime: '11:30', type: 'individual', status: 'completed', targetStudents: [rohan._id] },
    { title: 'Group Mentoring - February', description: 'Monthly mentoring session', mentor: anita._id, date: new Date('2026-02-20'), startTime: '10:00', endTime: '11:00', type: 'group', status: 'scheduled', meetLink: 'https://meet.google.com/abc-defg-hij', targetStudents: [aarav._id, priya._id, rohan._id, nikhil._id] },
    { title: 'Project Discussion', description: 'Review final year project proposals', mentor: vikram._id, date: new Date('2026-01-20'), startTime: '15:00', endTime: '16:00', type: 'group', status: 'completed', targetStudents: [sneha._id, arjun._id] },
    { title: 'Technical Skills Assessment', description: 'Evaluate technical readiness for placements', mentor: vikram._id, date: new Date('2026-02-03'), startTime: '14:00', endTime: '15:00', type: 'group', status: 'completed', targetStudents: [sneha._id, arjun._id] },
    { title: 'Pre-Placement Preparation', description: 'Mock interview practice session', mentor: vikram._id, date: new Date('2026-02-21'), startTime: '14:00', endTime: '15:30', type: 'group', status: 'scheduled', meetLink: 'https://meet.google.com/xyz-uvwx-yz1', targetStudents: [sneha._id, arjun._id] },
    { title: 'Welcome & Introduction', description: 'First mentoring session for new batch', mentor: meera._id, date: new Date('2026-01-10'), startTime: '09:00', endTime: '10:00', type: 'group', status: 'completed', targetStudents: [kavya._id, divya._id] },
    { title: 'Study Plan Discussion', description: 'Help plan semester study schedule', mentor: meera._id, date: new Date('2026-02-07'), startTime: '09:00', endTime: '10:00', type: 'group', status: 'completed', targetStudents: [kavya._id, divya._id] },
    { title: 'Research Opportunities Briefing', description: 'Discuss undergraduate research programs', mentor: meera._id, date: new Date('2026-02-22'), startTime: '09:00', endTime: '10:00', type: 'group', status: 'scheduled', targetStudents: [kavya._id, divya._id] },
    { title: 'Emergency Academic Counseling', description: 'Addressing urgent academic performance concerns', mentor: anita._id, date: new Date('2026-02-19'), startTime: '16:00', endTime: '17:00', type: 'individual', status: 'in_progress', isLive: true, meetLink: 'https://meet.google.com/live-demo-123', targetStudents: [nikhil._id] },
  ]);

  console.log(`  ✓ ${sessions.length} sessions`);
  return sessions;
}

module.exports = seedSessions;
