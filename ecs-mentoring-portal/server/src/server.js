const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');

const start = async () => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(`🚀 ECS Mentoring Portal Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    console.log(`📡 API available at http://localhost:${env.PORT}/api`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
