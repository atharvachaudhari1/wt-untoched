/**
 * ECS Mentoring Portal - Backend entry point.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { runSeed } = require('./scripts/seed');

const app = express();

// Development: allow any origin; auth uses Bearer token in header (no cookies)
app.use(cors({ origin: true, credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'ecs-mentoring-api' });
});

app.use(errorHandler);

async function start() {
  await connectDB();
  // Drop old unique index on conversations.participants (it caused E11000 - one user could not be in multiple chats)
  try {
    await require('./models/Conversation').collection.dropIndex('participants_1');
    console.log('Dropped old conversations index participants_1');
  } catch (e) {
    if (e.code !== 27 && e.codeName !== 'IndexNotFound') console.warn('Conversations index drop:', e.message);
  }
  await runSeed().catch((err) => console.error('Seed error:', err.message));
  app.listen(config.PORT, () => {
    console.log(`ECS Mentoring Portal API running on port ${config.PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
