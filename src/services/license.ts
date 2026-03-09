/**
 * License service — URL-token exchange + session heartbeat
 *
 * Flow:
 *   1. User opens singularis.app?t=TOKEN (from purchase email)
 *   2. captureURLToken() extracts token and strips it from URL bar immediately
 *   3. exchangeToken(token) → POST /auth/exchange → { session_id, expires_in }
 *   4. session_id stored in module-level variable (memory only — never localStorage)
 *   5. useHeartbeat() calls heartbeat() every 3 minutes to keep session alive
 *   6. On heartbeat 403: session expired → App shows LicenseGate
 *   7. logout() → POST /auth/logout → clears session from server + memory
 */

const SERVER_URL = (import.meta.env.VITE_SERVER_URL as string | undefined)?.replace(/\/$/, '')
  ?? 'http://localhost:3000';

let _sessionId: string | null = null;

export function captureURLToken(): string | null {
  const params = new URLSearchParams(location.search);
  const token = params.get('t') ?? params.get('token');
  if (token) {
    history.replaceState(null, '', location.pathname);
  }
  return token ? token.trim().toUpperCase() : null;
}

export function parseTokenFromInput(raw: string): string {
  const s = raw.trim();
  if (s.includes('?')) {
    const query = s.split('?')[1];
    const p = new URLSearchParams(query);
    const t = p.get('t') ?? p.get('token');
    if (t) return t.trim().toUpperCase();
  }
  return s.toUpperCase();
}

export type ExchangeResult =
  | { ok: true; expiresIn: number }
  | { ok: false; error: string; code?: string };

export async function exchangeToken(token: string): Promise<ExchangeResult> {
  try {
    const res = await fetch(`${SERVER_URL}/auth/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const data = await res.json() as {
      session_id?: string;
      expires_in?: number;
      error?: string;
      code?: string;
    };

    if (!res.ok) {
      return { ok: false, error: data.error ?? 'Activation failed.', code: data.code };
    }

    _sessionId = data.session_id!;
    return { ok: true, expiresIn: data.expires_in! };
  } catch {
    return { ok: false, error: 'Cannot reach the license server. Check your connection.' };
  }
}

export type HeartbeatResult =
  | { ok: true }
  | { ok: false; error: string; code?: string };

export async function heartbeat(): Promise<HeartbeatResult> {
  if (!_sessionId) return { ok: false, error: 'No active session', code: 'NO_SESSION' };

  try {
    const res = await fetch(`${SERVER_URL}/auth/heartbeat`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${_sessionId}` },
    });

    const data = await res.json() as { ok?: boolean; error?: string; code?: string };

    if (!res.ok) {
      _sessionId = null;
      return { ok: false, error: data.error ?? 'Session expired.', code: data.code };
    }

    return { ok: true };
  } catch {
    return { ok: false, error: 'Network error.', code: 'NETWORK_ERROR' };
  }
}

export async function logout(): Promise<void> {
  if (!_sessionId) return;
  const sid = _sessionId;
  _sessionId = null;
  try {
    await fetch(`${SERVER_URL}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sid}` },
    });
  } catch {
    // best-effort
  }
}

export function hasSession(): boolean {
  return _sessionId !== null;
}
