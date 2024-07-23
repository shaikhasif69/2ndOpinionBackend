const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  
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
    required: true,
  },
  phone: {
    type: String,
    unique: true,
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
  profilePicture: {
    type: String,
    required: false, // Assuming profile picture is optional
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'], // Assuming gender options
  },
  education: [{
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
    document: {
      type: String,
      required: true,
    },
  }],
  achievements: [{
    title: {
      type: String,
      required: true,
    },
    document: {
      type: String,
      required: true,
    },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Doctor', doctorSchema);
