const db = require('../data/db');

const getAllPatients = (req, res) => {
  const query = 'SELECT * FROM patients';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Failed to fetch patients:', err);
      return res.status(500).send('Server Error');
    }

    res.render('admin/patient-records', { patients: results });
  });
};

const getPatientDetails = (req, res) => {
    const patientId = req.params.id;
  
    const patientQuery = 'SELECT * FROM patients WHERE patient_id = ?';
    const treatmentsQuery = `
      SELECT * FROM treatments WHERE patient_id = ?;
    `;
    const prescriptionsQuery = `
      SELECT * FROM prescriptions WHERE patient_id = ?;
    `;
    const appointmentsQuery = `
      SELECT a.*, d.first_name AS doctor_first, d.last_name AS doctor_last
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.doctor_id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date ASC, a.appointment_time ASC;
    `;
  
    db.query(patientQuery, [patientId], (err, patientResults) => {
      if (err || patientResults.length === 0) return res.status(404).send('Patient not found');
  
      const patient = patientResults[0];
  
      db.query(treatmentsQuery, [patientId], (err, treatmentResults) => {
        if (err) return res.status(500).send('Error loading treatments');
  
        db.query(prescriptionsQuery, [patientId], (err, prescriptionResults) => {
          if (err) return res.status(500).send('Error loading prescriptions');
  
          db.query(appointmentsQuery, [patientId], (err, appointmentResults) => {
            if (err) return res.status(500).send('Error loading appointments');
  
            res.render('admin/patient-details', {
              patient,
              treatments: treatmentResults,
              prescriptions: prescriptionResults,
              appointments: appointmentResults
            });
          });
        });
      });
    });
  };

// === TREATMENTS ===

const getEditTreatmentForm = (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM treatments WHERE treatment_id = ?', [id], (err, results) => {
      if (err || results.length === 0) return res.status(404).send('Treatment not found');
      res.render('admin/edit-treatment', { treatment: results[0] });
    });
  };
  
  const updateTreatment = (req, res) => {
    const { treatment_type, description, completed } = req.body;
    const id = req.params.id;
    db.query(
      'UPDATE treatments SET treatment_type = ?, description = ?, completed = ? WHERE treatment_id = ?',
      [treatment_type, description, completed ? 1 : 0, id],
      (err) => {
        if (err) return res.status(500).send('Update failed');
        res.redirect('back');
      }
    );
  };
  
  const deleteTreatment = (req, res) => {
    const id = req.params.id;
  
    // Step 1: Find the patient_id linked to this treatment
    db.query('SELECT patient_id FROM treatments WHERE treatment_id = ?', [id], (err, result) => {
      if (err || result.length === 0) return res.status(500).send('Error finding treatment');
  
      const patientId = result[0].patient_id;
  
      // Step 2: Delete the treatment
      db.query('DELETE FROM treatments WHERE treatment_id = ?', [id], (err) => {
        if (err) return res.status(500).send('Error deleting treatment');
  
        // Step 3: Redirect to the patient's detail page
        res.redirect(`/admin/patients/${patientId}`);
      });
    });
  };

  // GET form to add treatment
const getAddTreatmentForm = (req, res) => {
    const patientId = req.params.id;
    db.query('SELECT doctor_id, first_name, last_name FROM doctors', (err, doctors) => {
      if (err) return res.status(500).send('Error fetching doctors');
      res.render('admin/add-treatment', { patientId, doctors });
    });
  };
  
  // POST treatment form
  const createTreatment = (req, res) => {
    const patientId = req.params.id;
    const { treatment_type, description, doctor_id } = req.body;
  
    const query = `
      INSERT INTO treatments (treatment_type, description, appointment_id, doctor_id, patient_id, completed)
      VALUES (?, ?, NULL, ?, ?, 0)
    `;
  
    db.query(query, [treatment_type, description, doctor_id, patientId], (err) => {
      if (err) return res.status(500).send('Error saving treatment');
      res.redirect(`/admin/patients/${patientId}`);
    });
  };
  
  
  // === PRESCRIPTIONS ===
  
  const getEditPrescriptionForm = (req, res) => {
    const id = req.params.id;
    db.query('SELECT * FROM prescriptions WHERE prescription_id = ?', [id], (err, results) => {
      if (err || results.length === 0) return res.status(404).send('Prescription not found');
      res.render('admin/edit-prescription', { prescription: results[0] });
    });
  };
  
  const updatePrescription = (req, res) => {
    const {
      dosage_instructions,
      medication_details,
      bill_amount,
      payment_date,
      payment_status
    } = req.body;
  
    const id = req.params.id;
  
    // First get the patient ID tied to this prescription
    db.query('SELECT patient_id FROM prescriptions WHERE prescription_id = ?', [id], (err, result) => {
      if (err || result.length === 0) return res.status(500).send('Error fetching patient ID');
  
      const patientId = result[0].patient_id;
  
      // Then update
      db.query(
        `UPDATE prescriptions SET
          dosage_instructions = ?, medication_details = ?, bill_amount = ?,
          payment_status = ?, payment_date = ?
         WHERE prescription_id = ?`,
        [dosage_instructions, medication_details, bill_amount, payment_status, payment_date || null, id],
        (err) => {
          if (err) return res.status(500).send('Update failed');
          res.redirect(`/admin/patients/${patientId}`);
        }
      );
    });
  };
  
  const deletePrescription = (req, res) => {
    const id = req.params.id;
  
    // Step 1: Find the patient_id linked to this prescription
    db.query('SELECT patient_id FROM prescriptions WHERE prescription_id = ?', [id], (err, result) => {
      if (err || result.length === 0) return res.status(500).send('Error finding prescription');
  
      const patientId = result[0].patient_id;
  
      // Step 2: Delete the prescription
      db.query('DELETE FROM prescriptions WHERE prescription_id = ?', [id], (err) => {
        if (err) return res.status(500).send('Error deleting prescription');
  
        // Step 3: Redirect to the patient's detail page
        res.redirect(`/admin/patients/${patientId}`);
      });
    });
  };

  // GET form
const getAddPrescriptionForm = (req, res) => {
    const patientId = req.params.id;
  
    db.query('SELECT doctor_id, first_name, last_name FROM doctors', (err, doctors) => {
      if (err) return res.status(500).send('Error loading doctors');
  
      db.query(
        'SELECT appointment_id, appointment_date, appointment_time FROM appointments WHERE patient_id = ?',
        [patientId],
        (err2, appointments) => {
          if (err2) return res.status(500).send('Error loading appointments');
  
          res.render('admin/add-prescription', { patientId, doctors, appointments });
        }
      );
    });
  };
  
  // POST form
  const createPrescription = (req, res) => {
    const patientId = req.params.id;
    const {
      dosage_instructions,
      medication_details,
      bill_amount,
      doctor_id,
      appointment_id
    } = req.body;
  
    const query = `
      INSERT INTO prescriptions (
        dosage_instructions, prescribed_date, medication_details,
        bill_amount, payment_status, payment_date,
        patient_id, doctor_id, appointment_id
      ) VALUES (?, CURDATE(), ?, ?, 'Pending', NULL, ?, ?, ?)
    `;
  
    db.query(
      query,
      [dosage_instructions, medication_details, bill_amount, patientId, doctor_id, appointment_id],
      (err) => {
        if (err) return res.status(500).send('Error saving prescription');
        res.redirect(`/admin/patients/${patientId}`);
      }
    );
  };
  
  module.exports = {
    getAllPatients,
    getPatientDetails,
    getEditTreatmentForm,
    getAddTreatmentForm,
    createTreatment,
    updateTreatment,
    deleteTreatment,
    getEditPrescriptionForm,
    updatePrescription,
    deletePrescription,
    getAddPrescriptionForm,
    createPrescription
  };