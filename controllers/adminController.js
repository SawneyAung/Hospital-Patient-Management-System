const db = require('../data/db');

const renderDashboard = (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const appointmentsQuery = `
    SELECT a.*, p.first_name AS patient_first, p.last_name AS patient_last, d.first_name AS doctor_first, d.last_name AS doctor_last
    FROM appointments a
    JOIN patients p ON a.patient_id = p.patient_id
    JOIN doctors d ON a.doctor_id = d.doctor_id
    WHERE a.appointment_date >= CURDATE()
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
    LIMIT 5
  `;

  const totalPatientsQuery = `SELECT COUNT(*) AS total FROM patients`;

  const appointmentsTodayQuery = `
    SELECT COUNT(*) AS todayCount
    FROM appointments
    WHERE appointment_date = CURDATE()
  `;

  db.query(appointmentsQuery, (err1, upcomingAppointments) => {
    if (err1) return res.status(500).send('Error loading appointments');

    db.query(totalPatientsQuery, (err2, totalPatientsResult) => {
      if (err2) return res.status(500).send('Error loading patient count');

      db.query(appointmentsTodayQuery, (err3, todayAppointmentsResult) => {
        if (err3) return res.status(500).send('Error loading today’s appointments');

        res.render('admin/dashboard', {
          upcomingAppointments,
          totalPatients: totalPatientsResult[0].total,
          appointmentsToday: todayAppointmentsResult[0].todayCount
        });
      });
    });
  });
};

module.exports = { renderDashboard };
