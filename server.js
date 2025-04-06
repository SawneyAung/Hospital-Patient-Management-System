const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./data/db'); // ✅ Database connection

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

const app = express(); // ✅ Create the app instance

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.set('view engine', 'ejs');

// Root redirect
app.get('/', (req, res) => res.redirect('/login'));

// Route mounting
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/doctor', doctorRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
