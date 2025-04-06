const db = require('../data/db');

const getAppointmentsPage = (req, res) => {
    const appointmentsQuery = `
      SELECT a.*, 
             d.first_name AS doctor_first, d.last_name AS doctor_last,
             p.first_name AS patient_first, p.last_name AS patient_last
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.doctor_id
      JOIN patients p ON a.patient_id = p.patient_id
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `;
  
    db.query(appointmentsQuery, (err, appointments) => {
      if (err) return res.status(500).send('Error loading appointments');
  
      db.query('SELECT * FROM patients', (err2, patients) => {
        if (err2) return res.status(500).send('Error loading patients');
  
        db.query('SELECT * FROM doctors', (err3, doctors) => {
          if (err3) return res.status(500).send('Error loading doctors');
  
          res.render('admin/appointments', { appointments, patients, doctors });
        });
      });
    });
  };

const createAppointment = (req, res) => {
    const { appointment_date, appointment_time, notes, patient_id, doctor_id } = req.body;
  
    const query = `
      INSERT INTO appointments (appointment_date, appointment_time, notes, patient_id, doctor_id)
      VALUES (?, ?, ?, ?, ?)
    `;
  
    db.query(query, [appointment_date, appointment_time, notes, patient_id, doctor_id], (err) => {
      if (err) return res.status(500).send('Error saving appointment');
      res.redirect('/admin/appointments');
    });
  };

  const getAppointmentDetails = (req, res) => {
    const appointmentId = req.params.id;
  
    const appointmentQuery = `
      SELECT a.*, 
             d.first_name AS doctor_first, d.last_name AS doctor_last, d.specialty,
             p.first_name AS patient_first, p.last_name AS patient_last,
             p.phone_number AS patient_phone, p.email AS patient_email,
             p.patient_id
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.doctor_id
      JOIN patients p ON a.patient_id = p.patient_id
      WHERE a.appointment_id = ?
    `;
  
    const treatmentQuery = `
      SELECT * FROM treatments
      WHERE appointment_id = ?
    `;
  
    const prescriptionQuery = `
      SELECT * FROM prescriptions
      WHERE appointment_id = ?
    `;
  
    db.query(appointmentQuery, [appointmentId], (err1, result) => {
      if (err1 || result.length === 0) return res.status(404).send('Appointment not found');
      const appointment = result[0];
  
      db.query(treatmentQuery, [appointmentId], (err2, treatments) => {
        if (err2) return res.status(500).send('Error loading treatments');
  
        db.query(prescriptionQuery, [appointmentId], (err3, prescriptions) => {
          if (err3) return res.status(500).send('Error loading prescriptions');
  
          res.render('admin/appointment-details', {
            appointment,
            treatments,
            prescriptions
          });
        });
      });
    });
  };

  const getEditAppointmentForm = (req, res) => {
    const appointmentId = req.params.id;
  
    const appointmentQuery = `
      SELECT * FROM appointments WHERE appointment_id = ?
    `;
    const patientsQuery = `SELECT * FROM patients`;
    const doctorsQuery = `SELECT * FROM doctors`;
  
    db.query(appointmentQuery, [appointmentId], (err, results) => {
      if (err || results.length === 0) return res.status(404).send('Appointment not found');
      const appointment = results[0];
  
      db.query(patientsQuery, (err2, patients) => {
        if (err2) return res.status(500).send('Error loading patients');
  
        db.query(doctorsQuery, (err3, doctors) => {
          if (err3) return res.status(500).send('Error loading doctors');
  
          res.render('admin/edit-appointment', { appointment, patients, doctors });
        });
      });
    });
  };
  
  const updateAppointment = (req, res) => {
    const appointmentId = req.params.id;
    const { appointment_date, appointment_time, notes, patient_id, doctor_id } = req.body;
  
    const updateQuery = `
      UPDATE appointments
      SET appointment_date = ?, appointment_time = ?, notes = ?, patient_id = ?, doctor_id = ?
      WHERE appointment_id = ?
    `;
  
    db.query(updateQuery, [appointment_date, appointment_time, notes, patient_id, doctor_id, appointmentId], (err) => {
      if (err) return res.status(500).send('Error updating appointment');
  
      // ✅ This line must be inside the callback
      res.redirect(`/admin/appointments/${appointmentId}?updated=success`);
    });
  };
  
  module.exports = {
    getAppointmentsPage,
    createAppointment,
    getAppointmentDetails,
    getEditAppointmentForm,
    updateAppointment
  };
  
  