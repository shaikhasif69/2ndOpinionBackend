const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authentication");
const ConsultationController = require("../controllers/consultController");


router.post("/consultations/schedule", authenticate, ConsultationController.scheduleConsultation);

router.get("/doctor/:id/consultations", authenticate, ConsultationController.getConsultationsForDoctor);

router.get("/patient/:id/consultations", authenticate, ConsultationController.getConsultationsForPatient);

router.put("/consultation/:id/status", authenticate, ConsultationController.updateConsultationStatus);

router.post("/consultation/:id/notes", authenticate, ConsultationController.addConsultationNotes);

router.get("/appointments/by-day", authenticate, ConsultationController.getAppointmentsForDay);

router.put("/consultation/:id/reschedule", authenticate, ConsultationController.rescheduleConsultation);

router.get("/doctor/:id/consultations/upcoming", authenticate, ConsultationController.getUpcomingConsultationsForDoctor);

router.get("/patient/:id/consultation-history", authenticate, ConsultationController.getConsultationHistoryForPatient);

router.delete("/consultation/:id/cancel", authenticate, ConsultationController.cancelConsultation);

router.get("/doctor/:id/patients", authenticate, ConsultationController.getPatientListForDoctor);

router.get("/patient/:id/doctors", authenticate, ConsultationController.getDoctorListForPatient);

router.get("/doctor/:id/daily-summary", authenticate, ConsultationController.getDailySummaryForDoctor);

router.get("/doctor/:id/consultations/active", authenticate, ConsultationController.getActiveConsultationsByDoctor);

router.get("/doctor/:id/patients/past", authenticate, ConsultationController.getPastPatients);

router.get("/appointments/by-date", authenticate, ConsultationController.getAppointmentsByDate);

module.exports = router;