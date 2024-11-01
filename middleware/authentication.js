const jwt = require('jsonwebtoken');
const User = require('../models/userSchema');
const Doctor = require('../models/doctorSchema');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user;
    if (decoded.userType === 'patient') {
      user = await User.findById(decoded.userId);
    } else if (decoded.userType === 'doctor') {
      user = await Doctor.findById(decoded.userId);
    } else {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    req.userType = decoded.userType;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authenticate;
