const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }], // array for multiple doctors
  tags: [{ type: String }], // Tags for categorizing files
  description: { type: String }, // Short description
  version: { type: Number, default: 1 },  // File versioning
  fileHistory: [
    {
      filePath: { type: String },
      version: { type: Number },
      uploadedAt: { type: Date, default: Date.now },
    }
  ],
  auditTrail: [
    {
      accessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      accessedAt: { type: Date },
    }
  ],
  encrypted: { type: Boolean, default: false },
  expiryDate: { type: Date },
  revoked: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now },
  accessedAt: { type: Date }, // For logging access time
});

module.exports = mongoose.model("File", fileSchema);
