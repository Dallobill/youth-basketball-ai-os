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
