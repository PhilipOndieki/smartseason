const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const updatesController = require('./updates.controller');

router.use(authenticate);

router.post('/', updatesController.createUpdate);
router.get('/field/:field_id', updatesController.getUpdatesByField);
router.patch('/:id', updatesController.editUpdate)
router.delete('/:id', updatesController.deleteUpdate)

module.exports = router;

