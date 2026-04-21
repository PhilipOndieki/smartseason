const pool = require('../../config/db');

// ─── staleness helper ────────────────────────────────────────────────────────
// Re-evaluates at_risk due to 14-day inactivity at READ time so a field never
// sits stale-but-active indefinitely waiting for the next update submission.
const STALE_DAYS = 14;

async function recomputeStaleStatus(field) {
  if (field.status === 'completed') return field;

  const daysSince =
    (Date.now() - new Date(field.updated_at).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSince > STALE_DAYS && field.status !== 'at_risk') {
    await pool.query(
      'UPDATE fields SET status = ? WHERE id = ?',
      ['at_risk', field.id]
    );
    return { ...field, status: 'at_risk' };
  }

  return field;
}

// ─── createField ─────────────────────────────────────────────────────────────
const createField = async ({ name, crop_type, planting_date, assigned_agent_id }) => {
  const [result] = await pool.query(
    'INSERT INTO fields (name, crop_type, planting_date, assigned_agent_id) VALUES (?, ?, ?, ?)',
    [name, crop_type || null, planting_date || null, assigned_agent_id || null]
  );
  const [rows] = await pool.query('SELECT * FROM fields WHERE id = ?', [result.insertId]);
  return rows[0];
};

// ─── updateField ─────────────────────────────────────────────────────────────
// Allows admin to edit name, crop_type, and planting_date.
// Intentionally separate from assignField — single-responsibility.
const updateField = async (id, { name, crop_type, planting_date }) => {
  const [existing] = await pool.query('SELECT id FROM fields WHERE id = ?', [id]);
  if (existing.length === 0) {
    const err = new Error('Field not found');
    err.statusCode = 404;
    throw err;
  }

  // Only update columns that were actually sent — don't clobber with undefined
  const updates = [];
  const values = [];

  if (name !== undefined) {
    if (!name || !name.trim()) {
      const err = new Error('name cannot be empty');
      err.statusCode = 400;
      throw err;
    }
    updates.push('name = ?');
    values.push(name.trim());
  }
  if (crop_type !== undefined) {
    updates.push('crop_type = ?');
    values.push(crop_type || null);
  }
  if (planting_date !== undefined) {
    updates.push('planting_date = ?');
    values.push(planting_date || null);
  }

  if (updates.length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }

  values.push(id);
  await pool.query(`UPDATE fields SET ${updates.join(', ')} WHERE id = ?`, values);

  const [rows] = await pool.query(`
    SELECT f.*, u.name AS agent_name
    FROM fields f
    LEFT JOIN users u ON f.assigned_agent_id = u.id
    WHERE f.id = ?
  `, [id]);
  return rows[0];
};

// ─── getAllFields ─────────────────────────────────────────────────────────────
const getAllFields = async (user) => {
  let rows;

  if (user.role === 'admin') {
    [rows] = await pool.query(`
      SELECT f.*, u.name AS agent_name
      FROM fields f
      LEFT JOIN users u ON f.assigned_agent_id = u.id
      ORDER BY f.created_at DESC
    `);
  } else {
    [rows] = await pool.query(`
      SELECT f.*, u.name AS agent_name
      FROM fields f
      LEFT JOIN users u ON f.assigned_agent_id = u.id
      WHERE f.assigned_agent_id = ?
      ORDER BY f.created_at DESC
    `, [user.id]);
  }

  // Re-evaluate staleness for every non-completed field in one pass.
  // Uses Promise.all so all UPDATE queries fire concurrently rather than serially.
  const recomputed = await Promise.all(rows.map((f) => recomputeStaleStatus(f)));
  return recomputed;
};

// ─── getFieldById ─────────────────────────────────────────────────────────────
const getFieldById = async (id, user) => {
  const [fields] = await pool.query(`
    SELECT f.*, u.name AS agent_name
    FROM fields f
    LEFT JOIN users u ON f.assigned_agent_id = u.id
    WHERE f.id = ?
  `, [id]);

  if (fields.length === 0) {
    const err = new Error('Field not found');
    err.statusCode = 404;
    throw err;
  }

  let field = fields[0];

  if (user.role === 'agent' && field.assigned_agent_id !== user.id) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  // Live staleness check on every read
  field = await recomputeStaleStatus(field);

  const [updates] = await pool.query(`
    SELECT fu.*, u.name AS agent_name
    FROM field_updates fu
    LEFT JOIN users u ON fu.agent_id = u.id
    WHERE fu.field_id = ?
    ORDER BY fu.created_at DESC
  `, [id]);

  return { ...field, updates };
};

// ─── assignField ──────────────────────────────────────────────────────────────
const assignField = async (fieldId, agentId) => {
  const [agents] = await pool.query('SELECT id, role FROM users WHERE id = ?', [agentId]);
  if (agents.length === 0 || agents[0].role !== 'agent') {
    const err = new Error('Target user not found or is not an agent');
    err.statusCode = 400;
    throw err;
  }

  await pool.query('UPDATE fields SET assigned_agent_id = ? WHERE id = ?', [agentId, fieldId]);

  const [rows] = await pool.query('SELECT * FROM fields WHERE id = ?', [fieldId]);
  if (rows.length === 0) {
    const err = new Error('Field not found');
    err.statusCode = 404;
    throw err;
  }
  return rows[0];
};

// ─── deleteField ──────────────────────────────────────────────────────────────
const deleteField = async (id) => {
  const [rows] = await pool.query('SELECT id FROM fields WHERE id = ?', [id]);
  if (rows.length === 0) {
    const err = new Error('Field not found');
    err.statusCode = 404;
    throw err;
  }
  await pool.query('DELETE FROM fields WHERE id = ?', [id]);
};

module.exports = { createField, updateField, getAllFields, getFieldById, assignField, deleteField };