const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { createApp } = require('../../src/app');

process.env.JWT_SECRET = 'test-secret';

function base64Url(value) {
  return Buffer.from(JSON.stringify(value))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function createToken(payload) {
  const encodedHeader = base64Url({ alg: 'HS256', typ: 'JWT' });
  const encodedPayload = base64Url({
    sub: 'coach_1',
    email: 'coach@example.com',
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...payload
  });
  const signature = crypto
    .createHmac('sha256', process.env.JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function authHeaders(payload = {}) {
  return {
    authorization: `Bearer ${createToken({ role: 'coach', ...payload })}`
  };
}

async function withServer(app, run) {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('POST /api/ai/reports/:reportId/review creates coach review', async () => {
  const reviewCalls = [];
  const app = createApp({
    queryFn: async () => ({ rows: [] }),
    aiRouterOptions: {
      createAiReportReviewFn: async (input) => {
        reviewCalls.push(input);
        return {
          id: 'review_1',
          ai_report_id: input.reportId,
          status: input.status,
          rating: input.rating,
          reviewer_sub: input.reviewerSub,
          reviewer_email: input.reviewerEmail,
          edited_summary_text: input.editedSummaryText,
          feedback_notes: input.feedbackNotes,
          review_tags_json: input.reviewTags
        };
      }
    }
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/ai/reports/report_1/review`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...authHeaders() },
      body: JSON.stringify({
        status: 'approved',
        rating: 5,
        editedSummaryText: 'Approved summary for parent update.',
        feedbackNotes: 'Specific and useful.',
        reviewTags: ['specific', 'parent-ready']
      })
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.data.id, 'review_1');
    assert.equal(body.data.status, 'approved');
    assert.equal(body.data.rating, 5);
    assert.equal(reviewCalls.length, 1);
    assert.deepEqual(reviewCalls[0], {
      reportId: 'report_1',
      reviewerSub: 'coach_1',
      reviewerEmail: 'coach@example.com',
      status: 'approved',
      rating: 5,
      editedHeadline: null,
      editedSummaryText: 'Approved summary for parent update.',
      feedbackNotes: 'Specific and useful.',
      reviewTags: ['specific', 'parent-ready']
    });
  });
});

test('POST /api/ai/reports/:reportId/review validates status and rating', async () => {
  const reviewCalls = [];
  const app = createApp({
    queryFn: async () => ({ rows: [] }),
    aiRouterOptions: {
      createAiReportReviewFn: async (input) => {
        reviewCalls.push(input);
        return { id: 'review_1' };
      }
    }
  });

  await withServer(app, async (baseUrl) => {
    const invalidStatus = await fetch(
      `${baseUrl}/api/ai/reports/report_1/review`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status: 'published', rating: 4 })
      }
    );

    assert.equal(invalidStatus.status, 400);
    assert.deepEqual(await invalidStatus.json(), {
      error: 'status must be approved, rejected, or changes_requested'
    });

    const invalidRating = await fetch(
      `${baseUrl}/api/ai/reports/report_1/review`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ status: 'changes_requested', rating: 6 })
      }
    );

    assert.equal(invalidRating.status, 400);
    assert.deepEqual(await invalidRating.json(), {
      error: 'rating must be an integer from 1 to 5'
    });
    assert.equal(reviewCalls.length, 0);
  });
});

test('GET /api/ai/reports/:reportId/reviews returns review history', async () => {
  const app = createApp({
    queryFn: async () => ({ rows: [] }),
    aiRouterOptions: {
      getAiReportReviewsFn: async ({ reportId }) => [
        {
          id: 'review_1',
          ai_report_id: reportId,
          status: 'changes_requested',
          rating: 3
        }
      ]
    }
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/ai/reports/report_1/reviews`, {
      headers: authHeaders({ role: 'parent' })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(body, {
      data: [
        {
          id: 'review_1',
          ai_report_id: 'report_1',
          status: 'changes_requested',
          rating: 3
        }
      ]
    });
  });
});

test('GET /api/ai/reports/:reportId/export returns report with reviews', async () => {
  const app = createApp({
    queryFn: async () => ({ rows: [] }),
    aiRouterOptions: {
      getAiReportExportFn: async ({ reportId }) => ({
        report: {
          id: reportId,
          headline: 'Player development summary',
          summary_text: 'Keep building confident decisions.'
        },
        latestReview: {
          id: 'review_1',
          status: 'approved',
          rating: 5
        },
        reviews: [
          {
            id: 'review_1',
            status: 'approved',
            rating: 5
          }
        ]
      })
    }
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/ai/reports/report_1/export`, {
      headers: authHeaders({ role: 'parent' })
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.data.report.id, 'report_1');
    assert.equal(body.data.latestReview.status, 'approved');
    assert.equal(body.data.reviews.length, 1);
  });
});

test('GET /api/ai/reports/:reportId/export returns 404 for missing report', async () => {
  const app = createApp({
    queryFn: async () => ({ rows: [] }),
    aiRouterOptions: {
      getAiReportExportFn: async () => null
    }
  });

  await withServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/ai/reports/missing/export`, {
      headers: authHeaders({ role: 'coach' })
    });
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.deepEqual(body, { error: 'AI report not found' });
  });
});
