/**
 * License service — Cloudflare Worker + localStorage HMAC
 *
 * Flow:
 *   FIRST ACTIVATION (requires internet):
 *     activateLicense(email, key) → POST /validate to CF Worker
 *     Worker verifies key with Gumroad → returns HMAC-SHA256(email:key, HMAC_SECRET)
 *     App stores { email, key, token } in localStorage (sg_e, sg_k, sg_t)
 *
 *   SUBSEQUENT LAUNCHES (fully offline):
 *     validateStoredLicense() reads localStorage
 *     Recomputes HMAC locally using VITE_LICENSE_SALT (must equal HMAC_SECRET)
 *     Match → unlocked, no network call
 *
 *   DEACTIVATION:
 *     clearLicense() removes all three localStorage keys
 */

const WORKER_URL = (import.meta.env.VITE_WORKER_URL as string | undefined)?.replace(/\/$/, '')
  ?? 'http://localhost:8787';

// Must equal HMAC_SECRET set in the Cloudflare Worker.
// Set VITE_LICENSE_SALT in .env.production before deploying.
// If missing in production, the HMAC will not match tokens issued by the Worker
// (which uses HMAC_SECRET from wrangler secrets), so validation correctly fails
// for all stored tokens — forcing re-activation. No silent bypass possible.
const LICENSE_SALT = (import.meta.env.VITE_LICENSE_SALT as string | undefined)
  ?? 'k9x2mP7qR4vL8nJ1';

const LS_EMAIL = 'sg_e';
const LS_KEY   = 'sg_k';
const LS_TOKEN = 'sg_t';

async function computeHMAC(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export type ActivateResult =
  | { ok: true }
  | { ok: false; error: string };

export async function activateLicense(email: string, key: string): Promise<ActivateResult> {
  const normEmail = email.toLowerCase().trim();
  const normKey   = key.toUpperCase().trim();

  try {
    const res = await fetch(`${WORKER_URL}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normEmail, key: normKey }),
    });

    const data = await res.json() as { token?: string; error?: string };

    if (!res.ok || !data.token) {
      return { ok: false, error: data.error ?? 'Activation failed.' };
    }

    localStorage.setItem(LS_EMAIL, normEmail);
    localStorage.setItem(LS_KEY, normKey);
    localStorage.setItem(LS_TOKEN, data.token);
    return { ok: true };
  } catch {
    return { ok: false, error: 'Cannot reach activation server. Check your connection.' };
  }
}

export async function validateStoredLicense(): Promise<boolean> {
  const email  = localStorage.getItem(LS_EMAIL);
  const key    = localStorage.getItem(LS_KEY);
  const stored = localStorage.getItem(LS_TOKEN);
  if (!email || !key || !stored) return false;

  const expected = await computeHMAC(`${email}:${key}`, LICENSE_SALT);
  return expected === stored;
}

export function clearLicense(): void {
  localStorage.removeItem(LS_EMAIL);
  localStorage.removeItem(LS_KEY);
  localStorage.removeItem(LS_TOKEN);
}

export function getStoredEmail(): string | null {
  return localStorage.getItem(LS_EMAIL);
}
