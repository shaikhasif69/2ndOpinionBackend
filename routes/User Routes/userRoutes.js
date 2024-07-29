const express = require("express");
const router = express.Router();

const userController = require("../../controllers/userController");
const  upload = require("../../services/multerConfig");


router.post(
    "/collectUserInfo",
    userController.collectUserInfo
  );
  
  router.post("/verify-otp", userController.verifyOtpAndRegisterUser);
  

module.exports = router;
