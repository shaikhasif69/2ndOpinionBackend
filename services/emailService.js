const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "atharva.atwork45@gmail.com",
    pass: "gppcjkpguxztrrhw",
  },
});

// Function to send OTP email
const sendOtpEmail = (email, otp) => {
  const mailOptions = {
    from: "atharva.atwork45@gmail.com",
    to: email,
    subject: "Your OTP for registration",
    text: `Your OTP for registration is ${otp}`,
  };

  return transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.log("Error in sending email", err);
    } else {
      console.log("Sent Mail Successfully");
    }
});
  
};

module.exports = sendOtpEmail;
