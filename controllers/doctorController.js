const Doctor = require("../models/doctorSchema");
const User = require("../models/userSchema");
const cloudinary = require("cloudinary").v2;
const sendOtpEmail = require("../services/emailService");
const bcrypt = require("bcryptjs");
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

const uploadToCloudinary = async (filePath, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { folder }, (error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
  });
};

const otpStore = {};
const tempStorage = {}; // In-memory storage for the sake of example

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
// exports.collectDoctorInfo = async (req, res) => {
//   try {
//     const {
//       email,
//       firstName,
//       lastName,
//       address,
//       phone,
//       username,
//       password,
//       gender,
//       education,
//       achievements,
//     } = req.body;

//     const trimmedEmail = email.trim();

//     const profilePicture = req.files["profilePicture"]
//       ? req.files["profilePicture"][0]
//       : null;
//     const educationDocuments = req.files["doc"] || [];
//     // const achievementDocuments = req.files["achievementDocuments"] || [];

//     if (!profilePicture) {
//       return res.status(400).json({ error: "Profile picture is required." });
//     }

//     const generatedOtp = generateOtp();
//     otpStore[trimmedEmail] = {
//       otp: generatedOtp,
//       data: {
//         ...req.body,
//         profilePicturePath: profilePicture.path,
//         educationDocumentsPaths: educationDocuments.map((doc) => doc.path),
//         // achievementDocumentsPaths: achievementDocuments.map((doc) => doc.path),
//       },
//     };

//     tempStorage[trimmedEmail] = {
//       profilePicture,
//       educationDocuments,
//     };

//     sendOtpEmail(trimmedEmail, generatedOtp);
//     res
//       .status(200)
//       .json({ message: "OTP sent to email. Please verify.", trimmedEmail });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Error in sending OTP. Please try again." });
//   }
// };

// exports.verifyOtpAndRegisterDoctor = async (req, res) => {
//   try {
//     const { email, otp } = req.body;
//     const trimmedEmail = email.trim();
//     // console.log("email: " + trimmedEmail + " Opt : " + otp);

//     if (!otpStore[trimmedEmail]) {
//       return res.status(400).json({ error: "Invalid or expired OTP." });
//     }

//     if (otpStore[trimmedEmail].otp !== otp) {
//       return res.status(400).json({ error: "Invalid OTP." });
//     }

//     const doctorData = otpStore[trimmedEmail].data;
//     const salt = await bcrypt.genSalt(10);
//     doctorData.password = await bcrypt.hash(doctorData.password, salt);

//     const { profilePicture, educationDocuments } = tempStorage[trimmedEmail];
//     if (profilePicture) {
//       const permanentPath = moveToPermanentStorage(
//         profilePicture.path,
//         profilePicture.fieldname
//       );
//       doctorData.profilePicture = permanentPath;
//     }

//     doctorData.education = educationDocuments.map((doc, index) => ({
//       title: doctorData.educationList[index][0],
//       subtitle: doctorData.educationList[index][1],
//       document: moveToPermanentStorage(doc.path, doc.fieldname),
//     }));

//     const doctor = new Doctor(doctorData);
//     await doctor.save();

//     delete otpStore[trimmedEmail];
//     const token = jwt.sign(
//       { userId: doctor._id, userType: "doctor" },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "30d",
//       }
//     );

//     res.status(201).json({ message: "Success", doctor, token: token });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "Internal Error while registring" });
//   }
// };

exports.collectDoctorInfo = async (req, res) => {
  try {
    const { email, ...otherData } = req.body;
    const trimmedEmail = email.trim();

    const profilePicture = req.files["profilePicture"]
      ? req.files["profilePicture"][0]
      : null;
    const educationDocuments = req.files["doc"] || [];

    if (!profilePicture) {
      return res.status(400).json({ error: "Profile picture is required." });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[trimmedEmail] = {
      otp: generatedOtp,
      data: { ...otherData },
    };

    // Store files in memory
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

    // Upload profile picture to Cloudinary if it exists
    if (profilePicture) {
      doctorData.profilePicture = await uploadBufferToCloudinary(
        profilePicture.buffer,
        "doctors/profilePictures",
        profilePicture.originalname
      );
    }

    // Upload each education document to Cloudinary
    doctorData.education = await Promise.all(
      educationDocuments.map(async (doc, index) => ({
        title: doctorData.educationList[index][0],
        subtitle: doctorData.educationList[index][1],
        document: await uploadBufferToCloudinary(
          doc.buffer,
          "doctors/educationDocs",
          doc.originalname
        ),
      }))
    );

    const doctor = new Doctor(doctorData);
    await doctor.save();

    // Cleanup temporary data
    delete otpStore[trimmedEmail];
    delete tempStorage[trimmedEmail];

    const doctorObject = doctor.toObject();

    delete doctorObject.password;
    delete doctorObject.createdAt;
    delete doctorObject.updatedAt;
    delete doctorObject.__v;

    const token = jwt.sign(
      { userId: doctor._id, userType: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res
      .status(201)
      .json({ message: "Success", doctor: doctorObject, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Error while registering" });
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
      res.json({ status: "Not Available!", available: false });
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
    const doctors = await Doctor.find().select(
      "-password -createdAt -updatedAt -__v -education -achievements"
    );
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

    // Convert Mongoose document to a plain JavaScript object
    const doctorObject = doctor.toObject();

    // Remove sensitive fields
    delete doctorObject.password;
    delete doctorObject.createdAt;
    delete doctorObject.updatedAt;
    delete doctorObject.__v;

    const token = jwt.sign(
      { userId: doctor._id, userType: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    console.log(res.status + " status here");
    res.status(200).json({ success: true, doctor: doctorObject, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select(
      "-password -createdAt -updatedAt -__v -education -achievements"
    );
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

// Fetch doctors based on location
exports.getDoctorsByLocation = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }

    const doctors = await Doctor.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: maxDistance * 1000,
        },
      },
    });

    res.status(200).json({ doctors });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error fetching doctors by location" });
  }
};

// Fetch doctors by specialty
exports.getDoctorsBySpecialty = async (req, res) => {
  const { specialty } = req.query;
  console.log("specialty: ", specialty);
  try {
    const doctors = await Doctor.find({ specialty: specialty }).select(
      "-password -createdAt -updatedAt -__v -education -achievements"
    );
    if (doctors.length === 0) {
      return res
        .status(404)
        .json({ message: "No doctors found for the selected specialty" });
    }
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch all unique specialties
exports.getAllSpecialties = async (req, res) => {
  try {
    const specialties = await Doctor.distinct("specialty").select(
      "-password -createdAt -updatedAt -__v -education -achievements"
    );
    res.status(200).json(specialties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update doctor rating
exports.updateDoctorRating = async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;
  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    // Simple average rating calculation; replace with a more complex rating system if needed
    doctor.ratings = (doctor.ratings + rating) / 2;
    await doctor.save();
    res.status(200).json({ message: "Rating updated successfully", doctor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get doctors based on their ratings:

exports.getTopDoctors = async (req, res) => {
  try {
    console.log("fetchign top doctors: ");
    const { page = 1, limit = 10 } = req.query;

    const doctors = await Doctor.find()
      .sort({ ratings: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("-password -createdAt -updatedAt -__v -education -achievements");

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAvailableDoctors = async (req, res) => {
  try {
    const { currentTime } = req.query; // Expected in "HH:mm" format (24-hour format)
 
    if (!currentTime) {
      return res.status(400).json({ error: "Current time is required." });
    }

    const [currentHour, currentMinute] = currentTime.split(":").map(Number);

    const doctors = await Doctor.find({
      "availability.from": { $lte: currentTime },
      "availability.to": { $gte: currentTime },
    })
      .select("-password -createdAt -updatedAt -__v -education -achievements")
      .limit(30);
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// search doctors by name:
exports.searchDoctorsByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res
        .status(400)
        .json({ error: "Name query parameter is required." });
    }

    const doctors = await Doctor.find({
      $or: [
        { firstName: new RegExp(name, "i") },
        { lastName: new RegExp(name, "i") },
      ],
    })
      .select("-password -createdAt -updatedAt -__v -education -achievements")
      .limit(30);

    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
