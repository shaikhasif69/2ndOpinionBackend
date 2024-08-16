const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
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
      required: true,
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
      required: true,
      enum: ["Male", "Female", "Other"], 
    },
    education: [
      {
        title: {
          type: String,
          required: false,
        },
        subtitle: {
          type: String,
          required: false,
        },
        document: {
          type: String,
          required: true,
        },
      },
    ],
    achievements: [
      {
        title: {
          type: String,
          required: false,
        },
        document: {
          type: String,
          required: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);
