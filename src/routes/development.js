const express = require('express');
const { query, createAiReport } = require('../db');
const { buildTrendRecommendation } = require('../services/aiService');

const router = express.Router();

const metricColumns = [
  'ball_handling',
  'finishing',
  'shooting',
  'passing_decision',
  'defense_on_ball',
  'defense_help',
  'rebounding',
  'communication',
  'motor_effort',
  'basketball_iq',
  'confidence',
  'focus',
  'physical_readiness'
];

function toMetricKey(column) {
  return column.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function normalizeEntry(row) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    teamId: row.team_id,
    playerId: row.player_id,
    entryDate: row.entry_date,
    entryType: row.entry_type,
    ballHandling: row.ball_handling,
    finishing: row.finishing,
    shooting: row.shooting,
    passingDecision: row.passing_decision,
    defenseOnBall: row.defense_on_ball,
    defenseHelp: row.defense_help,
    rebounding: row.rebounding,
    communication: row.communication,
    motorEffort: row.motor_effort,
    basketballIq: row.basketball_iq,
    confidence: row.confidence,
    focus: row.focus,
    physicalReadiness: row.physical_readiness,
    strengths: row.strengths,
    priorities: row.priorities,
    coachNotes: row.coach_notes,
    contextNotes: row.context_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

router.post('/entries', async (req, res) => {
  try {
    const {
      organizationId,
      teamId = null,
      playerId,
      entryDate,
      entryType,
      strengths = null,
      priorities = null,
      coachNotes = null,
      contextNotes = null,
      ...rawMetrics
    } = req.body;

    if (!organizationId || !playerId || !entryDate || !entryType) {
      return res.status(400).json({
        error: 'organizationId, playerId, entryDate, and entryType are required'
      });
    }

    const validTypes = [
      'practice',
      'game',
      'workout',
      'film',
      'weekly_review',
      'monthly_review'
    ];
    if (!validTypes.includes(entryType)) {
      return res.status(400).json({ error: 'Invalid entryType value' });
    }

    const camelMetrics = Object.fromEntries(
      metricColumns.map((col) => [toMetricKey(col), col])
    );
    const metricValues = {};

    for (const [apiKey, column] of Object.entries(camelMetrics)) {
      if (Object.prototype.hasOwnProperty.call(rawMetrics, apiKey)) {
        const value = rawMetrics[apiKey];
        if (
          value !== null &&
          (typeof value !== 'number' || value < 0 || value > 10)
        ) {
          return res.status(400).json({
            error: `${apiKey} must be a number between 0 and 10 or null`
          });
        }
        metricValues[column] = value;
      }
    }

    const columns = [
      'organization_id',
      'team_id',
      'player_id',
      'entry_date',
      'entry_type'
    ];
    const values = [organizationId, teamId, playerId, entryDate, entryType];

    for (const column of metricColumns) {
      columns.push(column);
      values.push(
        Object.prototype.hasOwnProperty.call(metricValues, column)
          ? metricValues[column]
          : null
      );
    }

    columns.push('strengths', 'priorities', 'coach_notes', 'context_notes');
    values.push(strengths, priorities, coachNotes, contextNotes);

    const placeholders = values.map((_, idx) => `$${idx + 1}`).join(', ');

    const result = await query(
      `INSERT INTO development_entries (${columns.join(', ')})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );

    return res.status(201).json({ data: normalizeEntry(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/players/:playerId/snapshot', async (req, res) => {
  try {
    const days = Number.parseInt(req.query.days || '7', 10);
    if (![7, 30].includes(days)) {
      return res.status(400).json({ error: 'days must be 7 or 30' });
    }

    const params = [req.params.playerId, days];
    const rowsResult = await query(
      `SELECT *
       FROM development_entries
       WHERE player_id = $1 AND entry_date >= CURRENT_DATE - ($2::INT - 1)
       ORDER BY entry_date DESC`,
      params
    );

    const averageSql = metricColumns
      .map(
        (column) =>
          `AVG(${column}) FILTER (WHERE ${column} IS NOT NULL) AS avg_${column}`
      )
      .join(', ');

    const averagesResult = await query(
      `SELECT ${averageSql}
       FROM development_entries
       WHERE player_id = $1 AND entry_date >= CURRENT_DATE - ($2::INT - 1)`,
      params
    );

    const averagesRow = averagesResult.rows[0] || {};
    const averages = Object.fromEntries(
      metricColumns.map((column) => {
        const value = averagesRow[`avg_${column}`];
        return [
          toMetricKey(column),
          value === null || value === undefined ? null : Number(value)
        ];
      })
    );

    const sorted = Object.entries(averages)
      .filter(([, value]) => typeof value === 'number')
      .sort((a, b) => b[1] - a[1]);

    return res.json({
      data: {
        playerId: req.params.playerId,
        days,
        entryCount: rowsResult.rows.length,
        rangeStart: rowsResult.rows.length
          ? rowsResult.rows[rowsResult.rows.length - 1].entry_date
          : null,
        rangeEnd: rowsResult.rows.length ? rowsResult.rows[0].entry_date : null,
        averages,
        strongestAreas: sorted.slice(0, 3).map(([metric]) => metric),
        weakestAreas: sorted.slice(-3).map(([metric]) => metric),
        entries: rowsResult.rows.map(normalizeEntry)
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/players/:playerId/recommendation', async (req, res) => {
  try {
    const { organizationId, teamId = null, days = 7 } = req.body;
    if (!organizationId) {
      return res.status(400).json({ error: 'organizationId is required' });
    }

    const snapshotResult = await query(
      `SELECT
        AVG(ball_handling) AS ball_handling,
        AVG(finishing) AS finishing,
        AVG(shooting) AS shooting,
        AVG(passing_decision) AS passing_decision,
        AVG(defense_on_ball) AS defense_on_ball,
        AVG(defense_help) AS defense_help,
        AVG(rebounding) AS rebounding,
        AVG(communication) AS communication,
        AVG(motor_effort) AS motor_effort,
        AVG(basketball_iq) AS basketball_iq,
        AVG(confidence) AS confidence,
        AVG(focus) AS focus,
        AVG(physical_readiness) AS physical_readiness,
        MIN(entry_date) AS range_start,
        MAX(entry_date) AS range_end,
        COUNT(*)::INT AS entry_count
      FROM development_entries
      WHERE player_id = $1 AND entry_date >= CURRENT_DATE - ($2::INT - 1)`,
      [req.params.playerId, days]
    );

    const snapshot = snapshotResult.rows[0];
    if (!snapshot || !snapshot.entry_count) {
      return res
        .status(404)
        .json({ error: 'No development entries found for the selected range' });
    }

    const output = await buildTrendRecommendation({
      playerId: req.params.playerId,
      days,
      snapshot
    });

    const saved = await createAiReport({
      organizationId,
      teamId,
      playerId: req.params.playerId,
      sourceType: 'trend_snapshot',
      reportType: 'recommendation',
      headline: output.headline,
      content: output.summary,
      rangeStart: snapshot.range_start,
      rangeEnd: snapshot.range_end,
      riskFlags: output.riskFlags,
      recommendations: output.interventions,
      supportingMetrics: output.supportingMetrics
    });

    return res.status(201).json({ data: { ...output, reportId: saved.id } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
