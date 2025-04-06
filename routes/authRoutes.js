const express = require('express');
const router = express.Router();
const db = require('../data/db');

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';

  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length === 0) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    const user = results[0];
    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else if (user.role === 'doctor') {
      return res.redirect('/doctor/dashboard');
    } else {
      return res.render('login', { error: 'Unknown user role' });
    }
  });
});

module.exports = router;
