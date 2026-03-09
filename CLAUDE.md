# CLAUDE.md — Singularis PWA

## Project Overview
Singularis is a professional-grade Progressive Web App for performing mentalists. It computes a spectator's date of birth and star sign from two secretly inputted numbers. The app has a clean Home dashboard for setup/practice, and a pure-black Performance Mode screen where the performer inputs numbers blind with the phone in their pocket. Results are pushed to the performer's smartwatch via ntfy.sh. No decoy calculator — the stealth is in how the phone is used, not what it looks like.

Sold via Gumroad as a one-time purchase. Licensing uses a URL-token + Redis session model: buyer gets `singularis.app?t=TOKEN` link, app exchanges token with a Node.js server for a session, heartbeat keeps session alive. Targets iOS Safari PWA and Android Chrome PWA.

## Tech Stack
- React 19 + TypeScript (strict)
- Vite 7 (build tool, dev server, PWA plugin)
- Tailwind CSS 4 via @tailwindcss/vite
- Framer Motion 12 (animations)
- vite-plugin-pwa (Workbox service worker)
- Zustand 5 (state management)
- ntfy.sh (push notifications)
- singularis-server/ — Node.js 24 + Hono + node:sqlite + Redis (license server)

## Development Environment
- OS: Fedora Linux
- Node.js 24 via nvm
- Package manager: npm
- Browser: Google Chrome / Chromium
- Global npm packages required: javascript-obfuscator, serve
- Redis required for local dev: `docker run -p 6379:6379 redis:alpine` or system redis

## Git Branches
- `develop` — all active work; working branch (YOU ARE HERE)
- `main` — clean/stable; only merge into main for releases

## Commands (root / PWA)
Run from `probably-single-larry/`:
- Dev: `npm run dev`
- Build: `npm run build`
- Build + obfuscate (prod): `npm run build:prod`
- Preview: `npm run preview`
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Tests: `npx vitest run`

## Commands (singularis-server/)
- Dev (with hot reload): `npm run dev`
- Start: `npm run start`
- Add token manually: `npm run add-token <email> <token>`
- List tokens: `npm run add-token list`
- Type check: `npm run typecheck`

## Project Layout
```
probably-single-larry/           ← repo root (branch: develop)
├── CLAUDE.md                    ← YOU ARE HERE
├── SPEC.md
├── package.json                 # PWA
├── vite.config.ts
├── tsconfig.json
├── index.html                   # title="Calculator"
├── .env.production              # VITE_SERVER_URL=https://your-server.com
├── public/icons/
└── src/
    ├── main.tsx                 # Domain lock + anti-debug (PROD only)
    ├── App.tsx                  # URL token capture → exchange → heartbeat → screens
    ├── index.css                # Tailwind @import + safe-area utilities
    ├── state/store.ts           # Zustand store
    ├── engine/
    │   ├── singularis.ts
    │   ├── starsigns.ts
    │   └── engine.test.ts       # 30/30 passing
    ├── screens/
    │   ├── LicenseGate.tsx      # Token paste/input → exchange → unlock
    │   ├── Home.tsx
    │   ├── StealthInput.tsx
    │   ├── ResultPeek.tsx
    │   ├── Settings.tsx         # onDeactivate prop → logout() → needs-auth
    │   ├── History.tsx
    │   └── PracticeMode.tsx
    ├── components/
    │   ├── WatchPreview.tsx
    │   └── PhaseIndicator.tsx
    ├── services/
    │   ├── license.ts           # captureURLToken, exchangeToken, heartbeat, logout
    │   ├── ntfy.ts
    │   ├── ics.ts
    │   ├── haptics.ts
    │   └── wakeLock.ts
    ├── hooks/
    │   ├── useStealthInput.ts
    │   └── useHeartbeat.ts      # 3-min interval, visibility-aware, NETWORK_ERROR tolerant
    └── utils/
        ├── constants.ts
        └── types.ts
singularis-server/               ← License server (Node.js 24 + Hono)
│   ├── package.json             # hono, @hono/node-server, ioredis, tsx
│   ├── tsconfig.json
│   ├── .env.example
│   ├── data/                    # SQLite db (mount as persistent volume in prod)
│   ├── scripts/
│   │   └── add-token.ts         # CLI: manually add/list tokens
│   └── src/
│       ├── index.ts             # Hono app + node-server, initDB on boot
│       ├── db/
│       │   ├── client.ts        # node:sqlite DatabaseSync, WAL mode
│       │   └── tokens.ts        # getTokenByValue/Hash, insertToken, setTokenStatus
│       ├── session/
│       │   └── redis.ts         # createSession, countActiveSessions, refreshSession
│       ├── routes/
│       │   ├── auth.ts          # POST /auth/exchange|heartbeat|logout
│       │   └── webhooks.ts      # POST /webhooks/gumroad (sale + refund/dispute)
│       └── utils/
│           ├── crypto.ts        # sha256()
│           └── fingerprint.ts   # IP+UA hash for audit logging
singularis-worker/               ← DEPRECATED — superseded by singularis-server/
```

## License Architecture
```
USER FLOW:
  Gumroad purchase → email link: singularis.app?t=GUMROAD-LICENSE-KEY
  App captures token → POST /auth/exchange → session_id (in memory)
  Heartbeat every 3min → POST /auth/heartbeat Bearer {session_id}
  Server TTL = 10min → zombie sessions die automatically
  Logout: POST /auth/logout → session deleted from Redis

SERVER VALIDATION (POST /auth/exchange):
  1. SHA-256(token) → look up in SQLite
  2. Check status = 'active'
  3. COUNT Redis keys sessions:{hash}:* → reject if ≥ max_sessions (default 1)
  4. Create session: SET session:{uuid} = hash EX 600
                      SET sessions:{hash}:{uuid} = {fingerprint} EX 600
  5. Return { session_id, expires_in: 600 }

HEARTBEAT (POST /auth/heartbeat):
  GET session:{session_id} → tokenHash
  Re-check DB status (catches real-time revocation)
  EXPIRE both keys 600s
  Return { ok: true }

REVOCATION (POST /webhooks/gumroad with refunded=true):
  Update SQLite status → 'refunded'
  DEL all sessions:{hash}:* keys
  Next heartbeat on client fails → LicenseGate shown
```

## Session State in PWA (App.tsx)
```
'checking'   → black screen while captureURLToken() + exchangeToken() run
'active'     → normal app, useHeartbeat running
'needs-auth' → LicenseGate shown (initial, expired, concurrent limit, deactivate)
```

## Heartbeat Design (useHeartbeat.ts)
- Interval: 3 minutes (server TTL: 10 minutes — 3x safety margin)
- Skips beats when `document.hidden` (tab in background)
- Re-checks immediately on `visibilitychange` → visible
- `NETWORK_ERROR` code: transient — keeps session alive, retries next interval
- Any other non-ok code: calls `onExpired()` → 'needs-auth'

## Mobile Platform Notes
- iOS safe areas: `pt-safe-header` on headers, `pb-safe-nav` on bottom bars
- Minimum touch target: 44×44px
- Haptics wrapped in try/catch
- Test at 375px width (iPhone SE)

## Code Standards
- TypeScript strict, no `any`
- Functional components only
- Zustand for state, Framer Motion for animations, Tailwind for styling
- Each component < 150 lines

## Critical Rules
- NEVER add console.log in committed client code
- NEVER use localStorage in the PWA (session is in memory, no local persistence needed)
- PWA name is "Calculator" — Singularis branding inside app only
- All touch handlers MUST call e.preventDefault()
- Test every change: A=24, D=10 → July 17, Cancer ♋

## Ambiguous Resolution
- TOP half tap = earlier date; BOTTOM = later
- ntfy fires twice: both dates first, confirmed date after resolution

## Production Hardening (main.tsx, PROD only)
- Domain lock: blank if hostname not in ALLOWED_DOMAINS — update before deploy
- Anti-debugging: setInterval timing check across debugger statement
- Build: `npm run build:prod` = Terser + javascript-obfuscator on dist/assets

## Current State — ALL PHASES COMPLETE
- Phase 0–5: Engine, screens, output channels, PWA polish (see previous sessions)
- Phase 6 (completed this session):
  - singularis-server/ built: Hono + node:sqlite + Redis session tracking
  - src/services/license.ts rewritten: URL token capture, exchange, heartbeat, logout
  - src/hooks/useHeartbeat.ts created
  - src/screens/LicenseGate.tsx rewritten: token/URL paste input, spinner, error
  - src/App.tsx updated: URL token capture on mount, session state machine, heartbeat wired
  - src/screens/Settings.tsx updated: onDeactivate prop (calls logout() → needs-auth)
  - Typechecks: PWA 0 errors, server 0 errors

## Pre-Ship Checklist
1. Start Redis locally: `docker run -p 6379:6379 redis:alpine`
2. Copy `singularis-server/.env.example` → `.env`, fill in values
3. Add a test token: `npm run add-token user@test.com MY-TEST-TOKEN`
4. Start server: `npm run dev` (port 3000)
5. Open `http://localhost:5173?t=MY-TEST-TOKEN` — should unlock
6. Set Gumroad webhook URL to `https://your-server.com/webhooks/gumroad`
7. Update `ALLOWED_DOMAINS` in `src/main.tsx` with production domain
8. Create `.env.production` (root) with `VITE_SERVER_URL=https://your-server.com`
9. Update Gumroad URL in `LicenseGate.tsx`
10. Run `npm run build:prod` and deploy PWA
11. Deploy server to Railway/Fly.io with Redis addon, persistent data volume

## Key Decisions
- URL token (`?t=`) is permanent credential — users bookmark their link
- Token is NOT one-time-use: same token can create sessions (one at a time)
- session_id stored in memory only — forces re-exchange on page reload (feature not bug)
- NETWORK_ERROR on heartbeat = tolerated (mobile networks drop); other errors = lock
- singularis-worker/ left in place but superseded — can be deleted

## Safe-Area Utility Classes (src/index.css)
```
.pt-safe-header  → padding-top:  max(56px, safe-area-inset-top + 16px)
.pb-safe-nav     → padding-bottom: max(48px, safe-area-inset-bottom + 16px)
.top-safe        → top: max(32px, safe-area-inset-top + 8px)
.bottom-safe     → bottom: max(32px, safe-area-inset-bottom + 8px)
```

## Store Shape (AppSettings)
```ts
interface AppSettings {
  ntfyTopic: string;
  autoSaveCalendar: boolean;
  watchPeekPreview: boolean;
  hapticFeedback: boolean;
  activationTaps: 3 | 5 | 7;
  licenseKey: string;    // display only
  licenseEmail: string;  // display only
}
```
