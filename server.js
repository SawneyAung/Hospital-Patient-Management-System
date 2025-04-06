const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Dummy "database"
const users = [
  { username: 'admin', password: 'adminpass', role: 'admin' },
  { username: 'drjohn', password: 'johnpass', role: 'doctor' }
];

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

  // Simulated DB lookup
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.render('login', { error: 'Invalid username or password' });
  }

  // Redirect based on role
  if (user.role === 'admin') {
    return res.redirect('/admin-dashboard');
  } else if (user.role === 'doctor') {
    return res.redirect('/doctor-dashboard');
  } else {
    return res.render('login', { error: 'Unknown user role' });
  }
});

app.get('/admin-dashboard', (req, res) => {
  res.render('admin-dashboard'); // Make sure this EJS file exists
});

app.get('/doctor-dashboard', (req, res) => {
  res.render('doctor-dashboard'); // Make sure this EJS file exists
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
