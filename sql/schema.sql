-- Canonical fresh-install schema for the current Youth Basketball AI OS app.
-- Apply this file to new PostgreSQL/Supabase databases before seeding data.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- organizations
-- =====================================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- teams
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age_group TEXT NOT NULL,
  season TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_status ON teams(status);
CREATE INDEX IF NOT EXISTS idx_teams_season ON teams(season);

-- =====================================================
-- coaches
-- =====================================================
CREATE TABLE IF NOT EXISTS coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT CHECK (role IN ('director', 'coach', 'assistant') OR role IS NULL),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coaches_organization_id ON coaches(organization_id);

-- =====================================================
-- players
-- =====================================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  preferred_name TEXT,
  graduation_year INTEGER,
  position_primary TEXT,
  jersey_number TEXT,
  dominant_hand TEXT CHECK (dominant_hand IN ('left', 'right', 'both') OR dominant_hand IS NULL),
  injury_status TEXT NOT NULL DEFAULT 'healthy' CHECK (
    injury_status IN ('healthy', 'limited', 'out', 'return_to_play')
  ),
  player_status TEXT NOT NULL DEFAULT 'active' CHECK (
    player_status IN ('active', 'inactive', 'removed')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_players_organization_id ON players(organization_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_status ON players(player_status);
CREATE INDEX IF NOT EXISTS idx_players_name ON players(last_name, first_name);

-- Keep membership history for team-scoped auth checks and future roster timelines.
CREATE TABLE IF NOT EXISTS player_team_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(player_id, team_id, start_date)
);

CREATE INDEX IF NOT EXISTS idx_player_team_memberships_player_id ON player_team_memberships(player_id);
CREATE INDEX IF NOT EXISTS idx_player_team_memberships_team_id ON player_team_memberships(team_id);
CREATE INDEX IF NOT EXISTS idx_player_team_memberships_active ON player_team_memberships(is_active);

-- =====================================================
-- evaluations
-- =====================================================
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES coaches(id) ON DELETE SET NULL,
  evaluation_type TEXT NOT NULL CHECK (evaluation_type IN ('tryout', 'practice', 'game', 'season_review')),
  practice_id UUID,
  game_id UUID,
  ball_handling NUMERIC(4,2) CHECK (ball_handling BETWEEN 0 AND 10),
  finishing NUMERIC(4,2) CHECK (finishing BETWEEN 0 AND 10),
  shooting NUMERIC(4,2) CHECK (shooting BETWEEN 0 AND 10),
  passing_decision NUMERIC(4,2) CHECK (passing_decision BETWEEN 0 AND 10),
  defense_on_ball NUMERIC(4,2) CHECK (defense_on_ball BETWEEN 0 AND 10),
  defense_help NUMERIC(4,2) CHECK (defense_help BETWEEN 0 AND 10),
  rebounding NUMERIC(4,2) CHECK (rebounding BETWEEN 0 AND 10),
  communication NUMERIC(4,2) CHECK (communication BETWEEN 0 AND 10),
  motor_effort NUMERIC(4,2) CHECK (motor_effort BETWEEN 0 AND 10),
  basketball_iq NUMERIC(4,2) CHECK (basketball_iq BETWEEN 0 AND 10),
  strengths TEXT,
  priorities TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evaluations_player_id ON evaluations(player_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_team_id ON evaluations(team_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON evaluations(created_at DESC);

-- =====================================================
-- development_entries
-- =====================================================
CREATE TABLE IF NOT EXISTS development_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  entry_type TEXT NOT NULL CHECK (
    entry_type IN ('practice', 'game', 'workout', 'film', 'weekly_review', 'monthly_review')
  ),
  ball_handling NUMERIC(4,2) CHECK (ball_handling BETWEEN 0 AND 10),
  finishing NUMERIC(4,2) CHECK (finishing BETWEEN 0 AND 10),
  shooting NUMERIC(4,2) CHECK (shooting BETWEEN 0 AND 10),
  passing_decision NUMERIC(4,2) CHECK (passing_decision BETWEEN 0 AND 10),
  defense_on_ball NUMERIC(4,2) CHECK (defense_on_ball BETWEEN 0 AND 10),
  defense_help NUMERIC(4,2) CHECK (defense_help BETWEEN 0 AND 10),
  rebounding NUMERIC(4,2) CHECK (rebounding BETWEEN 0 AND 10),
  communication NUMERIC(4,2) CHECK (communication BETWEEN 0 AND 10),
  motor_effort NUMERIC(4,2) CHECK (motor_effort BETWEEN 0 AND 10),
  basketball_iq NUMERIC(4,2) CHECK (basketball_iq BETWEEN 0 AND 10),
  confidence NUMERIC(4,2) CHECK (confidence BETWEEN 0 AND 10),
  focus NUMERIC(4,2) CHECK (focus BETWEEN 0 AND 10),
  physical_readiness NUMERIC(4,2) CHECK (physical_readiness BETWEEN 0 AND 10),
  strengths TEXT,
  priorities TEXT,
  coach_notes TEXT,
  context_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_development_entries_player_id ON development_entries(player_id);
CREATE INDEX IF NOT EXISTS idx_development_entries_team_id ON development_entries(team_id);
CREATE INDEX IF NOT EXISTS idx_development_entries_entry_date ON development_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_development_entries_player_date ON development_entries(player_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_development_entries_player_type_date ON development_entries(player_id, entry_type, entry_date DESC);

-- =====================================================
-- ai_reports
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('daily', 'weekly', 'monthly', 'trend_snapshot')),
  range_start DATE,
  range_end DATE,
  report_type TEXT NOT NULL CHECK (
    report_type IN ('player_summary', 'trend_summary', 'intervention_plan', 'parent_update', 'recommendation')
  ),
  headline TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  risk_flags_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  supporting_metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_reports_player_id ON ai_reports(player_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_team_id ON ai_reports(team_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_generated_at ON ai_reports(generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reports_player_range ON ai_reports(player_id, range_start, range_end);

-- =====================================================
-- updated_at trigger
-- =====================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON organizations;
CREATE TRIGGER trg_organizations_updated_at
BEFORE UPDATE ON organizations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_teams_updated_at ON teams;
CREATE TRIGGER trg_teams_updated_at
BEFORE UPDATE ON teams
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_coaches_updated_at ON coaches;
CREATE TRIGGER trg_coaches_updated_at
BEFORE UPDATE ON coaches
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_players_updated_at ON players;
CREATE TRIGGER trg_players_updated_at
BEFORE UPDATE ON players
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_player_team_memberships_updated_at ON player_team_memberships;
CREATE TRIGGER trg_player_team_memberships_updated_at
BEFORE UPDATE ON player_team_memberships
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_development_entries_updated_at ON development_entries;
CREATE TRIGGER trg_development_entries_updated_at
BEFORE UPDATE ON development_entries
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
