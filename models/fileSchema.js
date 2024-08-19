const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  version: { type: Number, default: 1 },  // for versioning
  encrypted: { type: Boolean, default: false },
  expiryDate: { type: Date },  // for expiry
  revoked: { type: Boolean, default: false },  // for revocation
  uploadedAt: { type: Date, default: Date.now },
  accessedAt: { type: Date },  // for logging access
});

module.exports = mongoose.model("File", fileSchema);
