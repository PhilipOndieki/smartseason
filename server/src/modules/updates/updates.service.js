const pool = require('../../config/db');

const RISK_FLAGS = [
  'pest_infestation',
  'disease_outbreak',
  'drought_stress',
  'waterlogging',
  'nutrient_deficiency',
];

// pure function — easy to unit test without touching the DB
const computeFieldStatus = (field, latestUpdate) => {
  if (latestUpdate?.stage === 'harvested' || field.current_stage === 'harvested') {
    return 'completed';
  }

  if (latestUpdate) {
    const flags = Array.isArray(latestUpdate.risk_flags) ? latestUpdate.risk_flags : [];
    const hasRisk = flags.some((f) => RISK_FLAGS.includes(f));
    if (hasRisk) return 'at_risk';
  }

  // field gone stale — no updates in 14 days and crop is still in the ground
  if (field.updated_at) {
    const daysSinceUpdate = (Date.now() - new Date(field.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 14) return 'at_risk';
  }

  return 'active';
};

const createUpdate = async ({ field_id, stage, notes, risk_flags }, agentId) => {
  // verify field exists and agent is assigned to it
  const [fields] = await pool.query('SELECT * FROM fields WHERE id = ?', [field_id]);
  if (fields.length === 0) {
    const err = new Error('Field not found');
    err.statusCode = 404;
    throw err;
  }

  const field = fields[0];

  if (field.assigned_agent_id !== agentId) {
    const err = new Error('You are not assigned to this field');
    err.statusCode = 403;
    throw err;
  }

  const flags = Array.isArray(risk_flags) ? risk_flags : [];

  const [result] = await pool.query(
    'INSERT INTO field_updates (field_id, agent_id, stage, notes, risk_flags) VALUES (?, ?, ?, ?, ?)',
    [field_id, agentId, stage, notes || null, JSON.stringify(flags)]
  );

  // compute new status based on this update and sync the parent field
  const latestUpdate = { stage, risk_flags: flags };
  const newStatus = computeFieldStatus(field, latestUpdate);

  await pool.query(
    'UPDATE fields SET current_stage = ?, status = ? WHERE id = ?',
    [stage, newStatus, field_id]
  );

  const [rows] = await pool.query('SELECT * FROM field_updates WHERE id = ?', [result.insertId]);
  return rows[0];
};

const getUpdatesByField = async (fieldId, user) => {
  const [fields] = await pool.query('SELECT * FROM fields WHERE id = ?', [fieldId]);
  if (fields.length === 0) {
    const err = new Error('Field not found');
    err.statusCode = 404;
    throw err;
  }

  const field = fields[0];

  if (user.role === 'agent' && field.assigned_agent_id !== user.id) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  // join saves fetching agent names in a second query
  const [updates] = await pool.query(`
    SELECT fu.*, u.name AS agent_name
    FROM field_updates fu
    LEFT JOIN users u ON fu.agent_id = u.id
    WHERE fu.field_id = ?
    ORDER BY fu.created_at DESC
  `, [fieldId]);

  return updates;
};

module.exports = { createUpdate, getUpdatesByField, computeFieldStatus };
