import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { initDB } from './db/client.js';
import authRoutes from './routes/auth.js';
import webhookRoutes from './routes/webhooks.js';

const app = new Hono();

// ── Middleware ───────────────────────────────────────────────────────────────
app.use('*', logger());

app.use('/auth/*', cors({
  origin: process.env.ALLOWED_ORIGIN ?? '*',
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['POST', 'OPTIONS'],
  maxAge: 86400,
}));

// ── Routes ───────────────────────────────────────────────────────────────────
app.route('/auth', authRoutes);
app.route('/webhooks', webhookRoutes);
app.get('/health', (c) => c.json({ ok: true, ts: Date.now() }));

// ── Boot ─────────────────────────────────────────────────────────────────────
initDB();

const port = parseInt(process.env.PORT ?? '3000', 10);
console.log(`[server] listening on :${port}`);

serve({ fetch: app.fetch, port });
