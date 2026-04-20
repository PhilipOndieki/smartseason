// factory so we can do requireRole('admin') or requireRole('agent') inline on routes
const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
};

module.exports = { requireRole };
