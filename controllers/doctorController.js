const db = require('../data/db');

const renderDoctorDashboard = (req, res) => {
  const doctorId = 1; // temporary until login is connected

  const todayAppointmentsQuery = `
    SELECT a.*, p.first_name AS patient_first, p.last_name AS patient_last, p.patient_id
    FROM appointments a
    JOIN patients p ON a.patient_id = p.patient_id
    WHERE a.doctor_id = ? AND a.appointment_date = CURDATE()
    ORDER BY a.appointment_time ASC
  `;

  const activeTreatmentsQuery = `
    SELECT t.*, p.first_name AS patient_first, p.last_name AS patient_last
    FROM treatments t
    JOIN patients p ON t.patient_id = p.patient_id
    WHERE t.doctor_id = ? AND t.completed = 0
    ORDER BY t.treatment_id DESC
  `;

  db.query(todayAppointmentsQuery, [doctorId], (err1, appointments) => {
    if (err1) return res.status(500).send('Error loading appointments');

    db.query(activeTreatmentsQuery, [doctorId], (err2, treatments) => {
      if (err2) return res.status(500).send('Error loading treatments');

      res.render('doctor/dashboard', { appointments, treatments });
    });
  });
};

const getDoctorPatientRecords = (req, res) => {
  const doctorId = 1;
  const { search, ageRange } = req.query;

  let query = `
    SELECT DISTINCT p.*
    FROM patients p
    JOIN appointments a ON p.patient_id = a.patient_id
    WHERE a.doctor_id = ?
  `;
  const params = [doctorId];

  if (search) {
    query += ` AND (p.first_name LIKE ? OR p.last_name LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (ageRange === 'under30') {
    query += ` AND p.age < 30`;
  } else if (ageRange === '30to50') {
    query += ` AND p.age BETWEEN 30 AND 50`;
  } else if (ageRange === 'over50') {
    query += ` AND p.age > 50`;
  }

  query += ` ORDER BY p.first_name ASC`;

  db.query(query, params, (err, patients) => {
    if (err) return res.status(500).send('Error loading patient records');
    res.render('doctor/patient-records', {
      patients,
      search: req.query.search || '',
      ageRange: req.query.ageRange || ''
    });    
  });
};

const getDoctorPatientDetails = (req, res) => {
  const patientId = req.params.id;
  const doctorId = 1; // temporary

  const patientQuery = `SELECT * FROM patients WHERE patient_id = ?`;

  const treatmentsQuery = `
    SELECT * FROM treatments
    WHERE patient_id = ? AND doctor_id = ?
    ORDER BY treatment_id DESC
  `;

  const prescriptionsQuery = `
    SELECT * FROM prescriptions
    WHERE patient_id = ? AND doctor_id = ?
    ORDER BY prescription_id DESC
  `;

  const appointmentsQuery = `
    SELECT a.*, d.first_name AS doctor_first, d.last_name AS doctor_last
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.doctor_id
    WHERE a.patient_id = ? AND a.doctor_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  db.query(patientQuery, [patientId], (err, patientResults) => {
    if (err || patientResults.length === 0)
      return res.status(404).send('Patient not found');

    const patient = patientResults[0];

    db.query(treatmentsQuery, [patientId, doctorId], (err2, treatments) => {
      if (err2) return res.status(500).send('Error loading treatments');

      db.query(prescriptionsQuery, [patientId, doctorId], (err3, prescriptions) => {
        if (err3) return res.status(500).send('Error loading prescriptions');

        db.query(appointmentsQuery, [patientId, doctorId], (err4, appointments) => {
          if (err4) return res.status(500).send('Error loading appointments');

          res.render('doctor/patient-details', {
            patient,
            treatments,
            prescriptions,
            appointments
          });
        });
      });
    });
  });
};

const getDoctorAppointmentsPage = (req, res) => {
  const doctorId = 1; // Replace with session later
  const today = new Date().toISOString().split('T')[0];

  const query = `
    SELECT a.*, p.first_name AS patient_first, p.last_name AS patient_last
    FROM appointments a
    JOIN patients p ON a.patient_id = p.patient_id
    WHERE a.doctor_id = ?
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
  `;

  db.query(query, [doctorId], (err, appointments) => {
    if (err) return res.status(500).send('Error loading appointments');
    res.render('doctor/appointments', { appointments });
  });
};

const cancelDoctorAppointment = (req, res) => {
  const appointmentId = req.params.id;

  const deleteTreatments = `DELETE FROM treatments WHERE appointment_id = ?`;
  const deletePrescriptions = `DELETE FROM prescriptions WHERE appointment_id = ?`;
  const deleteAppointment = `DELETE FROM appointments WHERE appointment_id = ?`;

  db.query(deleteTreatments, [appointmentId], (err1) => {
    if (err1) return res.status(500).send('Error deleting treatments');

    db.query(deletePrescriptions, [appointmentId], (err2) => {
      if (err2) return res.status(500).send('Error deleting prescriptions');

      db.query(deleteAppointment, [appointmentId], (err3) => {
        if (err3) return res.status(500).send('Error cancelling appointment');
        res.redirect('/doctor/appointments');
      });
    });
  });
};

module.exports = {
  renderDoctorDashboard,
  getDoctorPatientRecords,
  getDoctorPatientDetails,
  getDoctorAppointmentsPage,
  cancelDoctorAppointment,
};
