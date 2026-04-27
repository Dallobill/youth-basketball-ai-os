const express = require('express');
const { query } = require('../db');

const router = express.Router();

function normalizeTeam(row) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    name: row.name,
    ageGroup: row.age_group,
    season: row.season,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

router.get('/', async (req, res) => {
  try {
    const { status, season, ageGroup } = req.query;
    const filters = [];
    const params = [];

    if (status) {
      params.push(status);
      filters.push(`status = $${params.length}`);
    }

    if (season) {
      params.push(season);
      filters.push(`season = $${params.length}`);
    }

    if (ageGroup) {
      params.push(ageGroup);
      filters.push(`age_group = $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const result = await query(
      `SELECT *
       FROM teams
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    return res.json({ data: result.rows.map(normalizeTeam) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { organizationId, name, ageGroup, season, status = 'active', notes = null } = req.body;

    if (!organizationId || !name || !ageGroup || !season) {
      return res.status(400).json({
        error: 'organizationId, name, ageGroup, and season are required'
      });
    }

    if (!['active', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'status must be active or archived' });
    }

    const result = await query(
      `INSERT INTO teams (organization_id, name, age_group, season, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [organizationId, name, ageGroup, season, status, notes]
    );

    return res.status(201).json({ data: normalizeTeam(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, ageGroup, season, status, notes } = req.body;

    if (status && !['active', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'status must be active or archived' });
    }

    const fields = [];
    const params = [];

    const fieldMap = {
      name: 'name',
      ageGroup: 'age_group',
      season: 'season',
      status: 'status',
      notes: 'notes'
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        params.push(req.body[key]);
        fields.push(`${column} = $${params.length}`);
      }
    }

    if (!fields.length) {
      return res.status(400).json({ error: 'At least one field is required for update' });
    }

    params.push(teamId);
    const result = await query(
      `UPDATE teams
       SET ${fields.join(', ')}
       WHERE id = $${params.length}
       RETURNING *`,
      params
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Team not found' });
    }

    return res.json({ data: normalizeTeam(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
