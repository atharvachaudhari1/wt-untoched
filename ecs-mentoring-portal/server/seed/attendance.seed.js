const Attendance = require('../src/models/Attendance');

async function seedAttendance(users, sessions) {
  const { aarav, priya, rohan, nikhil, sneha, arjun, kavya, divya } = users;
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const records = [];

  for (const session of completedSessions) {
    for (const studentId of session.targetStudents) {
      const sid = studentId.toString();
      let status = 'present';

      if (sid === rohan._id.toString()) {
        const r = Math.random();
        status = r < 0.4 ? 'absent' : r < 0.6 ? 'late' : 'present';
      } else if (sid === nikhil._id.toString()) {
        const r = Math.random();
        status = r < 0.5 ? 'absent' : r < 0.7 ? 'late' : 'present';
      } else if (sid === aarav._id.toString() || sid === priya._id.toString() || sid === kavya._id.toString()) {
        status = 'present';
      } else {
        status = Math.random() > 0.2 ? 'present' : 'late';
      }

      records.push({
        session: session._id, student: studentId, status,
        markedBy: session.mentor, markedAt: session.date,
      });
    }
  }

  if (records.length) await Attendance.create(records);
  console.log(`  ✓ ${records.length} attendance records`);
}

module.exports = seedAttendance;
