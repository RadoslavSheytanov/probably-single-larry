/**
 * License service — Cloudflare Worker activation + local HMAC verification
 *
 * Flow:
 *   FIRST ACTIVATION (requires internet):
 *     1. User enters email + Gumroad license key in LicenseGate
 *     2. activateLicense() → POST /validate to Cloudflare Worker
 *     3. Worker verifies key against Gumroad API → returns HMAC token
 *     4. { email, key, token } stored in localStorage
 *
 *   SUBSEQUENT LAUNCHES (offline-capable):
 *     1. validateStoredLicense() reads localStorage
 *     2. Recomputes HMAC locally with VITE_LICENSE_SALT
 *     3. If token matches → unlocked immediately, no network call
 *
 *   DEACTIVATION:
 *     clearLicense() wipes localStorage → LicenseGate shown on next launch
 */

const WORKER_URL = (import.meta.env.VITE_WORKER_URL as string | undefined)?.replace(/\/$/, '')
  ?? 'http://localhost:8787';

// Must match HMAC_SECRET set in the Cloudflare Worker via `wrangler secret put HMAC_SECRET`
const SALT = (import.meta.env.VITE_LICENSE_SALT as string | undefined) ?? 'dev-only-salt';

const LS_EMAIL = 'sg_e';
const LS_KEY   = 'sg_k';
const LS_TOKEN = 'sg_t';

async function computeHMAC(email: string, key: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(SALT),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(`${email}:${key}`));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export interface StoredLicense {
  email: string;
  key: string;
  token: string;
}

export function getStoredLicense(): StoredLicense | null {
  const email = localStorage.getItem(LS_EMAIL);
  const key   = localStorage.getItem(LS_KEY);
  const token = localStorage.getItem(LS_TOKEN);
  if (!email || !key || !token) return null;
  return { email, key, token };
}

export async function validateStoredLicense(): Promise<boolean> {
  const stored = getStoredLicense();
  if (!stored) return false;
  const expected = await computeHMAC(stored.email, stored.key);
  return expected === stored.token;
}

export type ActivateResult =
  | { ok: true }
  | { ok: false; error: string };

export async function activateLicense(email: string, key: string): Promise<ActivateResult> {
  try {
    const res = await fetch(`${WORKER_URL}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim(), key: key.toUpperCase().trim() }),
    });

    const data = await res.json() as { token?: string; error?: string };

    if (!res.ok || !data.token) {
      return { ok: false, error: data.error ?? 'Activation failed.' };
    }

    localStorage.setItem(LS_EMAIL, email.toLowerCase().trim());
    localStorage.setItem(LS_KEY,   key.toUpperCase().trim());
    localStorage.setItem(LS_TOKEN, data.token);

    return { ok: true };
  } catch {
    return { ok: false, error: 'Cannot reach the activation server. Check your connection.' };
  }
}

export function clearLicense(): void {
  localStorage.removeItem(LS_EMAIL);
  localStorage.removeItem(LS_KEY);
  localStorage.removeItem(LS_TOKEN);
}
