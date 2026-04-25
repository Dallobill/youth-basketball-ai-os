const express = require('express');
const { query } = require('../db');
const { requireWriteRole, canAccessOrganization, canAccessPlayer, canAccessTeam } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { teamId } = req.query;

    if (teamId) {
      const teamAllowed = await canAccessTeam(req, teamId);
      if (!teamAllowed) {
        return res.status(403).json({ error: 'Team access denied' });
      }

      const result = await query(
        `SELECT p.*
         FROM players p
         INNER JOIN player_team_memberships ptm ON ptm.player_id = p.id
         WHERE ptm.team_id = $1 AND ptm.is_active = TRUE
         ORDER BY p.last_name, p.first_name`,
        [teamId]
      );

      return res.json(result.rows);
    }

    const result = await query(
      'SELECT * FROM players ORDER BY last_name, first_name'
    );
    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post('/', requireWriteRole, async (req, res) => {
  try {
    const {
      organizationId,
      firstName,
      lastName,
      birthDate,
      graduationYear,
      position,
      jerseyNumber,
      dominantHand,
      guardianName,
      guardianEmail,
      guardianPhone,
      notes
    } = req.body;

    const hasAccess = await canAccessOrganization(req, organizationId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Organization access denied' });
    }

    const sql = `
      INSERT INTO players (
        organization_id, first_name, last_name, birth_date, graduation_year,
        position, jersey_number, dominant_hand, guardian_name,
        guardian_email, guardian_phone, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
    `;

    const values = [
      organizationId,
      firstName,
      lastName,
      birthDate || null,
      graduationYear || null,
      position || null,
      jerseyNumber || null,
      dominantHand || null,
      guardianName || null,
      guardianEmail || null,
      guardianPhone || null,
      notes || null
    ];

    const result = await query(sql, values);
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM players WHERE id = $1', [
      req.params.id
    ]);
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Player not found' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
