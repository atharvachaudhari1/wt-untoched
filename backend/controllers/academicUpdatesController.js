/**
 * Academic college updates - list (parent/teacher/admin), create/delete (admin only).
 */
const AcademicUpdate = require('../models/AcademicUpdate');
const path = require('path');
const fs = require('fs');

/**
 * GET /api/academic-updates - list all (admin, parent, teacher).
 */
exports.list = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const updates = await AcademicUpdate.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('createdBy', 'name email')
      .lean();
    updates.forEach((u) => {
      if (u.filePath) u.fileUrl = '/api/uploads/' + path.basename(u.filePath);
    });
    res.json({ success: true, updates });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/academic-updates - create (admin only). Expects multipart: title, message, optional file.
 */
exports.create = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized.' });
    const title = (req.body && req.body.title) ? String(req.body.title).trim() : '';
    const message = (req.body && req.body.message) != null ? String(req.body.message) : '';
    if (!title) return res.status(400).json({ success: false, message: 'Title is required.' });

    let filePath = null;
    let fileName = null;
    if (req.file && req.file.path) {
      filePath = req.file.path;
      fileName = req.file.originalname || path.basename(req.file.path);
    }

    const update = await AcademicUpdate.create({
      title,
      message,
      filePath,
      fileName,
      createdBy: userId,
    });
    const populated = await AcademicUpdate.findById(update._id)
      .populate('createdBy', 'name email')
      .lean();
    if (populated.filePath) populated.fileUrl = '/api/uploads/' + path.basename(populated.filePath);
    res.status(201).json({ success: true, update: populated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/academic-updates/:id - delete (admin only). Optionally delete file from disk.
 */
exports.delete = async (req, res, next) => {
  try {
    const doc = await AcademicUpdate.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Update not found.' });
    if (doc.filePath) {
      try {
        const fullPath = path.isAbsolute(doc.filePath) ? doc.filePath : path.join(process.cwd(), doc.filePath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      } catch (e) {
        // ignore file delete errors
      }
    }
    await AcademicUpdate.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) {
    next(err);
  }
};
