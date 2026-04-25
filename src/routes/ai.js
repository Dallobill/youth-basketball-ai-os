const express = require('express');
const {
  buildPlayerSummary,
  buildTeamSummary,
  buildPracticePlan,
  buildParentUpdate
} = require('../services/aiService');

const router = express.Router();

function extractHeadline(output, fallback) {
  return output?.headline || output?.practiceTheme || output?.message || fallback;
}

function extractContent(output) {
  if (!output || typeof output !== 'object') {
    return '';
  }

  const priorityKeys = ['coachFocus', 'playerMessage', 'parentDraft', 'message', 'coachingEmphasis', 'practiceTheme'];
  for (const key of priorityKeys) {
    if (typeof output[key] === 'string' && output[key].trim()) {
      return output[key].trim();
    }
  }

  return JSON.stringify(output);
}

async function persistReport({ reportType, output, payload }) {
  return createAiReport({
    reportType,
    headline: extractHeadline(output, reportType.replaceAll('_', ' ')),
    content: extractContent(output),
    teamId: payload.teamId || payload.team_id || null,
    playerId: payload.playerId || payload.player_id || null
  });
}

router.post('/player-summary', async (req, res) => {
  try {
    const output = await buildPlayerSummary(req.body);
    const savedReport = await persistReport({ reportType: 'player_summary', output, payload: req.body || {} });
    return res.json({ ...output, reportId: savedReport.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/team-summary', async (req, res) => {
  try {
    const output = await buildTeamSummary(req.body);
    const savedReport = await persistReport({ reportType: 'team_summary', output, payload: req.body || {} });
    return res.json({ ...output, reportId: savedReport.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/practice-plan', async (req, res) => {
  try {
    const output = await buildPracticePlan(req.body);
    const savedReport = await persistReport({ reportType: 'practice_plan', output, payload: req.body || {} });
    return res.json({ ...output, reportId: savedReport.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/parent-update', async (req, res) => {
  try {
    const output = await buildParentUpdate(req.body);
    const savedReport = await persistReport({ reportType: 'parent_update', output, payload: req.body || {} });
    return res.json({ ...output, reportId: savedReport.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/reports', async (req, res) => {
  try {
    const { teamId, playerId, reportType, page, pageSize } = req.query;
    const result = await getAiReports({ teamId, playerId, reportType, page, pageSize });

    return res.json({
      data: result.rows,
      pagination: result.pagination
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
