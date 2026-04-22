const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/roles');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/agents', authenticate, requireRole('admin'), authController.getAgents);

module.exports = router;
