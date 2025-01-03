const User = require("../models/userSchema");
const Doctor = require("../models/doctorSchema");
const sendOtpEmail = require("../services/emailService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const otpStore = {};

const OTP_EXPIRY_TIME = 5 * 60 * 1000;

const generateOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  console.log("Generating 2 OTP..." + otp);

  return otp;
};

exports.collectUserInfo = async (req, res) => {
  console.log("Received data from frontend:", req.body);
  try {
    const {
      firstName,
      lastName,
      address,
      phone,
      username,
      password,
      gender,
      email,
      profilePicture,
    } = req.body;

    // Check if email exists in User or Doctor collection

    // const existingUser = await User.findOne({ email });

    // if (existingUser || existingDoctor) {
    //   return res
    //     .status(400)
    //     .json({ error: "Email already exists. Please use another email." });
    // }
    const normalizedEmail = email.trim().toLowerCase();

    const generatedOtp = generateOtp();
    console.log("opt here: " + generateOtp);
    otpStore[normalizedEmail] = {
      otp: generatedOtp,
      data: {
        firstName,
        lastName,
        address,
        phone,
        username,
        password,
        gender,
        email,
        profilePicture,
      },
      timestamp: Date.now(), // Store the timestamp of OTP generation
    };

    await sendOtpEmail(normalizedEmail, generatedOtp);
    res
      .status(200)
      .json({ message: "OTP sent to email. Please verify.", email });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Error sending OTP. Please try again." });
  }
};

exports.verifyOtpAndRegisterUser = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Normalize email and OTP
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    console.log(
      "Normalized Email and OTP: " + normalizedEmail + " " + normalizedOtp
    );

    if (!otpStore[normalizedEmail]) {
      console.log("OTP not found for email:", normalizedEmail);
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    if (otpStore[normalizedEmail].otp !== normalizedOtp) {
      return res.status(400).json({ error: "Invalid OTP." });
    }

    const userData = otpStore[normalizedEmail].data;

    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);

    const user = new User(userData);

    await user.save();

    delete otpStore[normalizedEmail];
    const token = jwt.sign({ userId: user._id, userType: "patient" }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(201).json({ response: "Success", user, token: token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Error while registering" });
  }
};

exports.checkUsernameAvailability = async (req, res) => {
  const { username } = req.params;
  console.log("username: ", username);
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
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
    const existingUser = await User.findOne({ phone });
    const existingDoctor = await Doctor.findOne({ phone });

    if (existingUser || existingDoctor) {
      res.json({ status: "User Exists", available: false });
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

exports.loginPatient = async (req, res) => {
  try {
    console.log("hitting me ");
    const { username, password } = req.body;
    console.log("username: ", username)
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid username or email." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password." });
    }
    console.log("the user: ", user);
    // Convert Mongoose document to a plain JavaScript object
    const userObject = user.toObject();
    // Remove sensitive fields

    delete userObject.password;
    delete userObject.createdAt;
    delete userObject.updatedAt;
    delete userObject.__v;

    console.log("spot difference : ", userObject);
    const token = jwt.sign({ userId: user._id, userType: "patient" }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({ success: true, userObject, token: token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};


exports.getUserById = async(req, res)=>{
  try {
      const {id} = req.params;
      const user = await User.findById(id).select("-password");
      if(!user){
        return res.status(404).json({error: "User not found"});
      }
      res.json(user);
  } catch (error) {
    res.status(500).json({error: "Internal Server Error"});
  }
}