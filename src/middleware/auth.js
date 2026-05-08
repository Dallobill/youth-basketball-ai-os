const crypto = require('crypto');
const { query } = require('../db');

const WRITE_ROLES = new Set(['director', 'coach', 'assistant']);

function asArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string' && value) {
    return [value];
  }

  return [];
}

function decodeSegment(segment) {
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'));
}

function verifyHs256(token, secret) {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error('Malformed token');
  }

  const header = decodeSegment(encodedHeader);
  if (header.alg !== 'HS256') {
    throw new Error('Unsupported JWT algorithm');
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (expectedSignature !== encodedSignature) {
    throw new Error('Invalid signature');
  }

  const payload = decodeSegment(encodedPayload);
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    throw new Error('Token expired');
  }

  return payload;
}

function normalizeClaims(payload = {}) {
  const appMeta = payload.app_metadata || {};
  const userMeta = payload.user_metadata || {};

  const role = payload.role || appMeta.role || userMeta.role || 'assistant';

  const organizationIds = [
    ...asArray(payload.organizationIds),
    ...asArray(payload.organizationId),
    ...asArray(payload.org_id),
    ...asArray(appMeta.organizationIds),
    ...asArray(appMeta.organizationId),
    ...asArray(userMeta.organizationIds),
    ...asArray(userMeta.organizationId)
  ];

  const teamIds = [
    ...asArray(payload.teamIds),
    ...asArray(payload.teamId),
    ...asArray(appMeta.teamIds),
    ...asArray(appMeta.teamId),
    ...asArray(userMeta.teamIds),
    ...asArray(userMeta.teamId)
  ];

  return {
    sub: payload.sub,
    email: payload.email,
    role,
    organizationIds: [...new Set(organizationIds)],
    teamIds: [...new Set(teamIds)]
  };
}

function verifyJwt(token) {
  const secret = process.env.JWT_SECRET || process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET or SUPABASE_JWT_SECRET');
  }

  return verifyHs256(token, secret);
}

async function authRequired(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Missing bearer token' });
    }

    const payload = verifyJwt(token);
    req.auth = normalizeClaims(payload);
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function requireRole(roles) {
  const roleSet = new Set(roles);

  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roleSet.has(req.auth.role)) {
      return res.status(403).json({ error: 'Insufficient role permissions' });
    }

    return next();
  };
}

const requireWriteRole = requireRole(WRITE_ROLES);

async function canAccessOrganization(req, organizationId) {
  if (!organizationId) return false;
  if (req.auth.organizationIds.includes(organizationId)) return true;

  if (!req.auth.teamIds.length) return false;

  const result = await query(
    'SELECT organization_id FROM teams WHERE id = ANY($1::uuid[]) LIMIT 1',
    [req.auth.teamIds]
  );
  return result.rows.some((row) => row.organization_id === organizationId);
}

async function canAccessTeam(req, teamId) {
  if (!teamId) return false;
  if (req.auth.teamIds.includes(teamId)) return true;

  const result = await query(
    'SELECT organization_id FROM teams WHERE id = $1',
    [teamId]
  );
  if (!result.rows.length) return false;

  return req.auth.organizationIds.includes(result.rows[0].organization_id);
}

async function canAccessPlayer(req, playerId) {
  if (!playerId) return false;

  const result = await query(
    `SELECT p.organization_id,
            ARRAY_REMOVE(ARRAY_AGG(ptm.team_id), NULL) AS team_ids
     FROM players p
     LEFT JOIN player_team_memberships ptm ON ptm.player_id = p.id AND ptm.is_active = TRUE
     WHERE p.id = $1
     GROUP BY p.id`,
    [playerId]
  );

  if (!result.rows.length) return false;

  const player = result.rows[0];
  if (req.auth.organizationIds.includes(player.organization_id)) return true;

  const activeTeamIds = player.team_ids || [];
  return activeTeamIds.some((teamId) => req.auth.teamIds.includes(teamId));
}

function getTeamScope(req) {
  if (req.auth.teamIds.length > 0) {
    return {
      clause: '(t.id = ANY($1::uuid[]) OR t.organization_id = ANY($2::uuid[]))',
      params: [req.auth.teamIds, req.auth.organizationIds]
    };
  }

  if (req.auth.organizationIds.length > 0) {
    return {
      clause: 't.organization_id = ANY($1::uuid[])',
      params: [req.auth.organizationIds]
    };
  }

  return {
    clause: 'FALSE',
    params: []
  };
}

module.exports = {
  authRequired,
  requireRole,
  requireWriteRole,
  canAccessOrganization,
  canAccessTeam,
  canAccessPlayer,
  getTeamScope,
  WRITE_ROLES
};
