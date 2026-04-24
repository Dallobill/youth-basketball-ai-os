export function getAverageScore(evaluation) {
  if (!evaluation) return null;

  const metrics = [
    evaluation.ballHandling,
    evaluation.finishing,
    evaluation.shooting,
    evaluation.passingDecision,
    evaluation.defenseOnBall,
    evaluation.defenseHelp,
    evaluation.rebounding,
    evaluation.communication,
    evaluation.motorEffort,
    evaluation.basketballIq
  ].map((value) => Number(value)).filter((value) => !Number.isNaN(value));

  if (!metrics.length) return null;
  return metrics.reduce((sum, value) => sum + value, 0) / metrics.length;
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatPlayerName(player) {
  return `${player.firstName} ${player.lastName}`;
}

export function getPriorityLabel(score) {
  if (score === null || score === undefined) return 'No data';
  if (score < 5.75) return 'High review';
  if (score < 6.75) return 'Watch list';
  return 'On track';
}
