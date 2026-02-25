/**
 * Clear all student activity requests (hackathon/workshop etc.) so "My activity requests" is empty by default.
 * Run: node scripts/clearActivityRequests.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { StudentActivity } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecs_mentoring';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const result = await StudentActivity.deleteMany({});
  console.log('Deleted', result.deletedCount, 'activity request(s). My activity requests is now empty (default).');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
