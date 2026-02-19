const mongoose = require('mongoose');
const User = require('./User');

const parentSchema = new mongoose.Schema({
  children:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  relation:   { type: String, enum: ['father', 'mother', 'guardian'], default: 'father' },
  occupation: { type: String, default: '' },
});

const Parent = User.discriminator('parent', parentSchema);
module.exports = Parent;
