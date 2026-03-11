# CLAUDE.md — Singularis PWA

## Project Overview
Singularis is a professional-grade Progressive Web App for performing mentalists. It computes a spectator's date of birth and star sign from two secretly inputted numbers. The app has a clean Home dashboard for setup/practice, and a pure-black Performance Mode screen where the performer inputs numbers blind with the phone in their pocket. Results are pushed to the performer's smartwatch via ntfy.sh. No decoy calculator — the stealth is in how the phone is used, not what it looks like.

Sold via Gumroad as a one-time purchase. Licensing uses a Cloudflare Worker (free tier) + local HMAC model: first activation validates the key against Gumroad and stores an HMAC token in localStorage; subsequent launches validate locally with no network call. Zero recurring server costs. Targets iOS Safari PWA and Android Chrome PWA.

## Tech Stack
- React 19 + TypeScript (strict)
- Vite 7 (build tool, dev server, PWA plugin)
- Tailwind CSS 4 via @tailwindcss/vite
- Framer Motion 12 (animations)
- vite-plugin-pwa (Workbox service worker)
- Zustand 5 (state management)
- ntfy.sh (push notifications)
- singularis-worker/ — Cloudflare Worker (free tier) for first-activation validation

## Development Environment
- OS: Fedora Linux
- Node.js 24 via nvm
- Package manager: npm
- Browser: Google Chrome / Chromium
- Global npm packages required: javascript-obfuscator, serve
- Wrangler required for local worker dev: `npm install -g wrangler`

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

## Commands (singularis-worker/)
- Dev (local): `npm run dev` (runs at http://localhost:8787)
- Deploy: `npm run deploy`
- Set secret: `wrangler secret put HMAC_SECRET`
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
    │   ├── license.ts           # activateLicense, validateStoredLicense, clearLicense
    │   ├── ntfy.ts
    │   ├── ics.ts
    │   ├── haptics.ts
    │   └── wakeLock.ts
    ├── hooks/
    │   └── useStealthInput.ts
    └── utils/
        ├── constants.ts
        └── types.ts
singularis-worker/               ← Cloudflare Worker (free tier) — license validation
│   ├── package.json             # wrangler, @cloudflare/workers-types
│   ├── wrangler.toml            # name, compatibility_date, GUMROAD_PERMALINK var
│   ├── tsconfig.json
│   ├── .dev.vars.example        # HMAC_SECRET, GUMROAD_PERMALINK for local dev
│   └── src/
│       └── index.ts             # POST /validate: Gumroad verify → HMAC token
```

## License Architecture
```
FIRST ACTIVATION (requires internet, one-time per device):
  User enters email + Gumroad license key in LicenseGate
       ↓
  POST /validate to Cloudflare Worker (free tier)
       ↓
  Worker verifies key against Gumroad License API
       ↓
  If valid: Worker computes HMAC-SHA256(email:key, HMAC_SECRET) → token
       ↓
  App stores { email, key, token } in localStorage

SUBSEQUENT LAUNCHES (fully offline):
  validateStoredLicense() reads localStorage
       ↓
  Recomputes HMAC-SHA256(email:key, VITE_LICENSE_SALT) locally
  (VITE_LICENSE_SALT must equal HMAC_SECRET — set before deploy)
       ↓
  If match → unlocked immediately, zero network calls

DEACTIVATION:
  clearLicense() removes localStorage items → LicenseGate on next launch

REVOCATION:
  Disable key in Gumroad dashboard → any future fresh activations rejected
  Existing activated devices keep working until they clear localStorage
  (Acceptable trade-off for zero server cost)
```

## Auth State in PWA (App.tsx)
```
'checking'   → black screen while validateStoredLicense() runs (async HMAC)
'active'     → normal app
'needs-auth' → LicenseGate shown (first launch, deactivated, or tampered storage)
```

## Env Vars
```
VITE_WORKER_URL     = https://singularis-worker.your-subdomain.workers.dev
VITE_LICENSE_SALT   = <same value as HMAC_SECRET in the Worker>
```
Set in `.env.production` (gitignored). For local dev use `.env` or `.env.local`.

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
- localStorage is used ONLY for license data (sg_e, sg_k, sg_t) and Zustand settings — nothing else
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

## Current State — ALL PHASES COMPLETE + TESTED
- Phase 0–5: Engine, screens, output channels, PWA polish
- Phase 6: Licensing rewritten to Cloudflare Worker + localStorage HMAC (zero server cost)
  - singularis-worker/ built: CF Worker, Gumroad verify, HMAC-SHA256 token
  - src/services/license.ts: activateLicense, validateStoredLicense, clearLicense
  - src/screens/LicenseGate.tsx: email + key fields, activate flow
  - src/App.tsx: simple checking/active/needs-auth state, no heartbeat
  - src/screens/Settings.tsx: shows stored email, Deactivate button
  - singularis-server/ deleted (no recurring cost architecture)
  - Typechecks: 0 errors
- Bug fix: ntfy zodiac symbol moved from Title header to body
  - HTTP headers are ISO-8859-1 only — Unicode symbols caused silent fetch failure
  - Title is now sign name only (ASCII); body is `symbol date` (UTF-8 allowed)
- End-to-end tested: engine, ntfy push to iPhone, watch peek preview all confirmed working

## Pre-Ship Checklist
1. Deploy Cloudflare Worker:
   - `cd singularis-worker && npm install`
   - `wrangler login`
   - Update `GUMROAD_PERMALINK` in `wrangler.toml` to your actual product slug
   - `wrangler secret put HMAC_SECRET` (enter a strong random secret)
   - `npm run deploy` → note the worker URL (e.g. `https://singularis-worker.you.workers.dev`)
2. Configure PWA for production:
   - Create `.env.production` at repo root:
     ```
     VITE_WORKER_URL=https://singularis-worker.you.workers.dev
     VITE_LICENSE_SALT=<same value as HMAC_SECRET>
     ```
   - Update `ALLOWED_DOMAINS` in `src/main.tsx` with your production domain
   - Update the Gumroad purchase link in `src/screens/LicenseGate.tsx`
3. Build and deploy PWA:
   - `npm run build:prod`
   - Deploy `dist/` to any static host (Cloudflare Pages, Vercel, Netlify — all free)

## Key Decisions
- Cloudflare Worker free tier: 100,000 requests/day — more than sufficient for this product
- HMAC token stored in localStorage — validated locally on every launch (offline after activation)
- Revocation: disable key in Gumroad → new activations blocked; existing devices keep working
- This trade-off (no remote kill switch) is acceptable for a niche professional tool
- ntfy Title header must be ASCII only — zodiac symbols go in the body, not the header
- No external attribution in commits — keep commit messages clean, no co-author lines

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
}
```
