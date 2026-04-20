const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const dashboardController = require('./dashboard.controller');

router.use(authenticate);

router.get('/', dashboardController.getDashboard);

module.exports = router;
