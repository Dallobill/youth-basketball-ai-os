# Phase 4 Pilot Review Workflow

Phase 4 turns generated AI reports into a coach-reviewed pilot workflow. AI output should be treated as a draft until a qualified staff member reviews it.

## Backend workflow

1. Generate an AI report through the existing `/api/ai/*` endpoints.
2. Review the generated report with `POST /api/ai/reports/:reportId/review`.
3. Fetch review history with `GET /api/ai/reports/:reportId/reviews`.
4. Fetch a pilot/export payload with `GET /api/ai/reports/:reportId/export`.

## Review statuses

- `approved` — usable as-is or with saved edits.
- `changes_requested` — promising, but prompt/output needs adjustment before sharing.
- `rejected` — not useful or not safe to share.

## Pilot feedback fields

Reviews can store:

- 1–5 coach rating.
- Edited headline.
- Edited summary text.
- Free-text feedback notes.
- Review tags such as `specific`, `too_generic`, `parent-ready`, or `needs-context`.

## Pilot success criteria

For the first team pilot, collect at least five reviewed AI reports before tuning prompts. Use the ratings, edits, and tags to identify where summaries are too generic, missing context, or ready for parent-facing communication.
