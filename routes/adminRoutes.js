const express = require('express');
const router = express.Router();
const { renderDashboard, renderAppointmentDetails } = require('../controllers/adminController');

router.get('/dashboard', renderDashboard);
router.get('/appointments/:id', renderAppointmentDetails);

module.exports = router;
