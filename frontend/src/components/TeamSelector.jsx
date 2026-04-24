export default function TeamSelector({ teams, activeTeamId, onChange }) {
  return (
    <div className="team-selector">
      {teams.map((team) => (
        <button
          key={team.id}
          type="button"
          className={`team-pill ${team.id === activeTeamId ? 'active' : ''}`}
          onClick={() => onChange(team.id)}
        >
          <span>{team.name}</span>
          <small>{team.ageGroup || 'Team'}</small>
        </button>
      ))}
    </div>
  );
}
