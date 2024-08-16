const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      unique: true,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: false,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      unique: false,
    },
    profilePicture: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
      enum: ["Male", "Female", "Other"], // Assuming gender options
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
