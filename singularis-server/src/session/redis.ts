import { Redis } from 'ioredis';

const SESSION_TTL = parseInt(process.env.SESSION_TTL ?? '600', 10);

const redis = new Redis({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: 0,
  lazyConnect: true,
  retryStrategy: (times: number) => Math.min(times * 200, 5000),
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => console.log('[redis] connected'));
redis.on('error', (err: Error) => console.error('[redis] error:', err.message));

/**
 * Session key layout:
 *   session:{sessionId}              → tokenHash          (TTL: SESSION_TTL)
 *   sessions:{tokenHash}:{sessionId} → JSON meta blob     (TTL: SESSION_TTL)
 */

export async function createSession(
  tokenHash: string,
  sessionId: string,
  meta: { fingerprint: string },
): Promise<void> {
  const value = JSON.stringify({ ...meta, created_at: Date.now(), last_seen: Date.now() });
  const pipeline = redis.pipeline();
  pipeline.setex(`session:${sessionId}`, SESSION_TTL, tokenHash);
  pipeline.setex(`sessions:${tokenHash}:${sessionId}`, SESSION_TTL, value);
  await pipeline.exec();
}

export async function countActiveSessions(tokenHash: string): Promise<number> {
  const keys = await redis.keys(`sessions:${tokenHash}:*`);
  return keys.length;
}

export async function getSessionOwner(sessionId: string): Promise<string | null> {
  return redis.get(`session:${sessionId}`);
}

export async function refreshSession(tokenHash: string, sessionId: string): Promise<void> {
  const pipeline = redis.pipeline();
  pipeline.expire(`session:${sessionId}`, SESSION_TTL);
  pipeline.expire(`sessions:${tokenHash}:${sessionId}`, SESSION_TTL);
  await pipeline.exec();
}

export async function deleteSession(tokenHash: string, sessionId: string): Promise<void> {
  await redis.del(`session:${sessionId}`, `sessions:${tokenHash}:${sessionId}`);
}

export async function deleteAllSessions(tokenHash: string): Promise<void> {
  const keys = await redis.keys(`sessions:${tokenHash}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export { redis, SESSION_TTL };
