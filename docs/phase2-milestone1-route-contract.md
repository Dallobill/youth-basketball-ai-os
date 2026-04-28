# Phase 2 Milestone 1 Backend Route Contract

Base URL: `/api`

## Teams

- `GET /teams` (optional query params: `status`, `season`, `ageGroup`)
- `POST /teams`
- `PATCH /teams/:teamId`

All team responses return `{ data: ... }` with camelCase fields.

## Players

- `GET /players` (optional query params: `teamId`, `playerStatus`, `injuryStatus`)
- `GET /players/:playerId`
- `POST /players`
- `PATCH /players/:playerId`
- `POST /players/:playerId/assign-team`

All player responses return `{ data: ... }` with camelCase fields.

## Validation rules implemented

### Teams
- `organizationId`, `name`, `ageGroup`, and `season` are required on create.
- `status` must be `active` or `archived`.

### Players
- `organizationId`, `firstName`, and `lastName` are required on create.
- `dominantHand` must be `left`, `right`, `both`, or `null`.
- `injuryStatus` must be one of: `healthy`, `limited`, `out`, `return_to_play`.
- `playerStatus` must be one of: `active`, `inactive`, `removed`.

## Development Tracking + Trends + Recommendations

- `POST /development/entries`
- `GET /development/players/:playerId/snapshot?days=7|30`
- `POST /development/players/:playerId/recommendation`

All responses return `{ data: ... }` with camelCase fields.

### Development rules
- `organizationId`, `playerId`, `entryDate`, and `entryType` are required on development entry create.
- `entryType` must be one of: `practice`, `game`, `workout`, `film`, `weekly_review`, `monthly_review`.
- Skill metric inputs must be numbers between `0` and `10` (or null/omitted).
- Snapshot endpoint supports `days=7` and `days=30`.
- Recommendation endpoint requires `organizationId` and stores output in `ai_reports`.

## Current implementation notes

- Milestone 1 SQL is available at `sql/phase2_milestone1.sql`.
- Route contract now includes teams, players, development tracking, trend snapshots, and AI recommendations.
