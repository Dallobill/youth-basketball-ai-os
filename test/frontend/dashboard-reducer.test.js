const test = require('node:test');
const assert = require('node:assert/strict');

async function loadReducerModule() {
  return import('../../frontend/src/state/dashboard.js');
}

test('reduceDashboardAfterSave updates recents and totals', async () => {
  const { reduceDashboardAfterSave } = await loadReducerModule();

  const current = {
    totals: { recentEvaluations: 3, aiReports: 2 },
    recentEvaluations: [{ id: 'old_eval' }],
    recentAiReports: [{ id: 'old_ai' }]
  };

  const next = reduceDashboardAfterSave(current, {
    saved: { id: 'new_eval' },
    payload: { playerId: 'player_jaylen' },
    selected: { firstName: 'Jaylen', lastName: 'Smith' },
    summary: { headline: 'New Summary', coachFocus: 'Focus on finishing' },
    nowMs: 1700000000000
  });

  assert.equal(next.totals.recentEvaluations, 4);
  assert.equal(next.totals.aiReports, 3);
  assert.equal(next.recentEvaluations[0].playerName, 'Jaylen Smith');
  assert.equal(next.recentAiReports[0].id, 'ai_1700000000000');
  assert.equal(next.recentAiReports[0].headline, 'New Summary');
});
