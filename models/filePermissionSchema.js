const mongoose = require("mongoose");

const permissionRequestSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  accessLevel: {
    type: String,
    enum: ["read-only", "edit"], // Determines level of access
    default: "read-only",
  },
  validUntil: { type: Date }, // Expiration for access rights
  requestedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
});

module.exports = mongoose.model("PermissionRequest", permissionRequestSchema);
