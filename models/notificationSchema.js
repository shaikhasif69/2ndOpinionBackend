const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientModel',
    required: true,
  },
  recipientModel: {
    type: String,
    enum: ["User", "Doctor"],
    required: true,
  },
  type: {
    type: String,
    enum: ["fileShared", "fileAccessed", "fileRequest", "appointmentReminder"],
    required: true,
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium",
  },
  message: { type: String, required: true },
  link: { type: String }, // URL to navigate upon clicking notification
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Notification", notificationSchema);
