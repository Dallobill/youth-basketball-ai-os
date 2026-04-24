CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  season_id UUID REFERENCES seasons(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  age_group TEXT,
  level TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birth_date DATE,
  graduation_year INT,
  position TEXT,
  jersey_number TEXT,
  dominant_hand TEXT,
  injury_status TEXT DEFAULT 'healthy',
  guardian_name TEXT,
  guardian_email TEXT,
  guardian_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE player_team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  practice_date DATE NOT NULL,
  title TEXT,
  objective TEXT,
  notes TEXT,
  created_by UUID REFERENCES coaches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  game_date DATE NOT NULL,
  opponent TEXT,
  result TEXT,
  team_score INT,
  opponent_score INT,
  notes TEXT,
  created_by UUID REFERENCES coaches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('practice', 'game', 'training')),
  practice_id UUID REFERENCES practices(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present', 'late', 'excused', 'absent', 'limited')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(attendance_session_id, player_id)
);

CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('tryout', 'practice', 'game', 'season_review')),
  practice_id UUID REFERENCES practices(id) ON DELETE SET NULL,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  ball_handling NUMERIC(4,2),
  finishing NUMERIC(4,2),
  shooting NUMERIC(4,2),
  passing_decision NUMERIC(4,2),
  defense_on_ball NUMERIC(4,2),
  defense_help NUMERIC(4,2),
  rebounding NUMERIC(4,2),
  communication NUMERIC(4,2),
  motor_effort NUMERIC(4,2),
  basketball_iq NUMERIC(4,2),
  strengths TEXT,
  priorities TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  practice_id UUID REFERENCES practices(id) ON DELETE SET NULL,
  game_id UUID REFERENCES games(id) ON DELETE SET NULL,
  clip_url TEXT NOT NULL,
  title TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE clip_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clip_id UUID NOT NULL REFERENCES clips(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('player_summary', 'team_summary', 'practice_plan', 'parent_update')),
  headline TEXT,
  content TEXT NOT NULL,
  context_window_days INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_players_org ON players(organization_id);
CREATE INDEX idx_teams_org ON teams(organization_id);
CREATE INDEX idx_eval_player ON evaluations(player_id);
CREATE INDEX idx_eval_team ON evaluations(team_id);
CREATE INDEX idx_attendance_player ON attendance_records(player_id);
CREATE INDEX idx_clips_player ON clips(player_id);
CREATE INDEX idx_reports_player ON ai_reports(player_id);
