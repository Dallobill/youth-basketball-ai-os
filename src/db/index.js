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

async function createAiReport({
  organizationId = null,
  reportType,
  sourceType = 'trend_snapshot',
  headline = null,
  content,
  teamId = null,
  playerId = null,
  rangeStart = null,
  rangeEnd = null,
  riskFlags = [],
  recommendations = [],
  supportingMetrics = {}
}) {
  const result = await query(
    `INSERT INTO ai_reports (
      organization_id, team_id, player_id, source_type, range_start, range_end, report_type, headline,
      summary_text, risk_flags_json, recommendations_json, supporting_metrics_json
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11::jsonb, $12::jsonb)
     RETURNING *`,
    [
      organizationId,
      teamId,
      playerId,
      sourceType,
      rangeStart,
      rangeEnd,
      reportType,
      headline,
      content,
      JSON.stringify(riskFlags),
      JSON.stringify(recommendations),
      JSON.stringify(supportingMetrics)
    ]
  );

  return result.rows[0];
}

async function getAiReports({
  teamId,
  playerId,
  reportType,
  page = 1,
  pageSize = 10
}) {
  const safePage = Number.isFinite(Number(page))
    ? Math.max(1, Number(page))
    : 1;
  const safePageSize = Number.isFinite(Number(pageSize))
    ? Math.min(Math.max(1, Number(pageSize)), 100)
    : 10;

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

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const countResult = await query(
    `SELECT COUNT(*)::INT AS total FROM ai_reports ${whereClause}`,
    params
  );
  const total = countResult.rows[0]?.total || 0;

  params.push(safePageSize);
  const limitParam = `$${params.length}`;
  params.push((safePage - 1) * safePageSize);
  const offsetParam = `$${params.length}`;

  const rowsResult = await query(
    `SELECT *
     FROM ai_reports
     ${whereClause}
     ORDER BY generated_at DESC
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

async function createAiReportReview({
  reportId,
  reviewerSub = null,
  reviewerEmail = null,
  status,
  rating = null,
  editedHeadline = null,
  editedSummaryText = null,
  feedbackNotes = null,
  reviewTags = []
}) {
  const result = await query(
    `INSERT INTO ai_report_reviews (
      ai_report_id, reviewer_sub, reviewer_email, status, rating, edited_headline,
      edited_summary_text, feedback_notes, review_tags_json
    )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
     RETURNING *`,
    [
      reportId,
      reviewerSub,
      reviewerEmail,
      status,
      rating,
      editedHeadline,
      editedSummaryText,
      feedbackNotes,
      JSON.stringify(reviewTags)
    ]
  );

  return result.rows[0];
}

async function getAiReportReviews({ reportId }) {
  const result = await query(
    `SELECT *
     FROM ai_report_reviews
     WHERE ai_report_id = $1
     ORDER BY reviewed_at DESC`,
    [reportId]
  );

  return result.rows;
}

async function getAiReportExport({ reportId }) {
  const reportResult = await query('SELECT * FROM ai_reports WHERE id = $1', [
    reportId
  ]);

  if (!reportResult.rows.length) {
    return null;
  }

  const reviews = await getAiReportReviews({ reportId });

  return {
    report: reportResult.rows[0],
    latestReview: reviews[0] || null,
    reviews
  };
}

module.exports = {
  query,
  pool,
  createAiReport,
  getAiReports,
  getAiReportExport,
  createAiReportReview,
  getAiReportReviews
};
