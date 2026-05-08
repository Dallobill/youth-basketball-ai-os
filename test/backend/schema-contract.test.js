const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const schemaSql = readFileSync(
  path.join(__dirname, '../../sql/schema.sql'),
  'utf8'
);

function extractTableBody(tableName) {
  const marker = `CREATE TABLE IF NOT EXISTS ${tableName} (`;
  const start = schemaSql.indexOf(marker);
  assert.notEqual(start, -1, `Expected ${tableName} table in sql/schema.sql`);

  let depth = 0;
  const bodyStart = start + marker.length;
  for (let index = bodyStart; index < schemaSql.length; index += 1) {
    const char = schemaSql[index];
    if (char === '(') depth += 1;
    if (char === ')') {
      if (depth === 0) {
        return schemaSql.slice(bodyStart, index);
      }
      depth -= 1;
    }
  }

  throw new Error(`Could not parse ${tableName} table body`);
}

function assertColumns(tableName, columns) {
  const body = extractTableBody(tableName);
  for (const column of columns) {
    assert.match(
      body,
      new RegExp(`(^|\\n)\\s*${column}\\s`, 'i'),
      `Expected ${tableName}.${column} in sql/schema.sql`
    );
  }
}

test('canonical schema contains route-backed team and player fields', () => {
  assertColumns('teams', [
    'id',
    'organization_id',
    'name',
    'age_group',
    'season',
    'status',
    'notes',
    'created_at',
    'updated_at'
  ]);

  assertColumns('players', [
    'id',
    'organization_id',
    'team_id',
    'first_name',
    'last_name',
    'preferred_name',
    'graduation_year',
    'position_primary',
    'jersey_number',
    'dominant_hand',
    'injury_status',
    'player_status',
    'created_at',
    'updated_at'
  ]);
});

test('canonical schema contains evaluation and development metric fields', () => {
  const metricColumns = [
    'ball_handling',
    'finishing',
    'shooting',
    'passing_decision',
    'defense_on_ball',
    'defense_help',
    'rebounding',
    'communication',
    'motor_effort',
    'basketball_iq'
  ];

  assertColumns('evaluations', [
    'id',
    'team_id',
    'player_id',
    'coach_id',
    'evaluation_type',
    'practice_id',
    'game_id',
    ...metricColumns,
    'strengths',
    'priorities',
    'notes',
    'created_at'
  ]);

  assertColumns('development_entries', [
    'id',
    'organization_id',
    'team_id',
    'player_id',
    'entry_date',
    'entry_type',
    ...metricColumns,
    'confidence',
    'focus',
    'physical_readiness',
    'strengths',
    'priorities',
    'coach_notes',
    'context_notes',
    'created_at',
    'updated_at'
  ]);
});

test('canonical schema contains AI report fields used by persistence helpers', () => {
  assertColumns('ai_reports', [
    'id',
    'organization_id',
    'team_id',
    'player_id',
    'source_type',
    'range_start',
    'range_end',
    'report_type',
    'headline',
    'summary_text',
    'risk_flags_json',
    'recommendations_json',
    'supporting_metrics_json',
    'generated_at'
  ]);

  assertColumns('ai_report_reviews', [
    'id',
    'ai_report_id',
    'reviewer_sub',
    'reviewer_email',
    'status',
    'rating',
    'edited_headline',
    'edited_summary_text',
    'feedback_notes',
    'review_tags_json',
    'reviewed_at'
  ]);
});

test('canonical schema keeps membership table used by team-scoped auth', () => {
  assertColumns('player_team_memberships', [
    'id',
    'player_id',
    'team_id',
    'start_date',
    'end_date',
    'is_active',
    'created_at',
    'updated_at'
  ]);
});
