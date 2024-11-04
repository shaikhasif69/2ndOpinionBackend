const Consultation = require("../models/consultationSchema");


// This function allows a patient to schedule a consultation with a specific doctor.
exports.scheduleConsultation = async (req, res) => {
  const { doctorId, patientId, consultationDate, startTime, endTime, mode, notes } =
    req.body;
  try {
    const consultation = new Consultation({
      doctor: doctorId,
      patient: patientId,
      consultationDate,
      startTime,
      endTime,
      mode,
      notes,
    });
    await consultation.save();
    res
      .status(201)
      .json({ message: "Consultation scheduled successfully", consultation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// This function retrieves all consultations for a specific doctor, useful for viewing a doctor’s schedule and patient history.

exports.getConsultationsForDoctor = async (req, res) => {
  const { doctorId } = req.params;
  try {
    const consultations = await Consultation.find({ doctor: doctorId })
      .populate("patient", "firstName lastName email")
      .select("-__v");
    if(!consultations){
        return res.status(404).json({ message: "No consultations found for this doctor" });
    }
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// This function retrieves all consultations for a specific patient, which can be useful for a patient’s consultation history and follow-ups.

exports.getConsultationsForPatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const consultations = await Consultation.find({ patient: patientId })
      .populate("doctor", "firstName lastName specialty")
      .select("-__v");
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Allows updating the status of a consultation (e.g., marking it as "Completed" or "Cancelled").

exports.updateConsultationStatus = async (req, res) => {
  const { consultationId } = req.params;
  const { status } = req.body;
  try {
    const consultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { status },
      { new: true }
    );
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    res
      .status(200)
      .json({ message: "Consultation status updated", consultation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Allows adding or updating notes and prescriptions for a consultation.
exports.addConsultationNotes = async (req, res) => {
  const { consultationId } = req.params;
  const { notes, prescription } = req.body;
  try {
    const consultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { notes, prescription },
      { new: true }
    );
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    res
      .status(200)
      .json({ message: "Consultation details updated", consultation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//   Get All Appointments for a Given Day
exports.getAppointmentsForDay = async (req, res) => {
  const { date } = req.query;
  try {
    const appointments = await Consultation.find({
      consultationDate: new Date(date),
    })
      .populate("doctor", "firstName lastName specialty")
      .populate("patient", "firstName lastName email")
      .select("-__v");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//This endpoint allows updating the date and/or time of an existing consultation.

exports.rescheduleConsultation = async (req, res) => {
  const { consultationId } = req.params;
  const { newDate, newStartTime, newEndTime } = req.body;
  try {
    const consultation = await Consultation.findByIdAndUpdate(
      consultationId,
      {
        consultationDate: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
      },
      { new: true }
    );
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    res
      .status(200)
      .json({ message: "Consultation rescheduled successfully", consultation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Upcoming Consultations for a Doctor

exports.getUpcomingConsultationsForDoctor = async (req, res) => {
  const { doctorId } = req.params;
  try {
    const consultations = await Consultation.find({
      doctor: doctorId,
      consultationDate: { $gte: new Date() },
    })
      .populate("patient", "firstName lastName email")
      .select("-__v");
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Consultation History for a Patient
exports.getConsultationHistoryForPatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const consultations = await Consultation.find({
      patient: patientId,
      consultationDate: { $lt: new Date() },
    })
      .populate("doctor", "firstName lastName specialty")
      .select("-__v");
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel a Consultation

exports.cancelConsultation = async (req, res) => {
  const { consultationId } = req.params;
  try {
    const consultation = await Consultation.findByIdAndUpdate(
      consultationId,
      { status: "Cancelled" },
      { new: true }
    );
    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }
    res
      .status(200)
      .json({ message: "Consultation cancelled successfully", consultation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//   Get Patient List for a Doctor

exports.getPatientListForDoctor = async (req, res) => {
  const { doctorId } = req.params;
  try {
    const patients = await Consultation.find({ doctor: doctorId })
      .distinct("patient")
      .populate("patient", "firstName lastName email");
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//   Get Doctor List for a Patient
exports.getDoctorListForPatient = async (req, res) => {
  const { patientId } = req.params;
  try {
    const doctors = await Consultation.find({ patient: patientId })
      .distinct("doctor")
      .populate("doctor", "firstName lastName specialty");
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//  Get Daily Summary of Appointments for a Doctor

exports.getDailySummaryForDoctor = async (req, res) => {
  const { doctorId, date } = req.params;
  try {
    const consultations = await Consultation.find({
      doctor: doctorId,
      consultationDate: new Date(date),
    }).select("status");

    const summary = {
      scheduled: consultations.filter((c) => c.status === "Scheduled").length,
      completed: consultations.filter((c) => c.status === "Completed").length,
      cancelled: consultations.filter((c) => c.status === "Cancelled").length,
    };

    res.status(200).json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Active Consultations for a Doctor
exports.getActiveConsultationsByDoctor = async (req, res) => {
  const { id } = req.params;
  const today = new Date();
  try {
    const consultations = await Consultation.find({
      doctorId: id,
      date: { $gte: today },
    })
      .populate("patientId", "firstName lastName email")
      .sort({ date: 1, time: 1 });
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Fetch Doctor’s Past Patient

exports.getPastPatients = async (req, res) => {
  const { doctorId } = req.params;
  try {
    const patients = await Consultation.find({ doctorId }).populate(
      "patientId",
      "firstName lastName email profilePicture"
    );
    const uniquePatients = [
      ...new Map(patients.map((p) => [p.patientId._id, p.patientId])).values(),
    ];
    res.status(200).json(uniquePatients);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//   Get All Appointments for a Given Day

exports.getAppointmentsByDate = async (req, res) => {
    const { date, doctorId } = req.query;
    try {
      const query = { consultationDate: new Date(date) };
      if (doctorId) query.doctor = doctorId;
  
      const appointments = await Consultation.find(query)
        .populate('doctor', 'firstName lastName specialty')  
        .populate('patient', 'firstName lastName email');    
  
      res.status(200).json(appointments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
