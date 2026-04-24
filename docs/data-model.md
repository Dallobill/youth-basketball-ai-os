# Data Model Overview

## Key entities
- organizations
- seasons
- teams
- coaches
- players
- player_team_memberships
- practices
- games
- attendance_sessions
- attendance_records
- evaluations
- clips
- clip_tags
- ai_reports

## Relationship summary
- organization has many teams
- organization has many seasons
- team belongs to organization
- team belongs to a season
- player can belong to many teams over time
- practice belongs to team
- game belongs to team
- evaluation belongs to player and may optionally belong to practice or game
- attendance session belongs to practice or game
- attendance record belongs to a player and attendance session
- clip belongs to team and may belong to player
- ai_report belongs to player or team
