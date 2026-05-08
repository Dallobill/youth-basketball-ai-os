const test = require('node:test');
const assert = require('node:assert/strict');

async function loadApiModule() {
  return import('../../frontend/src/services/api.js');
}

test('normalizeTeam maps snake_case fields', async () => {
  const { normalizeTeam } = await loadApiModule();

  const result = normalizeTeam({
    id: 'team_15u',
    age_group: '15U',
    roster_count: '12'
  });

  assert.equal(result.ageGroup, '15U');
  assert.equal(result.rosterCount, 12);
});

test('mapDashboardData builds dashboard shell from API responses', async () => {
  const { mapDashboardData } = await loadApiModule();

  const result = mapDashboardData({
    teams: [{ id: 'team_15u', age_group: '15U', roster_count: 3 }],
    players: [{ id: 'player_1' }, { id: 'player_2' }]
  });

  assert.equal(result.totals.totalTeams, 1);
  assert.equal(result.totals.totalPlayers, 2);
  assert.equal(result.teams[0].ageGroup, '15U');
});

test('unwrapApiData accepts array and { data } envelopes', async () => {
  const { unwrapApiData } = await loadApiModule();

  assert.deepEqual(unwrapApiData([{ id: 'direct' }]), [{ id: 'direct' }]);
  assert.deepEqual(unwrapApiData({ data: [{ id: 'wrapped' }] }), [
    { id: 'wrapped' }
  ]);
  assert.deepEqual(unwrapApiData({ id: 'legacy' }, {}), { id: 'legacy' });
  assert.deepEqual(unwrapApiData(null), []);
});

test('normalizePlayer maps wrapped roster fields to frontend keys', async () => {
  const { normalizePlayer } = await loadApiModule();

  const result = normalizePlayer(
    {
      id: 'player_1',
      team_id: 'team_15u',
      first_name: 'Jaylen',
      last_name: 'Smith',
      jersey_number: '4',
      graduation_year: 2030,
      dominant_hand: 'right',
      injury_status: 'healthy'
    },
    'fallback_team'
  );

  assert.equal(result.teamId, 'team_15u');
  assert.equal(result.firstName, 'Jaylen');
  assert.equal(result.lastName, 'Smith');
  assert.equal(result.jerseyNumber, '4');
  assert.equal(result.graduationYear, 2030);
  assert.equal(result.dominantHand, 'right');
  assert.equal(result.injuryStatus, 'healthy');
});

test('normalizeEvaluation maps snake_case metrics and preserves zero scores', async () => {
  const { normalizeEvaluation } = await loadApiModule();

  const result = normalizeEvaluation(
    {
      id: 'eval_1',
      team_id: 'team_15u',
      player_id: 'player_1',
      evaluation_type: 'practice',
      created_at: '2026-05-08T00:00:00.000Z',
      ball_handling: '0',
      finishing: '7.5',
      passing_decision: 6,
      defense_on_ball: null,
      defense_help: undefined,
      motor_effort: '8',
      basketball_iq: 'bad-data'
    },
    { shooting: 4, defenseHelp: 3 }
  );

  assert.equal(result.teamId, 'team_15u');
  assert.equal(result.playerId, 'player_1');
  assert.equal(result.evaluationType, 'practice');
  assert.equal(result.createdAt, '2026-05-08T00:00:00.000Z');
  assert.equal(result.ballHandling, 0);
  assert.equal(result.finishing, 7.5);
  assert.equal(result.shooting, 4);
  assert.equal(result.passingDecision, 6);
  assert.equal(result.defenseOnBall, null);
  assert.equal(result.defenseHelp, 3);
  assert.equal(result.motorEffort, 8);
  assert.equal(result.basketballIq, null);
});
