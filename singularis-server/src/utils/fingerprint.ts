import type { HonoRequest } from 'hono';
import { sha256 } from './crypto.js';

/** Soft device fingerprint from request headers. Not used for hard enforcement —
 *  only for audit logging to detect suspicious cross-device sharing. */
export function getFingerprint(req: HonoRequest): string {
  const ip =
    req.header('x-forwarded-for')?.split(',')[0].trim() ??
    req.header('cf-connecting-ip') ??
    'unknown';
  const ua = req.header('user-agent') ?? 'unknown';
  return sha256(`${ip}:${ua}`).slice(0, 16);
}
