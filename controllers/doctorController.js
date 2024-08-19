const Doctor = require("../models/doctorSchema");
const User = require("../models/userSchema");
const sendOtpEmail = require("../services/emailService");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

function moveToPermanentStorage(tempPath, fileField) {
  let permanentBasePath = path.join(__dirname, "../uploads");
  switch (fileField) {
    case "profilePicture":
      permanentBasePath = path.join(permanentBasePath, "profilePictures");
      break;
    case "doc":
      permanentBasePath = path.join(permanentBasePath, "educationDoc");
      break;
    // case 'achievementDocuments':
    //   permanentBasePath = path.join(permanentBasePath, 'achievementDocs');
    //   break;
    default:
      permanentBasePath = path.join(permanentBasePath, "otherDocs");
      break;
  }

  const permanentPath = path.join(permanentBasePath, path.basename(tempPath));

  // Ensure the directory exists
  if (!fs.existsSync(permanentBasePath)) {
    fs.mkdirSync(permanentBasePath, { recursive: true });
  }

  // Move the file to the permanent path
  fs.renameSync(tempPath, permanentPath);

  return permanentPath;
}

const otpStore = {};
const tempStorage = {}; // In-memory storage for the sake of example

const generateOtp = () => {
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
      password,
      gender,
      education,
      achievements,
    } = req.body;

    const trimmedEmail = email.trim();

    const profilePicture = req.files["profilePicture"]
      ? req.files["profilePicture"][0]
      : null;
    const educationDocuments = req.files["doc"] || [];
    // const achievementDocuments = req.files["achievementDocuments"] || [];

    if (!profilePicture) {
      return res.status(400).json({ error: "Profile picture is required." });
    }

    const generatedOtp = generateOtp();
    otpStore[trimmedEmail] = {
      otp: generatedOtp,
      data: {
        ...req.body,
        profilePicturePath: profilePicture.path,
        educationDocumentsPaths: educationDocuments.map((doc) => doc.path),
        // achievementDocumentsPaths: achievementDocuments.map((doc) => doc.path),
      },
    };

    tempStorage[trimmedEmail] = {
      profilePicture,
      educationDocuments,
    };

    sendOtpEmail(trimmedEmail, generatedOtp);
    res
      .status(200)
      .json({ message: "OTP sent to email. Please verify.", trimmedEmail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error in sending OTP. Please try again." });
  }
};

exports.verifyOtpAndRegisterDoctor = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const trimmedEmail = email.trim();
    // console.log("email: " + trimmedEmail + " Opt : " + otp);

    if (!otpStore[trimmedEmail]) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    if (otpStore[trimmedEmail].otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    const doctorData = otpStore[trimmedEmail].data;
    const salt = await bcrypt.genSalt(10);
    doctorData.password = await bcrypt.hash(doctorData.password, salt);

    const { profilePicture, educationDocuments } = tempStorage[trimmedEmail];
    if (profilePicture) {
      const permanentPath = moveToPermanentStorage(
        profilePicture.path,
        profilePicture.fieldname
      );
      doctorData.profilePicture = permanentPath;
    }

    doctorData.education = educationDocuments.map((doc, index) => ({
      title: doctorData.educationList[index][0],
      subtitle: doctorData.educationList[index][1],
      document: moveToPermanentStorage(doc.path, doc.fieldname),
    }));

    const doctor = new Doctor(doctorData);
    await doctor.save();

    delete otpStore[trimmedEmail];

    res.status(201).json({ message: "Success", doctor });
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

  console.log("phone : " + phone);
  try {
    const existingDoctoro = await Doctor.findOne({ phone });

    if (existingDoctoro) {
      res.json({ status: "you sucks!", available: false });
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
    const existingUser = await User.findOne({ email });

    if (existingDoctor || existingUser) {
      res.json({ available: false });
    } else {
      res.json({ available: true });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginDoctor = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("email: " + username + " pass: " + password);

    const doctor = await Doctor.findOne({
      $or: [{ username }, { email: username }],
    });
    if (!doctor) {
      console.log("invalid email, pass");
      return res.status(400).json({ error: "Invalid username or email." });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      console.log("invalid pass");
      return res.status(400).json({ error: "Invalid password." });
    }

    const token = jwt.sign({ userId: doctor._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log(res.status + " status here");
    res.status(200).json({ success: true, doctor, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

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
