const Announcement = require('../src/models/Announcement');

async function seedAnnouncements(users) {
  const { admin, anita, vikram, meera } = users;

  const announcements = await Announcement.create([
    { title: 'Mid-Semester Examination Schedule Released', content: 'The mid-semester examination schedule for all semesters has been published on the college portal. Please check your individual timetables and prepare accordingly.', author: admin._id, scope: 'department', targetRoles: ['student', 'teacher', 'parent'], priority: 'high' },
    { title: 'Mentoring Session Attendance Mandatory', content: 'All students are reminded that attendance in mentoring sessions is mandatory and will be considered for internal assessment. Students with less than 75% attendance may face academic penalties.', author: admin._id, scope: 'department', targetRoles: ['student', 'parent'], priority: 'urgent' },
    { title: 'Placement Drive - Week 3 of March', content: 'Companies including TCS, Infosys, and Wipro will be visiting campus for recruitment. All final-year students must update their profiles on the placement portal by March 10.', author: vikram._id, scope: 'mentor_group', targetRoles: ['student'], priority: 'high' },
    { title: 'Research Paper Submission Deadline Extended', content: 'The deadline for submitting research papers to the department journal has been extended to March 15, 2026. Students interested in publishing should consult their mentors.', author: meera._id, scope: 'department', targetRoles: ['student', 'teacher'], priority: 'medium' },
    { title: 'Parent-Teacher Meeting: February 28', content: 'The next parent-teacher meeting is scheduled for February 28, 2026 from 10:00 AM to 1:00 PM. All parents are requested to attend. Individual mentoring reports will be shared.', author: admin._id, scope: 'department', targetRoles: ['parent', 'teacher'], priority: 'high' },
    { title: 'Hackathon Registration Open - CodeStorm 2026', content: 'The annual ECS Department Hackathon "CodeStorm 2026" registrations are now open. Teams of 2-4 students can register through the department portal. Exciting prizes for winners!', author: anita._id, scope: 'department', targetRoles: ['student'], priority: 'medium' },
  ]);

  console.log(`  ✓ ${announcements.length} announcements`);
}

module.exports = seedAnnouncements;
