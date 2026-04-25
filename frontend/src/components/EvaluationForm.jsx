import { useEffect, useMemo, useState } from 'react';
import { formatPlayerName } from '../utils';

const metricFields = [
  ['ballHandling', 'Ball handling'],
  ['finishing', 'Finishing'],
  ['shooting', 'Shooting'],
  ['passingDecision', 'Passing / decision-making'],
  ['defenseOnBall', 'On-ball defense'],
  ['defenseHelp', 'Help defense'],
  ['rebounding', 'Rebounding'],
  ['communication', 'Communication'],
  ['motorEffort', 'Motor / effort'],
  ['basketballIq', 'Basketball IQ']
];

const emptyForm = {
  playerId: '',
  evaluationType: 'practice',
  ballHandling: 5,
  finishing: 5,
  shooting: 5,
  passingDecision: 5,
  defenseOnBall: 5,
  defenseHelp: 5,
  rebounding: 5,
  communication: 5,
  motorEffort: 5,
  basketballIq: 5,
  strengths: '',
  priorities: '',
  notes: ''
};

export default function EvaluationForm({
  players,
  activeTeamId,
  selectedPlayerId,
  onSave,
  isSaving
}) {
  const [form, setForm] = useState(emptyForm);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (selectedPlayerId) {
      setForm((current) => ({
        ...current,
        playerId: selectedPlayerId
      }));
      setSaveMessage('');
    }
  }, [selectedPlayerId]);

  const selectedPlayer = useMemo(
    () => players.find((player) => player.id === form.playerId),
    [players, form.playerId]
  );

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));

    if (saveMessage) {
      setSaveMessage('');
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.playerId) return;

    await onSave({
      teamId: activeTeamId,
      ...form,
      ballHandling: Number(form.ballHandling),
      finishing: Number(form.finishing),
      shooting: Number(form.shooting),
      passingDecision: Number(form.passingDecision),
      defenseOnBall: Number(form.defenseOnBall),
      defenseHelp: Number(form.defenseHelp),
      rebounding: Number(form.rebounding),
      communication: Number(form.communication),
      motorEffort: Number(form.motorEffort),
      basketballIq: Number(form.basketballIq)
    });

    setSaveMessage('Evaluation saved successfully.');

    setForm((current) => ({
      ...emptyForm,
      playerId: current.playerId,
      evaluationType: current.evaluationType
    }));
  }

  return (
    <div className="panel sticky-panel">
      <div className="panel-header compact">
        <div>
          <div className="eyebrow">Evaluation form</div>
          <h2>Coach entry</h2>
          <p className="muted-text">
            Complete in under two minutes after practice or game.
          </p>
        </div>
      </div>

      <form className="evaluation-form" onSubmit={handleSubmit}>
        <div className="field-grid two-col">
          <label>
            <span>Player</span>
            <select
              value={form.playerId}
              onChange={(event) => updateField('playerId', event.target.value)}
            >
              <option value="">Select player</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {formatPlayerName(player)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Entry type</span>
            <select
              value={form.evaluationType}
              onChange={(event) =>
                updateField('evaluationType', event.target.value)
              }
            >
              <option value="practice">Practice</option>
              <option value="game">Game</option>
              <option value="tryout">Tryout</option>
              <option value="season_review">Season review</option>
            </select>
          </label>
        </div>

        {selectedPlayer ? (
          <div className="selected-player-banner">
            <strong>{formatPlayerName(selectedPlayer)}</strong>
            <span>
              {selectedPlayer.position || 'Player'} · #
              {selectedPlayer.jerseyNumber || '—'} ·{' '}
              {selectedPlayer.injuryStatus || 'healthy'}
            </span>
          </div>
        ) : null}

        <div className="field-grid">
          {metricFields.map(([key, label]) => (
            <label key={key}>
              <div className="slider-label-row">
                <span>{label}</span>
                <strong>{form[key]}</strong>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={form[key]}
                onChange={(event) => updateField(key, event.target.value)}
              />
            </label>
          ))}
        </div>

        <label>
          <span>Strengths</span>
          <textarea
            rows="3"
            placeholder="What did the player do well today?"
            value={form.strengths}
            onChange={(event) => updateField('strengths', event.target.value)}
          />
        </label>

        <label>
          <span>Priorities</span>
          <textarea
            rows="3"
            placeholder="What should the next training block emphasize?"
            value={form.priorities}
            onChange={(event) => updateField('priorities', event.target.value)}
          />
        </label>

        <label>
          <span>Coach notes</span>
          <textarea
            rows="4"
            placeholder="Game context, workload notes, competition notes, film reminders..."
            value={form.notes}
            onChange={(event) => updateField('notes', event.target.value)}
          />
        </label>

        {saveMessage ? <p className="success-text">{saveMessage}</p> : null}

        <button
          type="submit"
          className="primary-button"
          disabled={isSaving || !form.playerId}
        >
          {isSaving
            ? 'Saving evaluation...'
            : 'Save evaluation + generate AI summary'}
        </button>
      </form>
    </div>
  );
}
