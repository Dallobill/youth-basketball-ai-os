# Database setup

`sql/schema.sql` is the canonical fresh-install schema for the current app. It is the file new local, staging, and Supabase databases should apply first.

## Fresh install

```bash
psql "$DATABASE_URL" -f sql/schema.sql
```

Then seed data from `examples/sample-data.json` through the API or your database console.

## Existing databases

`sql/phase2_milestone1.sql` is retained as a historical migration for databases created before the Phase 2 data model. Do not apply it after `sql/schema.sql` on a new database; the canonical schema already includes the current Phase 2 tables plus the active `evaluations` table used by the MVP workflow.

## Schema contract check

Run this before changing routes or SQL:

```bash
npm run schema:check
```

The check verifies that the canonical schema contains the tables and columns the current Express routes depend on.
