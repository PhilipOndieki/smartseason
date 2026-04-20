const pool = require('../../config/db');

const createField = async ({ name, crop_type, planting_date, assigned_agent_id }) => {
  const [result] = await pool.query(
    'INSERT INTO fields (name, crop_type, planting_date, assigned_agent_id) VALUES (?, ?, ?, ?)',
    [name, crop_type || null, planting_date || null, assigned_agent_id || null]
  );
  const [rows] = await pool.query('SELECT * FROM fields WHERE id = ?', [result.insertId]);
  return rows[0];
};

const getAllFields = async (user) => {
  if (user.role === 'admin') {
    // join here saves a second round trip to fetch agent names
    const [rows] = await pool.query(`
      SELECT f.*, u.name AS agent_name
      FROM fields f
      LEFT JOIN users u ON f.assigned_agent_id = u.id
      ORDER BY f.created_at DESC
    `);
    return rows;
  }

  const [rows] = await pool.query(`
    SELECT f.*, u.name AS agent_name
    FROM fields f
    LEFT JOIN users u ON f.assigned_agent_id = u.id
    WHERE f.assigned_agent_id = ?
    ORDER BY f.created_at DESC
  `, [user.id]);
  return rows;
};

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

  const field = fields[0];

  // agents should only see their own fields
  if (user.role === 'agent' && field.assigned_agent_id !== user.id) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  const [updates] = await pool.query(`
    SELECT fu.*, u.name AS agent_name
    FROM field_updates fu
    LEFT JOIN users u ON fu.agent_id = u.id
    WHERE fu.field_id = ?
    ORDER BY fu.created_at DESC
  `, [id]);

  return { ...field, updates };
};

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

const deleteField = async (id) => {
  const [rows] = await pool.query('SELECT id FROM fields WHERE id = ?', [id]);
  if (rows.length === 0) {
    const err = new Error('Field not found');
    err.statusCode = 404;
    throw err;
  }
  await pool.query('DELETE FROM fields WHERE id = ?', [id]);
};

module.exports = { createField, getAllFields, getFieldById, assignField, deleteField };
