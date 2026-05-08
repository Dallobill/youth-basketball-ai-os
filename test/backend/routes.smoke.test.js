const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../../src/app');

async function withServer(app, run) {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('GET /health returns connected response', async () => {
  const app = createApp({
    queryFn: async () => ({ rows: [] })
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, { ok: true, database: 'connected' });
  });
});

test('POST /api/evaluations returns created evaluation', async () => {
  const queryCalls = [];
  const app = createApp({
    queryFn: async (sql, params) => {
      queryCalls.push({ sql, params });
      return {
        rows: [
          { id: 'eval_1', player_id: params[1], evaluation_type: params[3] }
        ]
      };
    }
  });

  const payload = {
    teamId: 'team_15u',
    playerId: 'player_jaylen',
    evaluationType: 'practice',
    shooting: 7
  };

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/evaluations`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.data.id, 'eval_1');
    assert.equal(queryCalls.length, 1);
    assert.match(queryCalls[0].sql, /INSERT INTO evaluations/);
    assert.equal(queryCalls[0].params[1], 'player_jaylen');
  });
});

test('GET /api/evaluations/player/:playerId returns rows', async () => {
  const app = createApp({
    queryFn: async (sql, params) => {
      if (sql.includes('WHERE player_id = $1')) {
        return {
          rows: [{ id: 'eval_1', player_id: params[0] }]
        };
      }
      return { rows: [] };
    }
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(
      `${baseUrl}/api/evaluations/player/player_jaylen`
    );
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      data: [{ id: 'eval_1', player_id: 'player_jaylen' }]
    });
  });
});
