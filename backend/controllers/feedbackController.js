/**
 * Quick Feedback and session feedback submission.
 */
const { Feedback } = require('../models');

exports.submitQuickFeedback = async (req, res, next) => {
  try {
    const { rating, comment, sessionId, mentorId } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'rating 1-5 required.' });
    }
    const feedback = await Feedback.create({
      fromUser: req.user.id,
      session: sessionId || null,
      type: sessionId ? 'session' : 'quick',
      rating: Number(rating),
      comment: comment || null,
      mentor: mentorId || null,
    });
    res.status(201).json({ success: true, feedback });
  } catch (err) {
    next(err);
  }
};

exports.myFeedback = async (req, res, next) => {
  try {
    const list = await Feedback.find({ fromUser: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, feedback: list });
  } catch (err) {
    next(err);
  }
};
