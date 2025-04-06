const express = require('express');
const router = express.Router();
const { renderDashboard } = require('../controllers/doctorController');

router.get('/dashboard', renderDashboard);

module.exports = router;
