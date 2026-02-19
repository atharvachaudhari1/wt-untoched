const MentoringNote = require('../src/models/MentoringNote');

async function seedNotes(users) {
  const { anita, vikram, meera, aarav, priya, rohan, sneha, arjun, kavya, nikhil, divya } = users;

  const notes = await MentoringNote.create([
    { student: aarav._id, mentor: anita._id, category: 'academic', content: 'Excellent performance in Data Structures and Algorithms. Recommended for competitive programming club. Shows strong analytical thinking.', severity: 'info' },
    { student: aarav._id, mentor: anita._id, category: 'career', content: 'Interested in software development roles. Advised to build portfolio projects and contribute to open source.', severity: 'info' },
    { student: priya._id, mentor: anita._id, category: 'career', content: 'Interested in ML research. Connected with Prof. Meera for undergraduate research opportunity. Strong mathematical foundation.', severity: 'info' },
    { student: priya._id, mentor: anita._id, category: 'academic', content: 'Consistently top performer. Encouraged to mentor junior students and participate in teaching assistant program.', severity: 'info' },
    { student: rohan._id, mentor: anita._id, category: 'academic', content: 'Has 2 backlogs in Mathematics and Physics. Recovery plan discussed. Needs to attend remedial classes regularly.', severity: 'warning' },
    { student: rohan._id, mentor: anita._id, category: 'behavioral', content: 'Irregular attendance pattern observed. Called parent for discussion. Student agreed to improve.', severity: 'warning', isConfidential: true },
    { student: nikhil._id, mentor: anita._id, category: 'academic', content: '3 active backlogs. At risk of year loss if not cleared by next semester. Immediate intervention required.', severity: 'critical' },
    { student: nikhil._id, mentor: anita._id, category: 'personal', content: 'Student mentioned financial difficulties affecting studies. Referred to student welfare office for assistance.', severity: 'critical', isConfidential: true },
    { student: sneha._id, mentor: vikram._id, category: 'career', content: 'Strong embedded systems skills demonstrated in lab projects. Recommended for Texas Instruments internship program.', severity: 'info' },
    { student: arjun._id, mentor: vikram._id, category: 'academic', content: 'Good academic standing. Needs to focus more on practical project work. Suggested participation in robotics club.', severity: 'info' },
    { student: kavya._id, mentor: meera._id, category: 'academic', content: 'Outstanding first-semester performance. Encouraged to participate in national hackathons and coding competitions.', severity: 'info' },
    { student: divya._id, mentor: meera._id, category: 'career', content: 'Expressed interest in data science career path. Recommended online courses and Kaggle competitions for practical experience.', severity: 'info' },
  ]);

  console.log(`  ✓ ${notes.length} mentoring notes`);
}

module.exports = seedNotes;
