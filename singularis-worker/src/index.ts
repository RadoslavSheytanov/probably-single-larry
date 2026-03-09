/**
 * Singularis License Validation Worker
 *
 * Receives { email, licenseKey } from the PWA, validates against the Gumroad API,
 * and returns a signed HMAC token the app stores locally for offline re-validation.
 *
 * Required secrets (set via: wrangler secret put <NAME>):
 *   HMAC_SECRET       — must match LICENSE_SALT in singularis/src/utils/constants.ts
 *
 * Required vars (in wrangler.toml or dashboard):
 *   GUMROAD_PRODUCT_ID — from your Gumroad product page
 */

export interface Env {
  GUMROAD_PRODUCT_ID: string;
  HMAC_SECRET: string;
}

interface GumroadResponse {
  success: boolean;
  message?: string;
  purchase?: {
    email: string;
    refunded: boolean;
    chargebacked: boolean;
    disputed: boolean;
  };
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function computeHMAC(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    let email: string, licenseKey: string;
    try {
      ({ email, licenseKey } = await request.json() as { email: string; licenseKey: string });
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    if (!email || !licenseKey) {
      return json({ error: 'Email and license key are required' }, 400);
    }

    const normalEmail = email.toLowerCase().trim();
    const normalKey = licenseKey.trim().toUpperCase();

    // Validate with Gumroad
    const gRes = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        product_id: env.GUMROAD_PRODUCT_ID,
        license_key: normalKey,
        increment_uses_count: 'false',
      }).toString(),
    });

    const gData = await gRes.json() as GumroadResponse;

    if (!gData.success) {
      return json({ error: 'Invalid license key. Check your purchase email and try again.' }, 403);
    }

    if (gData.purchase?.refunded || gData.purchase?.chargebacked || gData.purchase?.disputed) {
      return json({ error: 'This license has been refunded or disputed.' }, 403);
    }

    // Generate HMAC token — same secret + same message format as license.ts in PWA
    const token = await computeHMAC(env.HMAC_SECRET, `${normalEmail}:${normalKey}`);
    return json({ token });
  },
};
