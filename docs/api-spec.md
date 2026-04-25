# API Spec

## Naming convention
- **Request/response payloads use `camelCase`** field names (for example: `teamId`, `firstName`, `evaluationType`).
- **Database columns use `snake_case`** names (for example: `team_id`, `first_name`, `evaluation_type`).
- Route handlers map camelCase API fields to snake_case SQL columns.

## Implemented endpoints

### Health

#### GET `/health`
Checks API and database connectivity.

**Example response**
```json
{
  "ok": true,
  "database": "connected"
}
```

---

### Teams

#### GET `/api/teams`
Returns all teams with an `roster_count` aggregate.

**Example request**
```http
GET /api/teams
```

#### POST `/api/teams`
Creates a team.

**Example request body**
```json
{
  "organizationId": "c2f5d5d6-1300-4d95-bce8-c04d53fa8f74",
  "seasonId": "e7452d64-5d0a-4582-968e-c1fe39734890",
  "name": "14U Blue",
  "ageGroup": "14U",
  "level": "AAU"
}
```

#### GET `/api/teams/:id`
Returns one team by ID.

**Example request**
```http
GET /api/teams/8f36f772-f332-48f4-975d-39c7d17f2bc2
```

---

### Players

#### GET `/api/players`
Returns all players.

**Example request**
```http
GET /api/players
```

#### GET `/api/players?teamId=<uuid>`
Returns active players for a team.

**Example request**
```http
GET /api/players?teamId=8f36f772-f332-48f4-975d-39c7d17f2bc2
```

#### POST `/api/players`
Creates a player.

**Example request body**
```json
{
  "organizationId": "c2f5d5d6-1300-4d95-bce8-c04d53fa8f74",
  "firstName": "Jaylen",
  "lastName": "Carter",
  "birthDate": "2012-05-14",
  "graduationYear": 2030,
  "position": "Guard",
  "jerseyNumber": 4,
  "dominantHand": "Right",
  "guardianName": "Alex Carter",
  "guardianEmail": "alex.carter@example.com",
  "guardianPhone": "+1-555-0100",
  "notes": "Prefers wing in transition offense"
}
```

#### GET `/api/players/:id`
Returns one player by ID.

**Example request**
```http
GET /api/players/2bd6f041-7e20-4a3e-a53e-ab6d3ffaf6c7
```

---

### Evaluations

#### POST `/api/evaluations`
Creates a player/team evaluation.

**Example request body**
```json
{
  "teamId": "8f36f772-f332-48f4-975d-39c7d17f2bc2",
  "playerId": "2bd6f041-7e20-4a3e-a53e-ab6d3ffaf6c7",
  "coachId": "86f4a6df-b29c-4d5a-a8db-267bf3e5f5f4",
  "evaluationType": "practice",
  "practiceId": "5af742f5-2a12-4ca5-860f-713eab44f2f7",
  "gameId": null,
  "ballHandling": 4,
  "finishing": 3,
  "shooting": 3,
  "passingDecision": 4,
  "defenseOnBall": 4,
  "defenseHelp": 3,
  "rebounding": 2,
  "communication": 4,
  "motorEffort": 5,
  "basketballIq": 3,
  "strengths": ["on-ball pressure", "competitive motor"],
  "priorities": ["weak-side help timing", "finishing through contact"],
  "notes": "Best stretch was in shell-to-advantage segment"
}
```

#### GET `/api/evaluations/player/:playerId`
Returns evaluations for one player, newest first.

**Example request**
```http
GET /api/evaluations/player/2bd6f041-7e20-4a3e-a53e-ab6d3ffaf6c7
```

---

### AI Outputs

#### POST `/api/ai/player-summary`
Builds a player summary from submitted context.

**Example request body**
```json
{
  "headline": "Improving defensive activity and effort consistency",
  "strengths": ["Active on-ball pressure", "Strong transition sprint habits"],
  "priorities": ["Finish under contact", "Make earlier help-side reads"],
  "coachFocus": "Use 2-foot finish and shell-rotation reps this week.",
  "playerMessage": "Keep using pace changes before you attack the paint.",
  "parentDraft": "Jaylen competed hard and showed real energy defensively this week."
}
```

#### POST `/api/ai/team-summary`
Builds a team summary.

**Example request body**
```json
{
  "headline": "Week 6 team trend",
  "strengths": ["Pace", "Defensive effort"],
  "recurringIssues": ["Late tags", "Loose closeouts"],
  "nextPracticeFocus": ["Help-side rotations", "Paint touch decisions"],
  "coachingPoints": ["Talk early", "Sprint to spots"]
}
```

#### POST `/api/ai/practice-plan`
Builds a practice plan.

**Example request body**
```json
{
  "practiceTheme": "Play with balance and communication",
  "priorities": ["Closeout discipline", "Advantage passing"]
}
```

#### POST `/api/ai/parent-update`
Builds a parent-facing update draft.

**Example request body**
```json
{
  "message": "This week your athlete showed stronger decision-making in transition and better defensive communication."
}
```

## Planned endpoints (not yet implemented)

The endpoints below are documented for roadmap visibility only. They are **not implemented** in the current server/router code.

### Organizations
- POST `/api/organizations`
- GET `/api/organizations/:id`

### Practices
- POST `/api/practices`
- GET `/api/practices/:id`
- GET `/api/teams/:teamId/practices`

### Games
- POST `/api/games`
- GET `/api/games/:id`
- GET `/api/teams/:teamId/games`

### Attendance
- POST `/api/attendance/sessions`
- POST `/api/attendance/records`
- GET `/api/attendance/sessions/:id`

### Clips
- POST `/api/clips`
- GET `/api/players/:playerId/clips`
- GET `/api/teams/:teamId/clips`
