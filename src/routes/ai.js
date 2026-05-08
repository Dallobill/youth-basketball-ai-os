const express = require('express');
const {
  createAiReport,
  getAiReports,
  createAiReportReview,
  getAiReportReviews,
  getAiReportExport
} = require('../db');
const {
  buildPlayerSummary,
  buildTeamSummary,
  buildPracticePlan,
  buildParentUpdate
} = require('../services/aiService');

const REVIEW_STATUSES = new Set(['approved', 'rejected', 'changes_requested']);

function extractHeadline(output, fallback) {
  return (
    output?.headline || output?.practiceTheme || output?.message || fallback
  );
}

function extractContent(output) {
  if (!output || typeof output !== 'object') {
    return '';
  }

  const priorityKeys = [
    'coachFocus',
    'playerMessage',
    'parentDraft',
    'message',
    'coachingEmphasis',
    'practiceTheme'
  ];
  for (const key of priorityKeys) {
    if (typeof output[key] === 'string' && output[key].trim()) {
      return output[key].trim();
    }
  }

  return JSON.stringify(output);
}

async function persistReport({ reportType, output, payload }) {
  const reportTypeMap = {
    team_summary: 'trend_summary',
    practice_plan: 'intervention_plan'
  };
  const normalizedReportType = reportTypeMap[reportType] || reportType;

  return createAiReport({
    organizationId: payload.organizationId || payload.organization_id,
    reportType: normalizedReportType,
    sourceType: payload.sourceType || 'daily',
    headline: extractHeadline(output, reportType.replaceAll('_', ' ')),
    content: extractContent(output),
    teamId: payload.teamId || payload.team_id || null,
    playerId: payload.playerId || payload.player_id || null,
    rangeStart: payload.rangeStart || null,
    rangeEnd: payload.rangeEnd || null
  });
}

router.post('/player-summary', async (req, res) => {
  try {
    const output = await buildPlayerSummary(req.body);
    const savedReport = await persistReport({
      reportType: 'player_summary',
      output,
      payload: req.body || {}
    });
    return res.json({ ...output, reportId: savedReport.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/team-summary', async (req, res) => {
  try {
    const output = await buildTeamSummary(req.body);
    const savedReport = await persistReport({
      reportType: 'team_summary',
      output,
      payload: req.body || {}
    });
    return res.json({ ...output, reportId: savedReport.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/practice-plan', async (req, res) => {
  try {
    const output = await buildPracticePlan(req.body);
    const savedReport = await persistReport({
      reportType: 'practice_plan',
      output,
      payload: req.body || {}
    });
    return res.json({ ...output, reportId: savedReport.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/parent-update', async (req, res) => {
  try {
    const output = await buildParentUpdate(req.body);
    const savedReport = await persistReport({
      reportType: 'parent_update',
      output,
      payload: req.body || {}
    });
    return res.json({ ...output, reportId: savedReport.id });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

router.get('/reports', async (req, res) => {
  try {
    const { teamId, playerId, reportType, page, pageSize } = req.query;
    const result = await getAiReports({
      teamId,
      playerId,
      reportType,
      page,
      pageSize
    });

  async function persistReport({ reportType, output, payload }) {
    const reportTypeMap = {
      team_summary: 'trend_summary',
      practice_plan: 'intervention_plan'
    };
    const normalizedReportType = reportTypeMap[reportType] || reportType;

    return createAiReportFn({
      organizationId: payload.organizationId || payload.organization_id,
      reportType: normalizedReportType,
      sourceType: payload.sourceType || 'daily',
      headline: extractHeadline(output, reportType.replaceAll('_', ' ')),
      content: extractContent(output),
      teamId: payload.teamId || payload.team_id || null,
      playerId: payload.playerId || payload.player_id || null,
      rangeStart: payload.rangeStart || null,
      rangeEnd: payload.rangeEnd || null
    });
  }

  router.post('/player-summary', async (req, res) => {
    try {
      const output = await buildPlayerSummary(req.body);
      const savedReport = await persistReport({
        reportType: 'player_summary',
        output,
        payload: req.body || {}
      });
      return res.json({ ...output, reportId: savedReport.id });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.post('/team-summary', async (req, res) => {
    try {
      const output = await buildTeamSummary(req.body);
      const savedReport = await persistReport({
        reportType: 'team_summary',
        output,
        payload: req.body || {}
      });
      return res.json({ ...output, reportId: savedReport.id });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.post('/practice-plan', async (req, res) => {
    try {
      const output = await buildPracticePlan(req.body);
      const savedReport = await persistReport({
        reportType: 'practice_plan',
        output,
        payload: req.body || {}
      });
      return res.json({ ...output, reportId: savedReport.id });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.post('/parent-update', async (req, res) => {
    try {
      const output = await buildParentUpdate(req.body);
      const savedReport = await persistReport({
        reportType: 'parent_update',
        output,
        payload: req.body || {}
      });
      return res.json({ ...output, reportId: savedReport.id });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.get('/reports', async (req, res) => {
    try {
      const { teamId, playerId, reportType, page, pageSize } = req.query;
      const result = await getAiReportsFn({
        teamId,
        playerId,
        reportType,
        page,
        pageSize
      });

      return res.json({
        data: result.rows,
        pagination: result.pagination
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.get('/reports/:reportId/export', async (req, res) => {
    try {
      const exported = await getAiReportExportFn({
        reportId: req.params.reportId
      });

      if (!exported) {
        return res.status(404).json({ error: 'AI report not found' });
      }

      return res.json({ data: exported });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.get('/reports/:reportId/reviews', async (req, res) => {
    try {
      const rows = await getAiReportReviewsFn({
        reportId: req.params.reportId
      });
      return res.json({ data: rows });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.post('/reports/:reportId/review', async (req, res) => {
    try {
      const {
        status,
        rating = null,
        editedHeadline = null,
        editedSummaryText = null,
        feedbackNotes = null,
        reviewTags = []
      } = req.body || {};

      if (!REVIEW_STATUSES.has(status)) {
        return res.status(400).json({
          error: 'status must be approved, rejected, or changes_requested'
        });
      }

      const parsedRating = parseOptionalRating(rating);
      if (parsedRating === undefined) {
        return res
          .status(400)
          .json({ error: 'rating must be an integer from 1 to 5' });
      }

      if (!Array.isArray(reviewTags)) {
        return res.status(400).json({ error: 'reviewTags must be an array' });
      }

      const review = await createAiReportReviewFn({
        reportId: req.params.reportId,
        reviewerSub: req.auth?.sub || null,
        reviewerEmail: req.auth?.email || null,
        status,
        rating: parsedRating,
        editedHeadline,
        editedSummaryText,
        feedbackNotes,
        reviewTags
      });

      return res.status(201).json({ data: review });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createAiRouter;
