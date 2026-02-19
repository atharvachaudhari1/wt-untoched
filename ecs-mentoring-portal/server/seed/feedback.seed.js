const Feedback = require('../src/models/Feedback');

async function seedFeedback(users, sessions) {
  const { aarav, priya, rohan, sneha, arjun, kavya, nikhil, divya } = users;
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const feedbacks = [];

  for (const session of completedSessions) {
    for (const studentId of session.targetStudents) {
      const sid = studentId.toString();
      let rating, comment;

      if (sid === aarav._id.toString()) { rating = Math.random() > 0.5 ? 5 : 4; comment = 'Very helpful session. Got clarity on important topics.'; }
      else if (sid === priya._id.toString()) { rating = 5; comment = 'Excellent session. Well organized and very informative.'; }
      else if (sid === rohan._id.toString()) { rating = Math.random() > 0.5 ? 2 : 3; comment = ''; }
      else if (sid === nikhil._id.toString()) { if (Math.random() > 0.5) continue; rating = 3; comment = 'It was okay.'; }
      else if (sid === sneha._id.toString()) { rating = Math.random() > 0.5 ? 5 : 4; comment = 'Practical advice for placements was very useful.'; }
      else if (sid === arjun._id.toString()) { rating = 4; comment = 'Good discussion. Would like more hands-on activities.'; }
      else if (sid === kavya._id.toString()) { rating = 5; comment = 'Really inspiring! Learned a lot about research opportunities.'; }
      else if (sid === divya._id.toString()) { rating = Math.random() > 0.5 ? 5 : 4; comment = 'Helpful for career planning. Thanks for the guidance.'; }
      else { rating = 4; comment = ''; }

      feedbacks.push({ session: session._id, student: studentId, rating, comment, isAnonymous: Math.random() > 0.85 });
    }
  }

  if (feedbacks.length) await Feedback.create(feedbacks);
  console.log(`  ✓ ${feedbacks.length} feedback records`);
}

module.exports = seedFeedback;
