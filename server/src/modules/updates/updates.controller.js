const updatesService = require('./updates.service');

const createUpdate = async (req, res) => {
  try {
    const { field_id, stage, notes, risk_flags } = req.body;
    if (!field_id || !stage) {
      return res.status(400).json({ success: false, message: 'field_id and stage are required' });
    }

    const update = await updatesService.createUpdate(
      { field_id, stage, notes, risk_flags },
      req.user.id
    );
    return res.status(201).json({ success: true, data: update });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getUpdatesByField = async (req, res) => {
  try {
    const updates = await updatesService.getUpdatesByField(Number(req.params.field_id), req.user);
    return res.status(200).json({ success: true, data: updates });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const editUpdate = async (req, res) => {
  try {
    const { stage, notes, risk_flags } = req.body
    if (!stage) return res.status(400).json({ success: false, message: 'stage is required' })
    const update = await updatesService.editUpdate(Number(req.params.id), { stage, notes, risk_flags }, req.user.id)
    return res.status(200).json({ success: true, data: update })
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}

const deleteUpdate = async (req, res) => {
  try {
    await updatesService.deleteUpdate(Number(req.params.id), req.user.id)
    return res.status(200).json({ success: true, message: 'Update deleted' })
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message })
  }
}
module.exports = { createUpdate, editUpdate, deleteUpdate, getUpdatesByField };
