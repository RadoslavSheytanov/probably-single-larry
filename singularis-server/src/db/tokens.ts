import { db } from './client.js';
import { sha256 } from '../utils/crypto.js';

export interface TokenRecord {
  id: string;
  token: string;
  token_hash: string;
  email: string;
  status: 'active' | 'revoked' | 'refunded';
  max_sessions: number;
  gumroad_sale_id: string | null;
}

const normalize = (token: string) => token.trim().toUpperCase();

export function getTokenByValue(rawToken: string): TokenRecord | null {
  const hash = sha256(normalize(rawToken));
  return db.prepare('SELECT * FROM tokens WHERE token_hash = ?').get(hash) as unknown as TokenRecord | null;
}

export function getTokenByHash(tokenHash: string): TokenRecord | null {
  return db.prepare('SELECT * FROM tokens WHERE token_hash = ?').get(tokenHash) as unknown as TokenRecord | null;
}

export function insertToken(data: {
  token: string;
  email: string;
  gumroadSaleId?: string;
}): void {
  const id = crypto.randomUUID();
  const normalToken = normalize(data.token);
  const hash = sha256(normalToken);
  db.prepare(
    'INSERT OR IGNORE INTO tokens (id, token, token_hash, email, gumroad_sale_id) VALUES (?, ?, ?, ?, ?)',
  ).run(id, normalToken, hash, data.email.toLowerCase().trim(), data.gumroadSaleId ?? null);
}

export function setTokenStatus(tokenHash: string, status: 'revoked' | 'refunded'): void {
  db.prepare('UPDATE tokens SET status = ? WHERE token_hash = ?').run(status, tokenHash);
}

export function listTokens(): TokenRecord[] {
  return db.prepare('SELECT * FROM tokens ORDER BY created_at DESC').all() as unknown as TokenRecord[];
}
