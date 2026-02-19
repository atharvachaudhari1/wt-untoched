const mongoose = require('mongoose');
const User = require('./User');

const adminSchema = new mongoose.Schema({
  department:   { type: String, default: 'ECS' },
  isSuperAdmin: { type: Boolean, default: false },
});

const Admin = User.discriminator('admin', adminSchema);
module.exports = Admin;
