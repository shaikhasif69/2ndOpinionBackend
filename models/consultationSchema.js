const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  consultationDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String, // e.g., "10:00 AM"
    required: true,
  },
  endTime: {
    type: String, // e.g., "11:00 AM"
    required: true,
  },
  mode: {
    type: String,
    enum: ["video", "text", "in-person"],
    required: true,
  },
  notes: {
    type: String,
    required: false,
  },
  prescription: [
    {
      medication: { type: String, required: true },
      dosage: { type: String, required: true },
      frequency: { type: String, required: true },
    },
  ],
  followUp: {
    date: { type: Date },
    notes: { type: String },
  },
  status: {
    type: String,
    enum: ["Scheduled", "Completed", "Cancelled"],
    default: "Scheduled",
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Consultation", consultationSchema);
