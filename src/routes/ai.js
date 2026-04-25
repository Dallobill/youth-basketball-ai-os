const express = require('express');
const {
  buildPlayerSummary,
  buildTeamSummary,
  buildPracticePlan,
  buildParentUpdate
} = require('../services/aiService');

const router = express.Router();

router.post('/player-summary', async (req, res) => {
  try {
    const output = await buildPlayerSummary(req.body);
    return res.json(output);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/team-summary', async (req, res) => {
  try {
    const output = await buildTeamSummary(req.body);
    return res.json(output);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/practice-plan', async (req, res) => {
  try {
    const output = await buildPracticePlan(req.body);
    return res.json(output);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/parent-update', async (req, res) => {
  try {
    const output = await buildParentUpdate(req.body);
    return res.json(output);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
