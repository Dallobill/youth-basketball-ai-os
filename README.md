# Youth Basketball AI OS — Starter Kit

This starter kit is the first build for a **Youth Basketball AI Operating System** built for AAU programs, skill trainers, clubs, and youth sports organizations.

## MVP goal
Turn coach inputs into usable development output.

Input sources:
- player evaluations
- attendance
- game notes
- practice notes
- manually tagged video clips

Output types:
- player development summaries
- team trend summaries
- next-practice recommendations
- parent update drafts

## What is included
- Product blueprint
- Database schema (PostgreSQL / Supabase-friendly)
- Express backend scaffold
- Frontend React dashboard + evaluation form
- API route design
- AI prompt templates
- Sample seed data
- 30-day build roadmap

## Recommended stack
- Frontend: React + Vite for MVP, Next.js later if needed
- Backend: Node.js + Express
- Database: PostgreSQL / Supabase
- Storage: Supabase Storage or S3
- Auth: Supabase Auth or JWT
- AI: LLM endpoint for summarization + recommendations

## First build sequence
1. Create the database using the canonical fresh-install schema in `sql/schema.sql`.
2. Verify schema/route compatibility with `npm run schema:check`.
3. Seed basic sample data from `examples/sample-data.json`.
4. Run the Express API scaffold.
5. Run the frontend dashboard.
6. Add real AI generation after CRUD is working.

Apply the schema with PostgreSQL/Supabase tooling, for example:
```bash
psql "$DATABASE_URL" -f sql/schema.sql
npm run schema:check
```

See `sql/README.md` for the current schema source-of-truth and migration notes.

## Backend local setup
```bash
npm install
npm run dev
```

Create a `.env` file:
```env
PORT=3001
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
OPENAI_API_KEY=your_key_here
# Option A: local JWT verification
JWT_SECRET=replace_me
# Option B: Supabase JWT verification (shared JWT secret)
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
```


## Auth and roles
Backend now requires a bearer token for every `/api/*` request.

Supported role claims:
- `director`
- `coach`
- `assistant`
- `parent` (read-only for now)

Write endpoints (for example `POST /api/players`, `POST /api/teams`, `POST /api/evaluations`) require one of: `director`, `coach`, or `assistant`. Read endpoints are scoped by organization/team membership from JWT claims (`organizationId(s)`, `teamId(s)` in root/app_metadata/user_metadata).

For Supabase auth, pass the access token from the client and set `SUPABASE_JWT_SECRET` in backend `.env` (Project Settings → API → JWT Secret).

## Frontend local setup
```bash
cd frontend
npm install
npm run dev
```

Optional frontend env:
```env
VITE_API_URL=http://localhost:3001/api
# Optional local bootstrap token
VITE_AUTH_TOKEN=<jwt-access-token>
# Where the app redirects after 401
VITE_LOGIN_URL=http://localhost:5173/login
```

Frontend auth bootstrap order:
1. `access_token` in URL hash (e.g. OAuth/Supabase redirect).
2. `localStorage` key `ybos.auth.token`.
3. `VITE_AUTH_TOKEN` fallback for local development.

The API client attaches `Authorization: Bearer <token>` on every request. If API returns `401`, UI renders an unauthorized state and redirects to `VITE_LOGIN_URL`.

The frontend includes a **demo-data fallback**, so the UI still works even if the backend or database is not connected yet.

## Current frontend screens
- Dashboard overview
- Team selector
- Player development board
- Player profile view
- Evaluation form
- Recent activity + AI output preview

## Core MVP workflow
1. Coach selects a team
2. Coach chooses a player from the roster
3. Coach enters a practice or game evaluation in under 2 minutes
4. Evaluation is saved
5. AI summary draft is generated for coach and parent communication

## What to build next
- Authentication + user roles
- Team page tabs for practice and game logs
- PDF exports for player reports
- Parent portal
- Team performance trends
- Recruiting profiles
- Real LLM integration in `src/services/aiService.js`

## Recommended first pilot
Use one NBG team for 4 weeks.
Measure:
- coach time saved
- parent response quality
- player understanding of development goals
- consistency of evaluations
