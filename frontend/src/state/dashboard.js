import { formatPlayerName } from '../utils.js';

export function reduceDashboardAfterSave(
  current,
  { saved, payload, selected, summary, nowMs }
) {
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
      id: `ai_${nowMs}`,
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
}
