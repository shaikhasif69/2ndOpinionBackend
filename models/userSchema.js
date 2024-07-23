const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  
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
    required: false, 
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'], // Assuming gender options
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
