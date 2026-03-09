import { Hono } from 'hono';
import { insertToken, setTokenStatus, getTokenByValue } from '../db/tokens.js';
import { sha256 } from '../utils/crypto.js';
import { deleteAllSessions } from '../session/redis.js';

const webhooks = new Hono();

// ── POST /webhooks/gumroad ───────────────────────────────────────────────────
// Gumroad fires this on: sale, refund, dispute
// Payload is application/x-www-form-urlencoded
//
// To secure: set GUMROAD_PERMALINK in .env — the webhook handler verifies the
// product permalink matches before processing. This blocks spoofed requests.
webhooks.post('/gumroad', async (c) => {
  let body: Record<string, string>;
  try {
    const text = await c.req.text();
    body = Object.fromEntries(new URLSearchParams(text));
  } catch {
    console.error('[webhook] Failed to parse body');
    return c.json({ error: 'Invalid body' }, 400);
  }

  // Log full payload for debugging (remove in production if noisy)
  console.log('[webhook] gumroad payload:', JSON.stringify(body));

  // Validate product permalink to prevent spoofed webhooks
  const expectedPermalink = process.env.GUMROAD_PERMALINK;
  if (expectedPermalink && body.permalink !== expectedPermalink) {
    console.warn(`[webhook] permalink mismatch: got="${body.permalink}" expected="${expectedPermalink}"`);
    return c.json({ error: 'Unknown product' }, 403);
  }

  const { email, license_key, sale_id, refunded, chargebacked, disputed } = body;

  // ── Refund / chargeback / dispute: revoke license ────────────────────────
  if (refunded === 'true' || chargebacked === 'true' || disputed === 'true') {
    if (!license_key) {
      console.warn('[webhook] refund/dispute without license_key');
      return c.json({ ok: true }); // Gumroad expects 2xx
    }
    const record = getTokenByValue(license_key);
    if (record) {
      const reason: 'refunded' | 'revoked' = refunded === 'true' || chargebacked === 'true'
        ? 'refunded'
        : 'revoked';
      setTokenStatus(record.token_hash, reason);
      // Kill all active sessions immediately
      await deleteAllSessions(record.token_hash);
      console.log(`[webhook] token ${reason}  email=${record.email}  hash=${record.token_hash.slice(0, 8)}…`);
    }
    return c.json({ ok: true });
  }

  // ── New sale ─────────────────────────────────────────────────────────────
  if (!email || !license_key) {
    console.error('[webhook] new sale missing required fields:', { email, license_key, sale_id });
    return c.json({ error: 'Missing required fields' }, 400);
  }

  insertToken({ token: license_key, email, gumroadSaleId: sale_id });
  console.log(`[webhook] new token  email=${email}  sale=${sale_id}  hash=${sha256(license_key.trim().toUpperCase()).slice(0, 8)}…`);

  return c.json({ ok: true });
});

export default webhooks;
