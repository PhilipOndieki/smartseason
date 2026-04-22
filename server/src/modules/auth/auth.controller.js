const authService = require('./auth.service');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'name, email and password are required' });
    }

    const result = await authService.register({ name, email, password, role });
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'email and password are required' });
    }

    const result = await authService.login({ email, password });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getAgents = async (req, res) => {
  try {
    const agents = await authService.getAgents();
    return res.status(200).json({ success: true, data: agents });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ success: false, message: 'role is required' });
    const user = await authService.updateUserRole(Number(req.params.id), role);
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await authService.getUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getAgents, updateUserRole, getUsers };
