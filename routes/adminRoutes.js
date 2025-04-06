const express = require('express');
const router = express.Router();
const { renderDashboard } = require('../controllers/adminController');
const {
  getAppointmentsPage,
  createAppointment,
  getAppointmentDetails,
  getEditAppointmentForm,     
  updateAppointment           
} = require('../controllers/appointmentController');

const {
    getAllPatients,
    getPatientDetails,
    getEditTreatmentForm,
    updateTreatment,
    deleteTreatment,
    getAddTreatmentForm,
    createTreatment,
    getEditPrescriptionForm,
    updatePrescription,
    deletePrescription,
    getAddPrescriptionForm,
    createPrescription,
  } = require('../controllers/patientController');
const db = require('../data/db');
const { getBillingPage } = require('../controllers/billingController');


router.get('/billings', getBillingPage);

router.get('/prescriptions/:id/edit', getEditPrescriptionForm);
router.post('/prescriptions/:id/edit', updatePrescription);
router.post('/prescriptions/:id/delete', deletePrescription);

router.get('/dashboard', renderDashboard);

router.get('/appointments/:id', getAppointmentDetails);
router.get('/appointments', getAppointmentsPage);
router.post('/appointments', createAppointment);

router.get('/patient-records', getAllPatients);
router.get('/patients/:id', getPatientDetails);

// Add Treatment
router.get('/patients/:id/add-treatment', getAddTreatmentForm);
router.post('/patients/:id/add-treatment', createTreatment);

// Add Prescription
router.get('/patients/:id/add-prescription', getAddPrescriptionForm);
router.post('/patients/:id/add-prescription', createPrescription);

// Treatments
router.get('/treatments/:id/edit', getEditTreatmentForm);
router.post('/treatments/:id/edit', updateTreatment);
router.post('/treatments/:id/delete', deleteTreatment);

// Prescriptions
router.get('/prescriptions/:id/edit', getEditPrescriptionForm);
router.post('/prescriptions/:id/edit', updatePrescription);
router.post('/prescriptions/:id/delete', deletePrescription);

// POST route for registering new patient
router.post('/patient-records', (req, res) => {
    const { first_name, last_name, age, date_of_birth, phone_number, email } = req.body;
  
    if (!first_name || !last_name || !age || !date_of_birth || !phone_number || !email) {
      return res.status(400).send('All fields are required');
    }
  
    const query = `
      INSERT INTO patients (first_name, last_name, age, date_of_birth, phone_number, email)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    db.query(query, [first_name, last_name, age, date_of_birth, phone_number, email], (err) => {
      if (err) {
        console.error('❌ Error adding patient:', err);
        return res.status(500).send('Server Error');
      }
      res.redirect('/admin/patient-records?registered=success');
    });
  });

// Edit patient page (to be created later)
router.get('/patients/:id/edit', (req, res) => {
    const db = require('../data/db');
    const id = req.params.id;
  
    db.query('SELECT * FROM patients WHERE patient_id = ?', [id], (err, results) => {
      if (err) return res.status(500).send('Server Error');
      if (results.length === 0) return res.status(404).send('Patient not found');
  
      res.render('admin/edit-patient', { patient: results[0] });
    });
  });
  
  // Delete patient
  router.post('/patients/:id/delete', (req, res) => {
    const db = require('../data/db');
    const id = req.params.id;
  
    db.query('DELETE FROM patients WHERE patient_id = ?', [id], (err) => {
      if (err) return res.status(500).send('Error deleting patient');
      res.redirect('/admin/patient-records');
    });
  });

  // Appointment Delete
  
  router.post('/appointments/:id/delete', (req, res) => {
    const appointmentId = req.params.id;
    const db = require('../data/db');
  
    // Step 1: Delete related treatments first
    db.query('DELETE FROM treatments WHERE appointment_id = ?', [appointmentId], (err1) => {
      if (err1) {
        console.error('Error deleting treatments:', err1);
        return res.status(500).send('Error cancelling appointment (step 1)');
      }
  
      // Step 2: Delete the appointment
      db.query('DELETE FROM appointments WHERE appointment_id = ?', [appointmentId], (err2) => {
        if (err2) {
          console.error('Error deleting appointment:', err2);
          return res.status(500).send('Error cancelling appointment (step 2)');
        }
  
        res.redirect('/admin/appointments');
      });
    });
  });

  // Edit Appointment
router.get('/appointments/:id/edit', getEditAppointmentForm);
router.post('/appointments/:id/edit', updateAppointment);

  
module.exports = router;