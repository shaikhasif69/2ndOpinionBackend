const Doctor = require("../models/doctorSchema");
const sendOtpEmail = require("../services/emailService");
const crypto = require("crypto");

const otpStore = {};

const generateOtp = () => {
  console.log("hey ?? in otp function!");
  return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.collectDoctorInfo = async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      address,
      phone,
      username,
      gender,
      education,
      achievements,
    } = req.body;

    const profilePicture = req.files['profilePicture'] ? req.files['profilePicture'][0] : null;
    const educationDocuments = req.files['educationDocuments'] || [];
    const achievementDocuments = req.files['achievementDocuments'] || [];

    if (!profilePicture) {
      return res.status(400).json({ error: "Profile picture is required." });
    }

    const generatedOtp = generateOtp();
    otpStore[email] = {
      otp: generatedOtp,
      data: {
        ...req.body,
        profilePicturePath: profilePicture.path, 
        educationDocumentsPaths: educationDocuments.map(doc => doc.path), 
        achievementDocumentsPaths: achievementDocuments.map(doc => doc.path) 
      }
    };

    await sendOtpEmail(email, generatedOtp);
    res.status(200).json({ message: "OTP sent to email. Please verify.", email });
  } catch (error) {
    res.status(500).json({ error: "Error in sending OTP. Please try again." });
  }
};

exports.verifyOtpAndRegisterDoctor = async (req, res) => {
  try {
    const { email, otp } = req.body;


    if (!otpStore[email]) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    if (otpStore[email].otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    const doctor = new Doctor(otpStore[email].data);
    await doctor.save();

    delete otpStore[email];

    res.status(201).json(doctor);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Error while registring" });
  }
};

exports.checkUsernameAvailability = async (req, res) => {
  const { username } = req.params;
  console.log("username: ", username);
  try {
    const existingDoctor = await Doctor.findOne({ username });
    if (existingDoctor) {
      res.json({ available: false });
    } else {
      res.json({ available: true });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.isValidPhone = async (req, res) => {
  const { phone } = req.params;

  try {
    const existingDoctoro = await Doctor.findOne({ phone });

    if (existingDoctoro) {
      res.json({ available: false });
    } else {
      res.json({ available: true });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.isValidEmail = async (req, res) => {
  const { email } = req.params;

  try {
    const existingDoctor = await Doctor.findOne({ email });

    if (existingDoctor) {
      res.json({ available: false });
    } else {
      res.json({ available: true });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a doctor by ID
exports.updateDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a doctor by ID
exports.deleteDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
