const express = require("express");
const router = express.Router();

const DoctorController = require("../../controllers/doctorController");
const  upload = require("../../services/multerConfig");


// get routes here
console.log("Upload object:", upload);


router.get("/username/:username", DoctorController.checkUsernameAvailability);
router.get("/phone/:phone", DoctorController.isValidPhone);
router.get("/email/:email", DoctorController.isValidEmail);

router.get("/get-all-doctors", DoctorController.getAllDoctors);

router.get("/doctors/:id", DoctorController.getDoctorById);

// post routes here

// router.post("/register-doctor", DoctorController.registerDoctor);
// router.post("/collect-info", DoctorController.collectDoctorInfo);

router.post(
  "/collectDoctorInfo",
  upload.fields([
    { name: "profilePicture", maxCount: 1 },
    { name: "educationDocuments", maxCount: 10 },
    { name: "achievementDocuments", maxCount: 10 },
  ]),
  DoctorController.collectDoctorInfo
);

router.post("/verify-otp", DoctorController.verifyOtpAndRegisterDoctor);

// router.post("/verify-otp", DoctorController.verifyOtp);

router.put("/doctor/:id", DoctorController.updateDoctorById);

router.delete("/doctor/:id", DoctorController.deleteDoctorById);

module.exports = router;
