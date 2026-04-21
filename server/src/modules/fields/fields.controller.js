const fieldsService = require('./fields.service');

const createField = async (req, res) => {
  try {
    const { name, crop_type, planting_date, assigned_agent_id } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }
    const field = await fieldsService.createField({ name, crop_type, planting_date, assigned_agent_id });
    return res.status(201).json({ success: true, data: field });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const updateField = async (req, res) => {
  try {
    const { name, crop_type, planting_date } = req.body;
    const field = await fieldsService.updateField(Number(req.params.id), {
      name,
      crop_type,
      planting_date,
    });
    return res.status(200).json({ success: true, data: field });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getAllFields = async (req, res) => {
  try {
    const fields = await fieldsService.getAllFields(req.user);
    return res.status(200).json({ success: true, data: fields });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getFieldById = async (req, res) => {
  try {
    const field = await fieldsService.getFieldById(Number(req.params.id), req.user);
    return res.status(200).json({ success: true, data: field });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const assignField = async (req, res) => {
  try {
    const { agent_id } = req.body;
    if (!agent_id) {
      return res.status(400).json({ success: false, message: 'agent_id is required' });
    }
    const field = await fieldsService.assignField(Number(req.params.id), agent_id);
    return res.status(200).json({ success: true, data: field });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const deleteField = async (req, res) => {
  try {
    await fieldsService.deleteField(Number(req.params.id));
    return res.status(200).json({ success: true, message: 'Field deleted' });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = { createField, updateField, getAllFields, getFieldById, assignField, deleteField };