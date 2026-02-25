/**
 * 1:1 conversation between two users (for chat).
 */
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }],
    lastMessageAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One conversation per pair; find-or-create in controller uses sorted participants.
// Do NOT use unique on participants array (multikey unique would allow only one conv per user).
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
