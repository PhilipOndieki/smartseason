const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../../config/db');

const signToken = (user) =>
  jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, is_super: user.is_super },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

const register = async ({ name, email, password, role }) => {
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length > 0) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const validRole = 'agent';

  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, password_hash, validRole]
  );

  const user = { id: result.insertId, name, email, role: validRole };
  return { token: signToken(user), user };
};

const login = async ({ email, password }) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const payload = { 
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_super: user.is_super,
  };
  return { token: signToken(payload), user: payload };
};

const getAgents = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, email FROM users WHERE role = ? ORDER BY name ASC',
    ['agent']
  );
  return rows;
};

const updateUserRole = async (userId, role, requestingUserId) => {
  const [[requester]] = await pool.query('SELECT is_super FROM users WHERE id = ?', [requestingUserId]);
  const [[target]] = await pool.query('SELECT role, is_super FROM users WHERE id = ?', [userId]);

  if (!target) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  if (target.is_super) {
    const err = new Error('This user cannot be reassigned');
    err.statusCode = 403;
    throw err;
  }

  if (target.role === 'admin' && !requester.is_super) {
    const err = new Error('Only the primary admin can demote other admins');
    err.statusCode = 403;
    throw err;
  }

  if (!requester) {
    const err = new Error('Requesting user not found')
    err.statusCode = 404
    throw err
  }

  
  const validRole = ['admin', 'agent'].includes(role) ? role : 'agent';
  await pool.query('UPDATE users SET role = ? WHERE id = ?', [validRole, userId]);

  const [updated] = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = ?',
    [userId]
  );
  return updated[0];
};

const getUsers = async () => {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  return rows;
};

module.exports = { register, login, getAgents, updateUserRole, getUsers };

