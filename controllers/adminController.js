const { appointments } = require('../data/dummyDatabase');

const renderDashboard = (req, res) => {
  res.render('admin/dashboard', { appointments });
};

const renderAppointmentDetails = (req, res) => {
  const id = parseInt(req.params.id);
  const appointment = appointments.find(a => a.id === id);
  if (!appointment) return res.status(404).send('Appointment not found');
  res.render('admin/appointment-details', { appointment });
};

module.exports = { renderDashboard, renderAppointmentDetails };
