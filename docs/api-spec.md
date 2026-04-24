# API Spec

## Health
- GET `/health`

## Organizations
- POST `/api/organizations`
- GET `/api/organizations/:id`

## Teams
- POST `/api/teams`
- GET `/api/teams/:id`
- GET `/api/organizations/:organizationId/teams`

## Players
- POST `/api/players`
- GET `/api/players/:id`
- PATCH `/api/players/:id`
- GET `/api/teams/:teamId/players`

## Practices
- POST `/api/practices`
- GET `/api/practices/:id`
- GET `/api/teams/:teamId/practices`

## Games
- POST `/api/games`
- GET `/api/games/:id`
- GET `/api/teams/:teamId/games`

## Evaluations
- POST `/api/evaluations`
- GET `/api/players/:playerId/evaluations`
- GET `/api/teams/:teamId/evaluations`

## Attendance
- POST `/api/attendance/sessions`
- POST `/api/attendance/records`
- GET `/api/attendance/sessions/:id`

## Clips
- POST `/api/clips`
- GET `/api/players/:playerId/clips`
- GET `/api/teams/:teamId/clips`

## AI Outputs
- POST `/api/ai/player-summary`
- POST `/api/ai/team-summary`
- POST `/api/ai/practice-plan`
- POST `/api/ai/parent-update`

## Example request — player summary
```json
{
  "playerId": "uuid",
  "teamId": "uuid",
  "contextWindow": 30
}
```

## Example response — player summary
```json
{
  "playerId": "uuid",
  "headline": "Improving defensive activity and effort consistency",
  "strengths": [
    "Active on-ball pressure",
    "Good transition sprint habits"
  ],
  "developmentPriorities": [
    "Finish under contact",
    "Make earlier help-side reads"
  ],
  "coachFocus": "Use 2-foot finish and shell-rotation reps this week.",
  "parentDraft": "Jaylen competed hard and showed real energy defensively this week..."
}
```
