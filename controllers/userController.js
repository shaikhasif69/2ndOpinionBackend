const User = require("../models/userSchema");
const sendOtpEmail = require("../services/emailService");

const otpStore = {};


const generateOtp = () => {
  console.log("hey ?? in otp function!");
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.collectUserInfo =  async(req, res) => {
  console.log("Data: " + JSON.stringify(req.body));
  try {
    const {
         firstName, lastName, address,
         phone,
         username,
         gender,
         email,
         profilePicture
    } = req.body

    // const profilePicture = req.files["profilePicture"]
    // ? req.files["profilePicture"][0]
    // : null;

    const generatedOtp = generateOtp();
    otpStore[email] = {
      otp: generatedOtp,
      data: {
        ...req.body,
        profilePicturePath: profilePicture.path,
        // educationDocumentsPaths: educationDocuments.map((doc) => doc.path),
        // achievementDocumentsPaths: achievementDocuments.map((doc) => doc.path),
      },
    };
    
    sendOtpEmail(email, generatedOtp);
    res
      .status(200)
      .json({ message: "OTP sent to email. Please verify.", email });
  }  catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error in sending OTP. Please try again." });
  }
};


exports.verifyOtpAndRegisterUser = async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      if (!otpStore[email]) {
        return res.status(400).json({ error: "Invalid or expired OTP." });
      }
  
      if (otpStore[email].otp !== otp) {
        return res.status(400).json({ error: "Invalid OTP." });
      }
  
      const user = new User(otpStore[email].data);
      await user.save();
  
      delete otpStore[email];
  
      res.status(201).json(user);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Error while registring" });
    }
  };