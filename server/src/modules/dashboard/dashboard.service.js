const pool = require('../../config/db');

const getAdminDashboard = async () => {
  const [[{ total_fields }]] = await pool.query('SELECT COUNT(*) AS total_fields FROM fields');

  // single query for status breakdown(cheaper than three separate COUNT queries)
  const [statusRows] = await pool.query(`
    SELECT status, COUNT(*) AS count
    FROM fields
    GROUP BY status
  `);
  const statusBreakdown = { active: 0, at_risk: 0, completed: 0 };
  statusRows.forEach((r) => { statusBreakdown[r.status] = r.count; });

  const [stageRows] = await pool.query(`
    SELECT current_stage, COUNT(*) AS count
    FROM fields
    GROUP BY current_stage
  `);
  const fieldsByStage = { planted: 0, growing: 0, ready: 0, harvested: 0 };
  stageRows.forEach((r) => { fieldsByStage[r.current_stage] = r.count; });

  const [recentUpdates] = await pool.query(`
    SELECT fu.id, fu.stage, fu.notes, fu.risk_flags, fu.created_at,
           f.name AS field_name,
           u.name AS agent_name
    FROM field_updates fu
    LEFT JOIN fields f ON fu.field_id = f.id
    LEFT JOIN users u ON fu.agent_id = u.id
    ORDER BY fu.created_at DESC
    LIMIT 5
  `);

  return { total_fields, status_breakdown: statusBreakdown, fields_by_stage: fieldsByStage, recent_updates: recentUpdates };
};

const getAgentDashboard = async (agentId) => {
  const [[{ assigned_fields }]] = await pool.query(
    'SELECT COUNT(*) AS assigned_fields FROM fields WHERE assigned_agent_id = ?',
    [agentId]
  );

  const [statusRows] = await pool.query(`
    SELECT status, COUNT(*) AS count
    FROM fields
    WHERE assigned_agent_id = ?
    GROUP BY status
  `, [agentId]);
  const statusBreakdown = { active: 0, at_risk: 0, completed: 0 };
  statusRows.forEach((r) => { statusBreakdown[r.status] = r.count; });

  const [recentUpdates] = await pool.query(`
    SELECT fu.id, fu.stage, fu.notes, fu.risk_flags, fu.created_at,
           f.name AS field_name
    FROM field_updates fu
    LEFT JOIN fields f ON fu.field_id = f.id
    WHERE fu.agent_id = ?
    ORDER BY fu.created_at DESC
    LIMIT 5
  `, [agentId]);

  return { assigned_fields, status_breakdown: statusBreakdown, recent_updates: recentUpdates };
};

module.exports = { getAdminDashboard, getAgentDashboard };
