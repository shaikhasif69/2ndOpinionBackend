const express = require("express");
const router = express.Router();
const authenticate = require("../../middleware/authentication");
const DoctorController = require("../../controllers/doctorController");
const upload = require("../../services/multerConfig");
// const upload = require("/services/multerConfig");
// get routes here

router.get("/username/:username", DoctorController.checkUsernameAvailability);
router.get("/phone/:phone", DoctorController.isValidPhone);
router.get("/email/:email", DoctorController.isValidEmail);

router.get("/get-all-doctors", authenticate, DoctorController.getAllDoctors);

router.get("/doctors/:id", authenticate, DoctorController.getDoctorById);

// post routes here

router.post(
  "/collectDoctorInfo",
  // authenticate,
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "doc", maxCount: 10 },
  ]),
  DoctorController.collectDoctorInfo
);

router.post("/verify-otp", DoctorController.verifyOtpAndRegisterDoctor);

router.post("/login", DoctorController.loginDoctor);

// router.post("/verify-otp", DoctorController.verifyOtp);

router.put("/doctor/:id", authenticate, DoctorController.updateDoctorById);

router.delete("/doctor/:id", authenticate, DoctorController.deleteDoctorById);

module.exports = router;
