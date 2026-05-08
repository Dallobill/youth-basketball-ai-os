const express = require('express');
const { query } = require('../db');

const router = express.Router();

function normalizePlayer(row) {
  return {
    id: row.id,
    organizationId: row.organization_id,
    teamId: row.team_id,
    firstName: row.first_name,
    lastName: row.last_name,
    preferredName: row.preferred_name,
    graduationYear: row.graduation_year,
    positionPrimary: row.position_primary,
    jerseyNumber: row.jersey_number,
    dominantHand: row.dominant_hand,
    injuryStatus: row.injury_status,
    playerStatus: row.player_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

router.get('/', async (req, res) => {
  try {
    const { teamId, playerStatus, injuryStatus } = req.query;
    const filters = [];
    const params = [];

    if (teamId) {
      params.push(teamId);
      filters.push(`team_id = $${params.length}`);
    }

    if (playerStatus) {
      params.push(playerStatus);
      filters.push(`player_status = $${params.length}`);
    }

    if (injuryStatus) {
      params.push(injuryStatus);
      filters.push(`injury_status = $${params.length}`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const result = await query(
      `SELECT *
       FROM players
       ${whereClause}
       ORDER BY last_name, first_name`,
      params
    );

    return res.json({ data: result.rows.map(normalizePlayer) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:playerId', async (req, res) => {
  try {
    const result = await query('SELECT * FROM players WHERE id = $1', [
      req.params.playerId
    ]);

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Player not found' });
    }

    return res.json({ data: normalizePlayer(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      organizationId,
      teamId = null,
      firstName,
      lastName,
      preferredName = null,
      graduationYear = null,
      positionPrimary = null,
      jerseyNumber = null,
      dominantHand = null,
      injuryStatus = 'healthy',
      playerStatus = 'active'
    } = req.body;

    if (!organizationId || !firstName || !lastName) {
      return res.status(400).json({
        error: 'organizationId, firstName, and lastName are required'
      });
    }

    if (!['left', 'right', 'both', null].includes(dominantHand)) {
      return res
        .status(400)
        .json({ error: 'dominantHand must be left, right, both, or null' });
    }

    if (
      !['healthy', 'limited', 'out', 'return_to_play'].includes(injuryStatus)
    ) {
      return res.status(400).json({ error: 'Invalid injuryStatus value' });
    }

    if (!['active', 'inactive', 'removed'].includes(playerStatus)) {
      return res.status(400).json({ error: 'Invalid playerStatus value' });
    }

    const result = await query(
      `INSERT INTO players (
         organization_id, team_id, first_name, last_name, preferred_name,
         graduation_year, position_primary, jersey_number, dominant_hand,
         injury_status, player_status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        organizationId,
        teamId,
        firstName,
        lastName,
        preferredName,
        graduationYear,
        positionPrimary,
        jerseyNumber,
        dominantHand,
        injuryStatus,
        playerStatus
      ]
    );

    return res.status(201).json({ data: normalizePlayer(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.patch('/:playerId', async (req, res) => {
  try {
    const fieldMap = {
      teamId: 'team_id',
      firstName: 'first_name',
      lastName: 'last_name',
      preferredName: 'preferred_name',
      graduationYear: 'graduation_year',
      positionPrimary: 'position_primary',
      jerseyNumber: 'jersey_number',
      dominantHand: 'dominant_hand',
      injuryStatus: 'injury_status',
      playerStatus: 'player_status'
    };

    const params = [];
    const updates = [];

    for (const [key, column] of Object.entries(fieldMap)) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        params.push(req.body[key]);
        updates.push(`${column} = $${params.length}`);
      }
    }

    if (!updates.length) {
      return res
        .status(400)
        .json({ error: 'At least one field is required for update' });
    }

    params.push(req.params.playerId);

    const result = await query(
      `UPDATE players
       SET ${updates.join(', ')}
       WHERE id = $${params.length}
       RETURNING *`,
      params
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Player not found' });
    }

    return res.json({ data: normalizePlayer(result.rows[0]) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/:playerId/assign-team', async (req, res) => {
  try {
    const { teamId } = req.body;

    if (!teamId) {
      return res.status(400).json({ error: 'teamId is required' });
    }

    const existing = await query('SELECT team_id FROM players WHERE id = $1', [
      req.params.playerId
    ]);
    if (!existing.rows.length) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const previousTeamId = existing.rows[0].team_id;

    const result = await query(
      `UPDATE players
       SET team_id = $1
       WHERE id = $2
       RETURNING id, team_id, updated_at`,
      [teamId, req.params.playerId]
    );

    return res.json({
      data: {
        playerId: result.rows[0].id,
        previousTeamId,
        newTeamId: result.rows[0].team_id,
        updatedAt: result.rows[0].updated_at
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
