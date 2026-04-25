const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false
});

async function query(text, params = []) {
  const result = await pool.query(text, params);
  return result;
}

async function createAiReport({ reportType, headline = null, content, teamId = null, playerId = null }) {
  const result = await query(
    `INSERT INTO ai_reports (report_type, headline, content, team_id, player_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [reportType, headline, content, teamId, playerId]
  );

  return result.rows[0];
}

async function getAiReports({ teamId, playerId, reportType, page = 1, pageSize = 10 }) {
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
  const safePageSize = Number.isFinite(Number(pageSize)) ? Math.min(Math.max(1, Number(pageSize)), 100) : 10;

  const conditions = [];
  const params = [];

  if (teamId) {
    params.push(teamId);
    conditions.push(`team_id = $${params.length}`);
  }

  if (playerId) {
    params.push(playerId);
    conditions.push(`player_id = $${params.length}`);
  }

  if (reportType) {
    params.push(reportType);
    conditions.push(`report_type = $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(`SELECT COUNT(*)::INT AS total FROM ai_reports ${whereClause}`, params);
  const total = countResult.rows[0]?.total || 0;

  params.push(safePageSize);
  const limitParam = `$${params.length}`;
  params.push((safePage - 1) * safePageSize);
  const offsetParam = `$${params.length}`;

  const rowsResult = await query(
    `SELECT *
     FROM ai_reports
     ${whereClause}
     ORDER BY created_at DESC
     LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params
  );

  return {
    rows: rowsResult.rows,
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages: Math.ceil(total / safePageSize) || 1
    }
  };
}

module.exports = { query, pool, createAiReport, getAiReports };
