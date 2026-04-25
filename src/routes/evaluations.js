const express = require('express');
const { query } = require('../db');
const { requireWriteRole, canAccessTeam, canAccessPlayer } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireWriteRole, async (req, res) => {
  try {
    const {
      teamId,
      playerId,
      coachId,
      evaluationType,
      practiceId,
      gameId,
      ballHandling,
      finishing,
      shooting,
      passingDecision,
      defenseOnBall,
      defenseHelp,
      rebounding,
      communication,
      motorEffort,
      basketballIq,
      strengths,
      priorities,
      notes
    } = req.body;

    const [teamAllowed, playerAllowed] = await Promise.all([
      canAccessTeam(req, teamId),
      canAccessPlayer(req, playerId)
    ]);

    if (!teamAllowed || !playerAllowed) {
      return res.status(403).json({ error: 'Evaluation access denied' });
    }

    const result = await query(
      `INSERT INTO evaluations (
        team_id, player_id, coach_id, evaluation_type, practice_id, game_id,
        ball_handling, finishing, shooting, passing_decision,
        defense_on_ball, defense_help, rebounding, communication,
        motor_effort, basketball_iq, strengths, priorities, notes
      ) VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,
        $11,$12,$13,$14,
        $15,$16,$17,$18,$19
      ) RETURNING *`,
      [
        teamId,
        playerId,
        coachId || null,
        evaluationType,
        practiceId || null,
        gameId || null,
        ballHandling || null,
        finishing || null,
        shooting || null,
        passingDecision || null,
        defenseOnBall || null,
        defenseHelp || null,
        rebounding || null,
        communication || null,
        motorEffort || null,
        basketballIq || null,
        strengths || null,
        priorities || null,
        notes || null
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/player/:playerId', async (req, res) => {
  try {
    const playerAllowed = await canAccessPlayer(req, req.params.playerId);
    if (!playerAllowed) {
      return res.status(403).json({ error: 'Player access denied' });
    }

    let result;
    if (req.auth.organizationIds.length > 0) {
      result = await query(
        `SELECT e.*
         FROM evaluations e
         INNER JOIN teams t ON t.id = e.team_id
         WHERE e.player_id = $1
           AND t.organization_id = ANY($2::uuid[])
         ORDER BY e.created_at DESC`,
        [req.params.playerId, req.auth.organizationIds]
      );
    } else {
      result = await query(
        `SELECT *
         FROM evaluations
         WHERE player_id = $1
           AND team_id = ANY($2::uuid[])
         ORDER BY created_at DESC`,
        [req.params.playerId, req.auth.teamIds]
      );
    }

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
