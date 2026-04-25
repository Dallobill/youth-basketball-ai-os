const express = require('express');
const { query } = require('../db');
const { requireWriteRole, canAccessOrganization, canAccessTeam, getTeamScope } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { clause, params } = getTeamScope(req);
    const result = await query(
      `SELECT t.*, COUNT(ptm.id) FILTER (WHERE ptm.is_active = TRUE) AS roster_count
       FROM teams t
       LEFT JOIN player_team_memberships ptm ON ptm.team_id = t.id
       WHERE ${clause}
       GROUP BY t.id
       ORDER BY t.created_at DESC`,
      params
    );

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', requireWriteRole, async (req, res) => {
  try {
    const { organizationId, seasonId, name, ageGroup, level } = req.body;

    const hasAccess = await canAccessOrganization(req, organizationId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Organization access denied' });
    }

    const result = await query(
      `INSERT INTO teams (organization_id, season_id, name, age_group, level)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [organizationId, seasonId || null, name, ageGroup || null, level || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM teams WHERE id = $1', [
      req.params.id
    ]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Team not found' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
