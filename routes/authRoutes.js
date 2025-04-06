const express = require('express');
const router = express.Router();
const { handleLogin } = require('../controllers/authController');

router.get('/login', (req, res) => res.render('login', { error: null }));
router.post('/login', handleLogin);

module.exports = router;
