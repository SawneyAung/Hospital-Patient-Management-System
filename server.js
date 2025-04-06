const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Dummy "database" for users
const users = [
  { username: 'admin', password: 'adminpass', role: 'admin' },
  { username: 'drjohn', password: 'johnpass', role: 'doctor' }
];

// Dummy "database" for appointments
const appointments = [
  {
    id: 1,
    patientName: 'John Doe',
    time: '10:30 AM',
    doctorName: 'Dr. Smith',
    reason: 'General Checkup',
    imageUrl: 'https://via.placeholder.com/60'
  },
  {
    id: 2,
    patientName: 'Jane Roe',
    time: '11:00 AM',
    doctorName: 'Dr. Adams',
    reason: 'Follow-up Visit',
    imageUrl: 'https://via.placeholder.com/60'
  },
  {
    id: 3,
    patientName: 'Alice Green',
    time: '11:45 AM',
    doctorName: 'Dr. Young',
    reason: 'Consultation',
    imageUrl: 'https://via.placeholder.com/60'
  }
];

// Helper to simulate DB fetch
const getAppointments = () => appointments;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.render('login', { error: 'Invalid username or password' });
  }

  if (user.role === 'admin') {
    return res.redirect('/admin-dashboard');
  } else if (user.role === 'doctor') {
    return res.redirect('/doctor-dashboard');
  } else {
    return res.render('login', { error: 'Unknown user role' });
  }
});

// Admin Dashboard
app.get('/admin-dashboard', (req, res) => {
  res.render('admin-dashboard', { appointments });
});

// Doctor Dashboard
app.get('/doctor-dashboard', (req, res) => {
  res.render('doctor-dashboard');
});

// Appointment Details Page
app.get('/appointments/:id', (req, res) => {
  const appointmentId = parseInt(req.params.id);
  const appointment = getAppointments().find(a => a.id === appointmentId);

  if (!appointment) {
    return res.status(404).send('Appointment not found');
  }

  res.render('appointment-details', { appointment });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
