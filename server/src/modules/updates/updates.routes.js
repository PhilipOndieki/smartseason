const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const updatesController = require('./updates.controller');

router.use(authenticate);

router.post('/', updatesController.createUpdate);
router.get('/field/:field_id', updatesController.getUpdatesByField);

module.exports = router;
