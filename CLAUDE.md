# CLAUDE.md — Singularis PWA

## Project Overview
Singularis is a professional-grade Progressive Web App for performing mentalists. It computes a spectator's date of birth and star sign from two secretly inputted numbers. The app has a clean Home dashboard for setup/practice, and a pure-black Performance Mode screen where the performer inputs numbers blind with the phone in their pocket. Results are pushed to the performer's smartwatch via ntfy.sh. No decoy calculator — the stealth is in how the phone is used, not what it looks like.

Sold via Gumroad as a one-time purchase. License key validation uses a Cloudflare Worker that calls the Gumroad License API; a signed HMAC token is stored locally for offline re-validation on subsequent launches. Targets iOS Safari PWA and Android Chrome PWA.

## Tech Stack
- React 18 + TypeScript
- Vite 7 (build tool, dev server, PWA plugin)
- Tailwind CSS 4 via @tailwindcss/vite (CSS-first config, @theme in index.css)
- Framer Motion 11 (animations, gesture recognition, spring physics)
- vite-plugin-pwa (Workbox-powered service worker generation)
- ntfy.sh (push notifications, no self-hosted server)
- No backend. No database. No API keys. Entirely client-side.

## Development Environment
- OS: Fedora Linux (no macOS, no Xcode — this is a PWA, not native)
- Node.js 20+ via nvm
- Package manager: npm
- Browser for testing: Google Chrome / Chromium (required for Speech API)
- Editor: any (Claude Code handles file creation)
- On first run, Claude Code must check and install all prerequisites:
  - Node.js 20+ (via nvm if not present)
  - git
  - Google Chrome or Chromium
  - Global npm packages: javascript-obfuscator, serve

## Commands
- Dev: `npm run dev`
- Build: `npm run build`
- Preview production: `npm run preview`
- Lint: `npm run lint`
- Type check: `npm run typecheck`

## File Structure
```
singularis/
├── CLAUDE.md
├── SPEC.md
├── package.json
├── vite.config.ts          # Tailwind v4, PWA, Terser, vitest config
├── tsconfig.json
├── index.html
├── public/
│   ├── manifest.json
│   └── icons/
└── src/
    ├── main.tsx
    ├── App.tsx             # Screen router with crossfade transitions
    ├── index.css           # Tailwind @import + @theme custom colors
    ├── state/
    │   └── store.ts        # Zustand store, single source of truth
    ├── engine/
    │   ├── singularis.ts   # Core formula (obfuscated in prod)
    │   ├── starsigns.ts    # Zodiac lookup table
    │   └── engine.test.ts  # Unit tests — 30/30 passing
    ├── screens/
    │   ├── Home.tsx        # Dashboard: start performance, settings, history, practice
    │   ├── StealthInput.tsx # Black screen — invisible touch zones, performance mode
    │   ├── ResultPeek.tsx  # Subtle result fallback (primary output = ntfy → watch)
    │   ├── Settings.tsx    # Slide-up panel
    │   ├── History.tsx     # Slide-up panel
    │   └── PracticeMode.tsx
    ├── components/
    │   ├── WatchPreview.tsx     # Simulated watch notification card
    │   ├── PhaseIndicator.tsx   # 4-state dots: ANCHOR→DIFFERENCE→COMPUTED→RESOLVING
    │   ├── AmbiguousResolver.tsx # Top/bottom tap to resolve ambiguous dates
    │   └── LicenseGate.tsx      # License key activation screen
    ├── services/
    │   ├── ntfy.ts         # Push notification to ntfy.sh
    │   ├── ics.ts          # Calendar file generation
    │   ├── haptics.ts      # Vibration patterns
    │   ├── wakeLock.ts     # Screen wake lock
    │   └── license.ts      # License key validation (calls CF Worker, stores HMAC token)
    ├── hooks/
    │   └── useStealthInput.ts  # Touch zone + gesture logic
    └── utils/
        ├── constants.ts
        └── types.ts
```

## Mobile Platform Notes
- All screens must account for iOS safe areas: `pt-[env(safe-area-inset-top)]` on headers, `pb-[env(safe-area-inset-bottom)]` on bottom bars
- Minimum touch target: 44×44px on all interactive elements
- Haptic calls (`navigator.vibrate`) must be wrapped in `try/catch` — iOS silently ignores but some environments throw
- Never assume Speech API availability — it's not used (voice input was removed)
- Test at 375px width (iPhone SE) — smallest supported viewport

## Code Standards
- TypeScript strict mode, no `any` types
- Functional components only, no class components
- Zustand for state management (single store, no prop drilling)
- Framer Motion for ALL animations (no CSS transitions/keyframes except Tailwind defaults)
- Tailwind for ALL styling (no inline styles, no CSS modules, no styled-components)
- Custom hooks extract complex logic from components
- Each component file < 150 lines. If longer, split it.
- Engine logic has 100% unit test coverage

## Design Philosophy
- HOME DASHBOARD: Clean dark surface (#0a0a0a) with all features accessible. Singularis branding visible here.
- PERFORMANCE MODE: Pure #000000. Phone in pocket. Blind input. Zero UI except subtle phase dots + faint number.
- WATCH IS THE PEEK: ntfy → smartwatch is the primary output. ResultPeek screen is a visual fallback only.
- PROFESSIONAL: This is a working tool for paid performers.
- OFFLINE-FIRST: Full functionality without internet (except ntfy push).
- ZERO COGNITIVE LOAD: Performer inputs numbers blind, phone in pocket. Top zone = +10, bottom = +1.

## Critical Rules
- NEVER add console.log in committed code
- NEVER use localStorage for anything except the license key
- ALWAYS validate computed dates before rendering
- NEVER expose the formula in readable source — wrap in obfuscated IIFE for prod
- PWA name is "Calculator" (stealth at OS/device level). App branding "Singularis" visible only inside Home screen.
- All touch handlers MUST call e.preventDefault() to block browser defaults
- Test every change against the reference case: A=24, D=10 → July 17, Cancer ♋

## Ambiguous Resolution (in-pocket, blind)
- On ambiguous result: haptic warning pattern → ntfy fires with BOTH dates
- Black screen stays active, top/bottom zones now select the date:
  - TOP tap = earlier date in calendar year
  - BOTTOM tap = later date in calendar year
- After tap: second ntfy fires with confirmed single date
- Phase indicator shows RESOLVING (4th state) during this window

## Current State
### Complete
- Phase 0: Environment setup (Node 24, Chrome 145, git, javascript-obfuscator, serve)
- Phase 1: Scaffold + engine
  - Vite 7 + React 18 + TypeScript, Tailwind v4, PWA config, Terser
  - src/engine/singularis.ts — full formula with all validation
  - src/engine/starsigns.ts — complete zodiac lookup
  - src/engine/engine.test.ts — 30/30 tests passing
  - src/utils/types.ts, src/utils/constants.ts
- Phase 2: State, home screen, stealth input, app router
  - src/state/store.ts — full Zustand store (navigation, stealth phases, history, settings)
  - src/screens/Home.tsx — dashboard with Start Performance, Practice, History, Settings
  - src/screens/StealthInput.tsx — black screen, invisible zones, RESOLVING ambiguous state
  - src/hooks/useStealthInput.ts — all gestures + keyboard shortcuts
  - src/components/PhaseIndicator.tsx — 4-state dots
  - src/services/haptics.ts — all 6 vibration patterns
  - src/App.tsx — AnimatePresence screen router
- Phase 3: Result screen, output channels
  - src/services/ntfy.ts — push to ntfy.sh (fires twice on ambiguous)
  - src/services/ics.ts — .ics calendar file generation + download
  - src/services/wakeLock.ts — screen wake lock with visibility re-acquire
  - src/components/WatchPreview.tsx — slide-in watch card, auto-dismisses after 5s
  - src/screens/ResultPeek.tsx — animated result reveal, save to calendar, new reading

- Phase 4: Settings, History, PracticeMode
  - src/screens/Settings.tsx — slide-up panel: input method, ntfy topic, toggles, activation taps, clear history, license display, version
  - src/screens/History.tsx — slide-up panel: chronological reading list, zodiac symbol + date + sign name
  - src/screens/PracticeMode.tsx — random date drill: show date, reveal A/D/steps/sign, edge case flags, next date
  - src/App.tsx — all three screens wired in (ComingSoon placeholders removed)
  - Bug fix: removed double history write (resolveAmbiguous no longer writes to history; ResultPeek handles all writes)
  - Bug fix: phase label opacity was using broken formula; fixed to constant 0.06

- Phase 5: PWA polish
  - public/icons/icon-192.png, icon-512.png — calculator icons generated via ImageMagick
  - index.html — full iOS/Android PWA meta tags, Google Fonts preconnect, noindex, title "Calculator"
  - src/index.css — safe-area utility classes: pt-safe-header, pb-safe-nav, top-safe, bottom-safe
  - src/utils/types.ts — removed InputMethod type, removed inputMethod from AppSettings
  - src/state/store.ts — removed inputMethod from DEFAULT_SETTINGS
  - src/screens/Settings.tsx — removed Input Method row; all screens updated with safe-area classes
  - All screens (Home, StealthInput, ResultPeek, Settings, History, PracticeMode, WatchPreview) — safe-area insets applied
  - vite.config.ts — orientation: portrait, categories, maskable icon, Google Fonts Workbox cache
  - package.json — added typecheck script
  - Typecheck: 0 errors

### Remaining
- Phase 6: License gate — LicenseGate.tsx screen, Cloudflare Worker (separate repo/deploy), license.ts service, HMAC token storage, anti-debugging, domain lock, obfuscation

### Key Decisions Made
- No Decoy Calculator — app has a Home dashboard instead
- Performance mode = pure black screen, phone always in pocket
- ntfy → watch is the primary output channel; ResultPeek is visual fallback
- Ambiguous: ntfy fires twice (both options first, then confirmed after tap resolution)
- Top zone tap = earlier calendar date; Bottom zone tap = later calendar date
- Phase indicator has 4 states: ANCHOR → DIFFERENCE → COMPUTED → RESOLVING
- Git: develop branch for all work; main kept clean for final PR merge
- Voice input removed — touch-only stealth input (top zone +10, bottom zone +1)
- Sales model: Gumroad one-time purchase → license key emailed → Cloudflare Worker validates against Gumroad API → HMAC token stored locally for offline re-validation
- Safe-area insets implemented via four @layer utility classes (pt-safe-header, pb-safe-nav, top-safe, bottom-safe) using CSS max() — no inline styles

## Session State (last updated: 2026-03-09)

### Last Session Summary
- Reviewed and amended architectural spec (CLAUDE.md + SPEC.md)
- Removed voice input from spec and all code
- Added mobile platform support section to SPEC.md
- Added sales/distribution section (Gumroad) and authentication architecture (Cloudflare Worker + HMAC) to SPEC.md
- Completed Phase 5: PWA polish

### Phases Complete
- Phase 0: Environment setup
- Phase 1: Engine (singularis.ts, starsigns.ts, 30/30 tests)
- Phase 2: State + core screens (store, Home, StealthInput, hooks, haptics)
- Phase 3: Output channels (ntfy, ics, wake lock, WatchPreview, ResultPeek)
- Phase 4: Settings, History, PracticeMode panels
- Phase 5: PWA polish (icons, meta tags, safe-area, manifest, typecheck)

### Phase In Progress
- **Phase 6** — not yet started
- Next step: build `src/screens/LicenseGate.tsx` (email + key input, activate button, spinner, error state)
- Then: `src/services/license.ts` (POST to CF Worker, store HMAC token, local verify on launch)
- Then: Wire LicenseGate into App.tsx (gate before home if no valid local token)
- Then: Build + deploy Cloudflare Worker (separate project, calls Gumroad License API)
- Then: Anti-debugging setInterval timing check + domain lock (prod build only)
- Then: Post-build javascript-obfuscator step

### Open Bugs / TODOs
- None currently known

### Design Decisions Differing from SPEC.md
- SPEC.md §2.1 describes a Decoy Calculator screen — this was dropped in favour of a Singularis Home dashboard (decision made in Phase 2, intentional)
- SPEC.md §2.2 included voice input — removed this session (unreliable, touch-only is correct approach)
- Settings.tsx no longer has "Input Method" row (voice removed)
- History storage is currently plain Zustand persist (localStorage via zustand/middleware) — SPEC.md mentions optional AES-256 encryption via Web Crypto API; this has NOT been implemented and is deferred/optional

### Store Shape (AppSettings)
```ts
interface AppSettings {
  ntfyTopic: string;
  autoSaveCalendar: boolean;
  watchPeekPreview: boolean;
  hapticFeedback: boolean;
  activationTaps: 3 | 5 | 7;
  licenseKey: string;
  licenseEmail: string;
}
```

### Safe-Area Utility Classes (src/index.css)
```css
.pt-safe-header  → max(56px, safe-area-inset-top + 16px)
.pb-safe-nav     → max(48px, safe-area-inset-bottom + 16px)
.top-safe        → max(32px, safe-area-inset-top + 8px)
.bottom-safe     → max(32px, safe-area-inset-bottom + 8px)
```
