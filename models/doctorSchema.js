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
    },
    phone: {
      type: String,
      unique: true,
      required: false,
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
    specialty: {
      type: [String],
      required: false,
    },
    experience: {
      type: Number,
      required: false,
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
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    availability: {
      from: { type: String }, // e.g., "09:00 AM"
      to: { type: String }, // e.g., "05:00 PM"
    },
    ratings: {
      type: Number,
      default: 0,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);
