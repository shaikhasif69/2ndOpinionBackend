const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true,
      },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: 'senderModel',
        },
        senderModel: {
          type: String,
          enum: ['User', 'Doctor'],
          required: true,
        },
        text: { type: String, required: false },
        attachment: { type: String },  // file URL if attached
        reactions: [{ type: String }], // reactions like emojis
        timestamp: { type: Date, default: Date.now },
        seen: { type: Boolean, default: false },
      },
    ],
    // typingStatus: {
    //   [mongoose.Schema.Types.ObjectId]: { type: Boolean, default: false },
    // },
    lastMessage: { 
      type: String 
    }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
