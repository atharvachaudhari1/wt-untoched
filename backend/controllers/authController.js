/**
 * Authentication controller - login per role, JWT generation.
 */
const jwt = require('jsonwebtoken');
const { User, StudentProfile, ParentProfile } = require('../models');
const { JWT_SECRET, JWT_EXPIRES_IN, PARENT_PASSWORD } = require('../config');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Parent login: email = {rollNumber}@parent.edu (e.g. 10524@parent.edu), password = parent123.
 * Finds student by roll number, creates or finds parent user and links to that student only.
 */
async function handleParentLogin(email, password) {
  const match = email.match(/^(\d+)@parent\.edu$/i);
  if (!match) return null;
  const rollNo = match[1].trim();
  if (password !== PARENT_PASSWORD) {
    return { error: true, status: 401, message: 'Invalid email or password.' };
  }
  const studentProfile = await StudentProfile.findOne({ rollNo }).select('_id user');
  if (!studentProfile) {
    return { error: true, status: 401, message: 'No student found with this roll number.' };
  }

  let user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    user = await User.create({
      email: email.toLowerCase(),
      password: password,
      name: 'Parent of ' + rollNo,
      role: 'parent',
    });
    const parentProfile = await ParentProfile.create({
      user: user._id,
      linkedStudents: [studentProfile._id],
    });
    user.profileId = parentProfile._id;
    user.profileModel = 'ParentProfile';
    await user.save();
  } else {
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return { error: true, status: 401, message: 'Invalid email or password.' };
    }
    if (user.role !== 'parent') {
      return { error: true, status: 403, message: 'This account is not a parent account.' };
    }
    const parentProfile = await ParentProfile.findOne({ user: user._id });
    if (!parentProfile) {
      const newProfile = await ParentProfile.create({
        user: user._id,
        linkedStudents: [studentProfile._id],
      });
      user.profileId = newProfile._id;
      user.profileModel = 'ParentProfile';
      await user.save();
    } else {
      const linkedIds = (parentProfile.linkedStudents || []).map((id) => id.toString());
      const studentIdStr = studentProfile._id.toString();
      if (!linkedIds.includes(studentIdStr)) {
        parentProfile.linkedStudents = parentProfile.linkedStudents || [];
        parentProfile.linkedStudents.push(studentProfile._id);
        await parentProfile.save();
      }
    }
  }

  const token = generateToken(user._id);
  const userObj = await User.findById(user._id).select('-password');
  return { error: false, token, user: userObj };
}

/**
 * POST /api/auth/login
 * Body: { email, password, role? } - role optional; if provided, validated against user.role
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password, role: requestedRole } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Parent login: rollnumber@parent.edu + parent123
    if (/^\d+@parent\.edu$/i.test(normalizedEmail)) {
      const result = await handleParentLogin(normalizedEmail, password);
      if (result.error) {
        return res.status(result.status).json({ success: false, message: result.message });
      }
      if (requestedRole && requestedRole !== 'parent') {
        return res.status(403).json({ success: false, message: 'Login not allowed for this role.' });
      }
      return res.status(200).json({
        success: true,
        token: result.token,
        expiresIn: JWT_EXPIRES_IN,
        user: result.user,
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated.' });
    }

    if (requestedRole && user.role !== requestedRole) {
      return res.status(403).json({ success: false, message: 'Login not allowed for this role.' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);
    let userObj = await User.findById(user._id).select('-password');
    if (userObj && userObj.profileId && (userObj.profileModel === 'StudentProfile' || user.role === 'student')) {
      userObj = await User.findById(user._id).select('-password').populate('profileId', 'rollNo department year');
    }
    return res.status(200).json({
      success: true,
      token,
      expiresIn: JWT_EXPIRES_IN,
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me - current user (requires auth)
 */
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('profileId', '-__v')
      .select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/auth/me - update current user
 * Body: { name?, gender?, currentPassword?, newPassword? }
 * For password change: both currentPassword and newPassword required; newPassword min 5 chars.
 */
exports.updateMe = async (req, res, next) => {
  try {
    const { name, gender, currentPassword, newPassword } = req.body;
    const update = {};

    if (name !== undefined) {
      const trimmed = typeof name === 'string' ? name.trim() : '';
      if (trimmed.length > 0) update.name = trimmed;
    }
    if (gender !== undefined) {
      if (gender === null || gender === 'male' || gender === 'female') {
        update.gender = gender;
      }
    }

    if (currentPassword != null || newPassword != null) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password required to change password.' });
      }
      if (String(newPassword).length < 5) {
        return res.status(400).json({ success: false, message: 'New password must be at least 5 characters.' });
      }
      const userWithPass = await User.findById(req.user.id).select('+password');
      if (!userWithPass) return res.status(404).json({ success: false, message: 'User not found.' });
      const match = await userWithPass.comparePassword(currentPassword);
      if (!match) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }
      userWithPass.password = newPassword;
      await userWithPass.save();
      const user = await User.findById(req.user.id).select('-password');
      return res.json({ success: true, user });
    }

    if (Object.keys(update).length > 0) {
      const updated = await User.findByIdAndUpdate(
        req.user.id,
        { $set: update },
        { new: true }
      ).select('-password');
      if (!updated) return res.status(404).json({ success: false, message: 'User not found.' });
      return res.json({ success: true, user: updated });
    }

    return res.status(400).json({ success: false, message: 'No valid fields to update.' });
  } catch (err) {
    next(err);
  }
};

