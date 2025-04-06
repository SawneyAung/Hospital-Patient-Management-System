const express = require('express');
const router = express.Router();

// ✅ Import the controller function properly
const { renderDoctorDashboard } = require('../controllers/doctorController');

const { getDoctorPatientRecords } = require('../controllers/doctorController');
router.get('/patient-records', getDoctorPatientRecords);

const { getDoctorPatientDetails } = require('../controllers/doctorController');

router.get('/patients/:id', getDoctorPatientDetails);

router.get('/dashboard', renderDoctorDashboard);

const { getDoctorAppointmentsPage, cancelDoctorAppointment } = require('../controllers/doctorController');

router.get('/appointments', getDoctorAppointmentsPage);
router.post('/appointments/:id/cancel', cancelDoctorAppointment);

module.exports = router;