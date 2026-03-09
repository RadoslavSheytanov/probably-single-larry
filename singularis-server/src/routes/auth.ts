import { Hono } from 'hono';
import { getTokenByValue, getTokenByHash } from '../db/tokens.js';
import {
  createSession,
  countActiveSessions,
  getSessionOwner,
  refreshSession,
  deleteSession,
  SESSION_TTL,
} from '../session/redis.js';
import { getFingerprint } from '../utils/fingerprint.js';

const auth = new Hono();

function extractBearer(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

// ── POST /auth/exchange ──────────────────────────────────────────────────────
// Body: { token: string }
// Returns: { session_id, expires_in } | { error, code? }
auth.post('/exchange', async (c) => {
  let token: string;
  try {
    ({ token } = await c.req.json<{ token: string }>());
  } catch {
    return c.json({ error: 'Invalid request body' }, 400);
  }

  if (!token || typeof token !== 'string') {
    return c.json({ error: 'token is required' }, 400);
  }

  // Validate token against DB
  const record = getTokenByValue(token);
  if (!record) {
    return c.json(
      { error: 'Token not recognised. Check your purchase email and try again.' },
      403,
    );
  }
  if (record.status !== 'active') {
    return c.json(
      { error: `License is ${record.status}. Contact support if this is unexpected.`, code: `LICENSE_${record.status.toUpperCase()}` },
      403,
    );
  }

  // Enforce concurrent session limit
  const activeCount = await countActiveSessions(record.token_hash);
  if (activeCount >= record.max_sessions) {
    return c.json(
      {
        error:
          'Another session is already active. Close the app on your other device — the slot frees automatically within a few minutes.',
        code: 'CONCURRENT_LIMIT',
      },
      409,
    );
  }

  // Create session
  const sessionId = crypto.randomUUID();
  const fingerprint = getFingerprint(c.req);
  await createSession(record.token_hash, sessionId, { fingerprint });

  console.log(
    `[auth] exchange  email=${record.email}  token=${record.token_hash.slice(0, 8)}…  session=${sessionId.slice(0, 8)}…  fp=${fingerprint}`,
  );

  return c.json({ session_id: sessionId, expires_in: SESSION_TTL });
});

// ── POST /auth/heartbeat ─────────────────────────────────────────────────────
// Authorization: Bearer {session_id}
// Returns: { ok: true } | { ok: false, error, code }
auth.post('/heartbeat', async (c) => {
  const sessionId = extractBearer(c.req.header('Authorization'));
  if (!sessionId) {
    return c.json({ ok: false, error: 'Missing or malformed Authorization header', code: 'MISSING_SESSION' }, 401);
  }

  // Resolve session → tokenHash
  const tokenHash = await getSessionOwner(sessionId);
  if (!tokenHash) {
    return c.json({ ok: false, error: 'Session expired', code: 'SESSION_EXPIRED' }, 403);
  }

  // Re-check subscription status on every heartbeat (detects real-time revocation)
  const record = getTokenByHash(tokenHash);
  if (!record || record.status !== 'active') {
    await deleteSession(tokenHash, sessionId);
    return c.json({ ok: false, error: 'License revoked', code: 'LICENSE_REVOKED' }, 403);
  }

  // Refresh TTL — session lives another SESSION_TTL seconds
  await refreshSession(tokenHash, sessionId);
  return c.json({ ok: true });
});

// ── POST /auth/logout ────────────────────────────────────────────────────────
// Authorization: Bearer {session_id}
// Returns: { ok: true } (always — idempotent)
auth.post('/logout', async (c) => {
  const sessionId = extractBearer(c.req.header('Authorization'));
  if (!sessionId) return c.json({ ok: true });

  const tokenHash = await getSessionOwner(sessionId);
  if (tokenHash) {
    await deleteSession(tokenHash, sessionId);
    console.log(`[auth] logout  session=${sessionId.slice(0, 8)}…`);
  }

  return c.json({ ok: true });
});

export default auth;
