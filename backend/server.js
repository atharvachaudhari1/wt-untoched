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

app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'ecs-mentoring-api' });
});

app.use(errorHandler);

async function start() {
  await connectDB();
  await runSeed().catch((err) => console.error('Seed error:', err.message));
  app.listen(config.PORT, () => {
    console.log(`ECS Mentoring Portal API running on port ${config.PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
