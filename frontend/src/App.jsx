import { useEffect, useMemo, useState } from 'react';
import EvaluationForm from './components/EvaluationForm.jsx';
import PlayerProfile from './components/PlayerProfile.jsx';
import RecentActivity from './components/RecentActivity.jsx';
import RosterTable from './components/RosterTable.jsx';
import StatCard from './components/StatCard.jsx';
import TeamSelector from './components/TeamSelector.jsx';
import {
  UnauthorizedError,
  bootstrapAuth,
  createEvaluation,
  generatePlayerSummary,
  getDashboardData,
  getLoginUrl,
  getPlayerEvaluations,
  getTeamRoster
} from './services/api.js';
import { formatPlayerName, getAverageScore } from './utils.js';
import { reduceDashboardAfterSave } from './state/dashboard.js';

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [activeTeamId, setActiveTeamId] = useState('');
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerEvaluations, setPlayerEvaluations] = useState([]);
  const [aiSummary, setAiSummary] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    bootstrapAuth();
  }, []);

  function handleUnauthorized(error) {
    if (!(error instanceof UnauthorizedError)) {
      return false;
    }

    const loginUrl = getLoginUrl();
    setAuthError(error.message || 'Unauthorized. Please sign in.');

    if (typeof window !== 'undefined' && loginUrl) {
      window.location.assign(loginUrl);
    }

    return true;
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboardData();
        setDashboard(data);

        const firstTeamId = data.teams[0]?.id || '';
        setActiveTeamId(firstTeamId);
      } catch (error) {
        handleUnauthorized(error);
      }
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    async function loadRoster() {
      if (!activeTeamId) return;

      try {
        const roster = await getTeamRoster(activeTeamId);
        setPlayers(roster);
        setSelectedPlayerId((current) => {
          const existsOnTeam = roster.some((player) => player.id === current);
          return existsOnTeam ? current : roster[0]?.id || '';
        });
      } catch (error) {
        handleUnauthorized(error);
      }
    }

    loadRoster();
  }, [activeTeamId]);

  useEffect(() => {
    async function loadEvaluations() {
      if (!selectedPlayerId) {
        setPlayerEvaluations([]);
        return;
      }

      try {
        const evaluations = await getPlayerEvaluations(selectedPlayerId);
        setPlayerEvaluations(evaluations);
      } catch (error) {
        handleUnauthorized(error);
      }
    }

    loadEvaluations();
  }, [selectedPlayerId]);

  const latestEvaluationsByPlayer = useMemo(() => {
    const map = {};
    if (!players.length) return map;

    players.forEach((player) => {
      const playerHistory =
        dashboard?.recentEvaluations?.filter(
          (entry) => entry.playerId === player.id
        ) || [];
      if (player.id === selectedPlayerId && playerEvaluations[0]) {
        map[player.id] = playerEvaluations[0];
      } else if (playerHistory[0]) {
        map[player.id] = playerHistory[0];
      }
    });

    return map;
  }, [
    dashboard?.recentEvaluations,
    playerEvaluations,
    players,
    selectedPlayerId
  ]);

  const selectedPlayer = players.find(
    (player) => player.id === selectedPlayerId
  );
  const activeTeam = dashboard?.teams.find((team) => team.id === activeTeamId);

  async function handleSaveEvaluation(payload) {
    setIsSaving(true);

    try {
      const saved = await createEvaluation(payload);
      const selected = players.find((player) => player.id === payload.playerId);

      const summary = await generatePlayerSummary({
        headline: `${selected ? formatPlayerName(selected) : 'Player'} development summary`,
        strengths: payload.strengths ? [payload.strengths] : [],
        priorities: payload.priorities ? [payload.priorities] : [],
        coachFocus: payload.notes
      });

      setSelectedPlayerId(payload.playerId);

      const refreshedEvaluations = await getPlayerEvaluations(payload.playerId);
      setPlayerEvaluations(refreshedEvaluations);

      setAiSummary(summary);

      setDashboard((current) => {
        if (!current) return current;

        const newRecentEvaluations = [
          {
            ...saved,
            playerId: payload.playerId,
            playerName: selected ? formatPlayerName(selected) : 'Player evaluation'
          },
          ...(current.recentEvaluations || [])
        ].slice(0, 6);

        const newRecentAiReports = [
          {
            id: `ai_${Date.now()}`,
            headline: summary.headline,
            content: summary.coachFocus || summary.playerMessage || ''
          },
          ...(current.recentAiReports || [])
        ].slice(0, 6);

        return {
          ...current,
          recentEvaluations: newRecentEvaluations,
          recentAiReports: newRecentAiReports,
          totals: {
            ...current.totals,
            recentEvaluations: (current.totals?.recentEvaluations || 0) + 1,
            aiReports: (current.totals?.aiReports || 0) + 1
          }
        };
      });
    } catch (error) {
      handleUnauthorized(error);
    } finally {
      setIsSaving(false);
    }
  }

  const reviewPlayers = useMemo(() => {
    return players
      .map((player) => ({
        ...player,
        latestEvaluation: latestEvaluationsByPlayer[player.id],
        averageScore: getAverageScore(latestEvaluationsByPlayer[player.id])
      }))
      .sort((a, b) => (a.averageScore ?? 10) - (b.averageScore ?? 10))
      .slice(0, 4);
  }, [players, latestEvaluationsByPlayer]);

  if (authError) {
    return (
      <div className="loading-shell">
        <strong>Unauthorized</strong>
        <p>{authError}</p>
        <p>Redirecting to login shell...</p>
      </div>
    );
  }

  if (!dashboard) {
    return <div className="loading-shell">Loading dashboard...</div>;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">Youth Basketball AI OS</div>
          <h1>{dashboard.organizationName}</h1>
          <p className="muted-text">
            Coach dashboard, player evaluations, and AI-assisted development
            workflow.
          </p>
        </div>
        <div className="topbar-aside">
          <span className="topbar-chip">Live MVP</span>
          <span className="topbar-chip secondary">
            {activeTeam?.name || 'Select team'}
          </span>
        </div>
      </header>

      <TeamSelector
        teams={dashboard.teams}
        activeTeamId={activeTeamId}
        onChange={setActiveTeamId}
      />

      <section className="stats-grid">
        <StatCard
          label="Teams"
          value={dashboard.totals.totalTeams}
          detail="Active programs tracked"
        />
        <StatCard
          label="Players"
          value={dashboard.totals.totalPlayers}
          detail="Athletes in the system"
        />
        <StatCard
          label="Evaluations"
          value={dashboard.totals.recentEvaluations}
          detail="Coach entries logged"
        />
        <StatCard
          label="AI outputs"
          value={dashboard.totals.aiReports}
          detail="Summaries and reports generated"
        />
      </section>

      <section className="content-grid">
        <div className="left-column">
          <div className="panel attention-panel">
            <div className="panel-header compact">
              <div>
                <div className="eyebrow">Coach attention</div>
                <h2>Players needing review</h2>
              </div>
            </div>
            <div className="attention-list">
              {reviewPlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  className="attention-card"
                  onClick={() => setSelectedPlayerId(player.id)}
                >
                  <div>
                    <strong>{formatPlayerName(player)}</strong>
                    <p>
                      {player.position || 'Player'} · #
                      {player.jerseyNumber || '—'}
                    </p>
                  </div>
                  <span>
                    {player.averageScore ? player.averageScore.toFixed(1) : '—'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <RosterTable
            players={players}
            latestEvaluationsByPlayer={latestEvaluationsByPlayer}
            selectedPlayerId={selectedPlayerId}
            onSelect={setSelectedPlayerId}
          />

          <RecentActivity
            evaluations={dashboard.recentEvaluations || []}
            aiReports={dashboard.recentAiReports || []}
          />
        </div>

        <div className="right-column">
          <PlayerProfile
            player={selectedPlayer}
            evaluations={playerEvaluations}
            aiSummary={aiSummary}
          />
          <EvaluationForm
            players={players}
            activeTeamId={activeTeamId}
            selectedPlayerId={selectedPlayerId}
            onSave={handleSaveEvaluation}
            isSaving={isSaving}
          />
        </div>
      </section>
    </div>
  );
}
