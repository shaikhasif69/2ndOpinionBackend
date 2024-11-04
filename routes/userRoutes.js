const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authentication");

const userController = require("../controllers/userController");
const upload = require("../services/multerConfig");

router.post("/collectUserInfo", userController.collectUserInfo);

router.post("/verify-otp", userController.verifyOtpAndRegisterUser);
router.post("/login", userController.loginPatient);
router.get("/get-user-by-id/:id", authenticate, userController.getUserById);

module.exports = router;