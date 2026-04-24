# Frontend MVP

This frontend is a React + Vite dashboard for the Youth Basketball AI OS MVP.

## Included screens
- Dashboard summary
- Team selector
- Roster development board
- Player profile with latest evaluation breakdown
- Coach evaluation form
- AI output preview

## Run locally
```bash
npm install
npm run dev
```

## API behavior
The app tries to call the backend first.

Expected backend routes:
- `GET /api/teams`
- `GET /api/players`
- `GET /api/players?teamId=...`
- `GET /api/evaluations/player/:playerId`
- `POST /api/evaluations`
- `POST /api/ai/player-summary`

If those routes are unavailable, the UI automatically falls back to local demo data so you can still design and test the workflow.
