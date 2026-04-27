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

## Current implementation notes

- Milestone 1 SQL is now available at `sql/phase2_milestone1.sql`.
- The route contract here intentionally scopes to teams + players as the first backend implementation step.
