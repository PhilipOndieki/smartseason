const dashboardService = require('./dashboard.service');

const getDashboard = async (req, res) => {
  try {
    const data =
      req.user.role === 'admin'
        ? await dashboardService.getAdminDashboard()
        : await dashboardService.getAgentDashboard(req.user.id);

    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = { getDashboard };
