const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth');
const { requireRole } = require('../../middleware/roles');
const fieldsController = require('./fields.controller');

router.use(authenticate);

router.post('/', requireRole('admin'), fieldsController.createField);
router.get('/', fieldsController.getAllFields);
router.get('/:id', fieldsController.getFieldById);

// PATCH /:id — edit name, crop_type, planting_date (admin only)
router.patch('/:id', requireRole('admin'), fieldsController.updateField);

// PATCH /:id/assign — reassign to a different agent (admin only)
// Must be registered AFTER /:id to avoid the /assign segment being treated as an id param.
// Express matches routes in registration order so :id/assign wins over :id here.
router.patch('/:id/assign', requireRole('admin'), fieldsController.assignField);

router.delete('/:id', requireRole('admin'), fieldsController.deleteField);

module.exports = router;