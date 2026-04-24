import { formatDate, formatPlayerName, getAverageScore, getPriorityLabel } from '../utils';

const metrics = [
  ['Ball handling', 'ballHandling'],
  ['Finishing', 'finishing'],
  ['Shooting', 'shooting'],
  ['Passing / decisions', 'passingDecision'],
  ['On-ball defense', 'defenseOnBall'],
  ['Help defense', 'defenseHelp'],
  ['Rebounding', 'rebounding'],
  ['Communication', 'communication'],
  ['Motor / effort', 'motorEffort'],
  ['Basketball IQ', 'basketballIq']
];

export default function PlayerProfile({ player, evaluations, aiSummary }) {
  const latest = evaluations[0];
  const avgScore = getAverageScore(latest);

  if (!player) {
    return (
      <div className="panel stretch-center">
        <div>
          <div className="eyebrow">Player profile</div>
          <h2>Select a player</h2>
          <p className="muted-text">Choose a player from the roster to review their latest development record.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="panel player-profile">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Player profile</div>
          <h2>{formatPlayerName(player)}</h2>
          <p className="muted-text">
            {player.position || 'Player'} · #{player.jerseyNumber || '—'} · {player.dominantHand || '—'} hand
          </p>
        </div>
        <div className="profile-score">
          <span>Avg</span>
          <strong>{avgScore ? avgScore.toFixed(1) : '—'}</strong>
          <small>{getPriorityLabel(avgScore)}</small>
        </div>
      </div>

      <div className="profile-grid">
        <div className="sub-panel">
          <h3>Latest evaluation</h3>
          <p className="muted-text">{latest ? `${latest.evaluationType} · ${formatDate(latest.createdAt || latest.created_at)}` : 'No evaluations yet'}</p>
          {latest ? (
            <div className="metric-list">
              {metrics.map(([label, key]) => (
                <div key={key} className="metric-row">
                  <span>{label}</span>
                  <div className="metric-bar-wrap">
                    <div className="metric-bar" style={{ width: `${(Number(latest[key]) || 0) * 10}%` }} />
                  </div>
                  <strong>{latest[key] ?? '—'}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="sub-panel">
          <h3>Development notes</h3>
          <div className="note-block">
            <label>Strengths</label>
            <p>{latest?.strengths || 'No strengths entered yet.'}</p>
          </div>
          <div className="note-block">
            <label>Priorities</label>
            <p>{latest?.priorities || 'No priorities entered yet.'}</p>
          </div>
          <div className="note-block">
            <label>Coach notes</label>
            <p>{latest?.notes || 'No notes entered yet.'}</p>
          </div>
        </div>
      </div>

      <div className="sub-panel">
        <h3>AI output preview</h3>
        <div className="ai-grid">
          <div>
            <label>Headline</label>
            <p>{aiSummary?.headline || 'No AI summary generated yet.'}</p>
          </div>
          <div>
            <label>Coach focus</label>
            <p>{aiSummary?.coachFocus || 'Generate a summary after saving an evaluation.'}</p>
          </div>
          <div>
            <label>Player message</label>
            <p>{aiSummary?.playerMessage || '—'}</p>
          </div>
          <div>
            <label>Parent draft</label>
            <p>{aiSummary?.parentDraft || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
