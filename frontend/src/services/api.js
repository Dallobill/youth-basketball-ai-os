import { demoData } from '../data/demoData.js';

const API_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:3001/api';
const LOGIN_URL = import.meta.env?.VITE_LOGIN_URL || '/login';
const AUTH_TOKEN_STORAGE_KEY = 'ybos.auth.token';

let authToken = null;

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export function averageScore(evaluation) {
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

export function buildDashboardFromDemo() {
  const totalPlayers = demoData.players.length;
  const totalTeams = demoData.teams.length;
  const recentEvaluations = demoData.evaluations
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
    .map((evaluation) => {
      const player = demoData.players.find(
        (entry) => entry.id === evaluation.playerId
      );
      return {
        ...evaluation,
        playerName: player
          ? `${player.firstName} ${player.lastName}`
          : 'Player evaluation'
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

export function normalizeTeam(team) {
  return {
    ...team,
    ageGroup: team.age_group || team.ageGroup,
    rosterCount: Number(team.roster_count ?? team.rosterCount ?? 0)
  };
}

export function unwrapApiData(payload, fallback = []) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data ?? fallback;
  }

  if (payload && typeof payload === 'object' && !Array.isArray(fallback)) {
    return payload;
  }

  return fallback;
}

function numberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizePlayer(player, fallbackTeamId = null) {
  return {
    ...player,
    teamId: player.teamId || player.team_id || fallbackTeamId,
    firstName: player.firstName || player.first_name,
    lastName: player.lastName || player.last_name,
    jerseyNumber: player.jerseyNumber || player.jersey_number,
    graduationYear: player.graduationYear || player.graduation_year,
    dominantHand: player.dominantHand || player.dominant_hand,
    injuryStatus: player.injuryStatus || player.injury_status
  };
}

export function normalizeEvaluation(evaluation, fallback = {}) {
  return {
    ...fallback,
    ...evaluation,
    teamId: evaluation.teamId || evaluation.team_id || fallback.teamId,
    playerId: evaluation.playerId || evaluation.player_id || fallback.playerId,
    coachId: evaluation.coachId || evaluation.coach_id || fallback.coachId,
    createdAt:
      evaluation.createdAt || evaluation.created_at || fallback.createdAt,
    evaluationType:
      evaluation.evaluationType ||
      evaluation.evaluation_type ||
      fallback.evaluationType,
    ballHandling: numberOrNull(
      evaluation.ballHandling ??
        evaluation.ball_handling ??
        fallback.ballHandling
    ),
    finishing: numberOrNull(evaluation.finishing ?? fallback.finishing),
    shooting: numberOrNull(evaluation.shooting ?? fallback.shooting),
    passingDecision: numberOrNull(
      evaluation.passingDecision ??
        evaluation.passing_decision ??
        fallback.passingDecision
    ),
    defenseOnBall: numberOrNull(
      evaluation.defenseOnBall ??
        evaluation.defense_on_ball ??
        fallback.defenseOnBall
    ),
    defenseHelp: numberOrNull(
      evaluation.defenseHelp ?? evaluation.defense_help ?? fallback.defenseHelp
    ),
    rebounding: numberOrNull(evaluation.rebounding ?? fallback.rebounding),
    communication: numberOrNull(
      evaluation.communication ?? fallback.communication
    ),
    motorEffort: numberOrNull(
      evaluation.motorEffort ?? evaluation.motor_effort ?? fallback.motorEffort
    ),
    basketballIq: numberOrNull(
      evaluation.basketballIq ??
        evaluation.basketball_iq ??
        fallback.basketballIq
    )
  };
}

export function mapDashboardData({ teams, players }) {
  const normalizedTeams = teams.map(normalizeTeam);

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
}
function getPlayersForTeam(teamId) {
  return demoData.players.filter((player) => player.teamId === teamId);
}

function getEvaluationsForPlayer(playerId) {
  return demoData.evaluations
    .filter((evaluation) => evaluation.playerId === playerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function bootstrapAuth() {
  if (typeof window === 'undefined') return null;

  const hashParams = new URLSearchParams(
    window.location.hash.replace(/^#/, '')
  );
  const hashToken = hashParams.get('access_token');

  if (hashToken) {
    setAuthToken(hashToken);
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname + window.location.search
    );
    return hashToken;
  }

  const savedToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (savedToken) {
    authToken = savedToken;
    return savedToken;
  }

  const envToken = import.meta.env?.VITE_AUTH_TOKEN;
  if (envToken) {
    setAuthToken(envToken);
    return envToken;
  }

  return null;
}

export function setAuthToken(token) {
  authToken = token;

  if (typeof window === 'undefined') return;

  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
}

export function clearAuthToken() {
  setAuthToken(null);
}

export function getLoginUrl() {
  return LOGIN_URL;
}

async function apiRequest(path, options = {}) {
  if (!authToken) {
    bootstrapAuth();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    throw new UnauthorizedError('Session expired or missing auth token');
  }

  return response;
}

export async function getDashboardData() {
  try {
    const [teamsResponse, playersResponse] = await Promise.all([
      apiRequest('/teams'),
      apiRequest('/players')
    ]);

    if (!teamsResponse.ok || !playersResponse.ok) {
      throw new Error('Falling back to demo data');
    }

    const [teamsPayload, playersPayload] = await Promise.all([
      teamsResponse.json(),
      playersResponse.json()
    ]);

    const teams = unwrapApiData(teamsPayload);
    const players = unwrapApiData(playersPayload).map((player) =>
      normalizePlayer(player)
    );

    return mapDashboardData({ teams, players });
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    return buildDashboardFromDemo();
  }
}

export async function getTeamRoster(teamId) {
  try {
    const response = await apiRequest(`/players?teamId=${teamId}`);
    if (!response.ok) throw new Error('Team roster unavailable');
    const rosterPayload = await response.json();
    return unwrapApiData(rosterPayload).map((player) =>
      normalizePlayer(player, teamId)
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    return getPlayersForTeam(teamId);
  }
}

export async function getPlayerEvaluations(playerId) {
  try {
    const response = await apiRequest(`/evaluations/player/${playerId}`);
    if (!response.ok) throw new Error('Evaluations unavailable');
    const evaluationsPayload = await response.json();
    return unwrapApiData(evaluationsPayload).map((evaluation) =>
      normalizeEvaluation(evaluation)
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    return getEvaluationsForPlayer(playerId);
  }
}

export async function createEvaluation(payload) {
  try {
    const response = await apiRequest('/evaluations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Could not save evaluation');
    }

    const evaluationPayload = await response.json();
    return normalizeEvaluation(unwrapApiData(evaluationPayload, {}), payload);
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;

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
    const response = await apiRequest('/ai/player-summary', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Could not generate summary');
    return await response.json();
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    return {
      headline: 'Player development summary',
      strengths: payload.strengths || ['Competes hard', 'Responds to coaching'],
      developmentPriorities: payload.priorities || [
        'Sharper reads',
        'Better finishing balance'
      ],
      coachFocus:
        'Emphasize early reads, lower-body balance, and calm decision-making on drives.',
      playerMessage:
        'You are making progress. The next jump is slowing down enough to make stronger reads and more balanced finishes.',
      parentDraft:
        'Your athlete competed hard today. The next area of focus is making better decisions under pressure and finishing with control.'
    };
  }
}
