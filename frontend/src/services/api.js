import { demoData } from '../data/demoData';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function averageScore(evaluation) {
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
  ].filter((value) => typeof value === 'number');

  if (!metrics.length) return null;
  return metrics.reduce((sum, value) => sum + value, 0) / metrics.length;
}

function buildDashboardFromDemo() {
  const totalPlayers = demoData.players.length;
  const totalTeams = demoData.teams.length;
  const recentEvaluations = demoData.evaluations
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((evaluation) => {
      const player = demoData.players.find((entry) => entry.id === evaluation.playerId);
      return {
        ...evaluation,
        playerName: player ? `${player.firstName} ${player.lastName}` : 'Player evaluation'
      };
    });

  const playersNeedingReview = demoData.players
    .map((player) => {
      const latest = demoData.evaluations
        .filter((evaluation) => evaluation.playerId === player.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

      return {
        ...player,
        latestEvaluation: latest,
        averageScore: latest ? averageScore(latest) : null
      };
    })
    .filter((player) => player.latestEvaluation)
    .sort((a, b) => (a.averageScore ?? 10) - (b.averageScore ?? 10))
    .slice(0, 4);

  return {
    organizationName: demoData.organization.name,
    totals: {
      totalTeams,
      totalPlayers,
      recentEvaluations: demoData.evaluations.length,
      aiReports: demoData.recentAiReports.length
    },
    teams: demoData.teams,
    recentEvaluations,
    playersNeedingReview,
    recentAiReports: demoData.recentAiReports,
    players: demoData.players
  };
}

function getPlayersForTeam(teamId) {
  return demoData.players.filter((player) => player.teamId === teamId);
}

function getEvaluationsForPlayer(playerId) {
  return demoData.evaluations
    .filter((evaluation) => evaluation.playerId === playerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function getDashboardData() {
  try {
    const [teamsResponse, playersResponse] = await Promise.all([
      fetch(`${API_BASE}/teams`),
      fetch(`${API_BASE}/players`)
    ]);

    if (!teamsResponse.ok || !playersResponse.ok) {
      throw new Error('Falling back to demo data');
    }

    const [teams, players] = await Promise.all([teamsResponse.json(), playersResponse.json()]);
    const normalizedTeams = teams.map((team) => ({
      ...team,
      ageGroup: team.age_group || team.ageGroup,
      rosterCount: Number(team.roster_count ?? team.rosterCount ?? 0)
    }));

    return {
      organizationName: 'Youth Basketball AI OS',
      totals: {
        totalTeams: normalizedTeams.length,
        totalPlayers: players.length,
        recentEvaluations: 0,
        aiReports: 0
      },
      teams: normalizedTeams,
      recentEvaluations: [],
      playersNeedingReview: [],
      recentAiReports: [],
      players
    };
  } catch (error) {
    return buildDashboardFromDemo();
  }
}

export async function getTeamRoster(teamId) {
  try {
    const response = await fetch(`${API_BASE}/players?teamId=${teamId}`);
    if (!response.ok) throw new Error('Team roster unavailable');
    const roster = await response.json();
    return roster.map((player) => ({
      ...player,
      teamId: player.teamId || teamId,
      firstName: player.first_name || player.firstName,
      lastName: player.last_name || player.lastName,
      jerseyNumber: player.jersey_number || player.jerseyNumber,
      graduationYear: player.graduation_year || player.graduationYear,
      dominantHand: player.dominant_hand || player.dominantHand,
      injuryStatus: player.injury_status || player.injuryStatus
    }));
  } catch (error) {
    return getPlayersForTeam(teamId);
  }
}

export async function getPlayerEvaluations(playerId) {
  try {
    const response = await fetch(`${API_BASE}/evaluations/player/${playerId}`);
    if (!response.ok) throw new Error('Evaluations unavailable');
    const evaluations = await response.json();
    return evaluations.map((evaluation) => ({
      ...evaluation,
      createdAt: evaluation.created_at || evaluation.createdAt,
      evaluationType: evaluation.evaluation_type || evaluation.evaluationType,
      ballHandling: Number(evaluation.ball_handling ?? evaluation.ballHandling),
      finishing: Number(evaluation.finishing),
      shooting: Number(evaluation.shooting),
      passingDecision: Number(evaluation.passing_decision ?? evaluation.passingDecision),
      defenseOnBall: Number(evaluation.defense_on_ball ?? evaluation.defenseOnBall),
      defenseHelp: Number(evaluation.defense_help ?? evaluation.defenseHelp),
      rebounding: Number(evaluation.rebounding),
      communication: Number(evaluation.communication),
      motorEffort: Number(evaluation.motor_effort ?? evaluation.motorEffort),
      basketballIq: Number(evaluation.basketball_iq ?? evaluation.basketballIq)
    }));
  } catch (error) {
    return getEvaluationsForPlayer(playerId);
  }
}

export async function createEvaluation(payload) {
  try {
    const response = await fetch(`${API_BASE}/evaluations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Could not save evaluation');
    }

    const evaluation = await response.json();
    return {
      ...evaluation,
      createdAt: evaluation.created_at || evaluation.createdAt,
      evaluationType: evaluation.evaluation_type || evaluation.evaluationType,
      ballHandling: Number(evaluation.ball_handling ?? evaluation.ballHandling ?? payload.ballHandling),
      finishing: Number(evaluation.finishing ?? payload.finishing),
      shooting: Number(evaluation.shooting ?? payload.shooting),
      passingDecision: Number(evaluation.passing_decision ?? evaluation.passingDecision ?? payload.passingDecision),
      defenseOnBall: Number(evaluation.defense_on_ball ?? evaluation.defenseOnBall ?? payload.defenseOnBall),
      defenseHelp: Number(evaluation.defense_help ?? evaluation.defenseHelp ?? payload.defenseHelp),
      rebounding: Number(evaluation.rebounding ?? payload.rebounding),
      communication: Number(evaluation.communication ?? payload.communication),
      motorEffort: Number(evaluation.motor_effort ?? evaluation.motorEffort ?? payload.motorEffort),
      basketballIq: Number(evaluation.basketball_iq ?? evaluation.basketballIq ?? payload.basketballIq)
    };
  } catch (error) {
    const localEvaluation = {
      id: `local_${Date.now()}`,
      ...payload,
      createdAt: new Date().toISOString()
    };

    demoData.evaluations.unshift(localEvaluation);
    return localEvaluation;
  }
}

export async function generatePlayerSummary(payload) {
  try {
    const response = await fetch(`${API_BASE}/ai/player-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Could not generate summary');
    return await response.json();
  } catch (error) {
    return {
      headline: 'Player development summary',
      strengths: payload.strengths || ['Competes hard', 'Responds to coaching'],
      developmentPriorities: payload.priorities || ['Sharper reads', 'Better finishing balance'],
      coachFocus:
        'Emphasize early reads, lower-body balance, and calm decision-making on drives.',
      playerMessage:
        'You are making progress. The next jump is slowing down enough to make stronger reads and more balanced finishes.',
      parentDraft:
        'Your athlete competed hard today. The next area of focus is making better decisions under pressure and finishing with control.'
    };
  }
}
