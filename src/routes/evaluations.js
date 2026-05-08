const express = require('express');

function createEvaluationsRouter(queryFn) {
  const router = express.Router();

  router.post('/', async (req, res) => {
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

      const result = await queryFn(
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

      return res.status(201).json({ data: result.rows[0] });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  router.get('/player/:playerId', async (req, res) => {
    try {
      const result = await queryFn(
        'SELECT * FROM evaluations WHERE player_id = $1 ORDER BY created_at DESC',
        [req.params.playerId]
      );
      return res.json({ data: result.rows });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}

module.exports = createEvaluationsRouter;
