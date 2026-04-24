import { formatPlayerName, getAverageScore, getPriorityLabel } from '../utils';

export default function RosterTable({ players, latestEvaluationsByPlayer, selectedPlayerId, onSelect }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <div className="eyebrow">Roster</div>
          <h2>Player development board</h2>
        </div>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Pos</th>
              <th>Latest eval</th>
              <th>Avg score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const latest = latestEvaluationsByPlayer[player.id];
              const avgScore = getAverageScore(latest);
              return (
                <tr
                  key={player.id}
                  className={selectedPlayerId === player.id ? 'selected-row' : ''}
                  onClick={() => onSelect(player.id)}
                >
                  <td>
                    <div className="player-cell">
                      <strong>{formatPlayerName(player)}</strong>
                      <span>#{player.jerseyNumber || '—'} · {player.graduationYear || '—'}</span>
                    </div>
                  </td>
                  <td>{player.position || '—'}</td>
                  <td>{latest?.evaluationType || 'No entry'}</td>
                  <td>{avgScore ? avgScore.toFixed(1) : '—'}</td>
                  <td>
                    <span className={`status-badge ${getPriorityLabel(avgScore).toLowerCase().replace(/\s+/g, '-')}`}>
                      {getPriorityLabel(avgScore)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
