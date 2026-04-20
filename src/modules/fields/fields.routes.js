const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/roles');
const fieldsController = require('./fields.controller');

router.use(authenticate);

router.post('/', requireRole('admin'), fieldsController.createField);
router.get('/', fieldsController.getAllFields);
router.get('/:id', fieldsController.getFieldById);
router.patch('/:id/assign', requireRole('admin'), fieldsController.assignField);
router.delete('/:id', requireRole('admin'), fieldsController.deleteField);

module.exports = router;
