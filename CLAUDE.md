# CLAUDE.md — Singularis PWA

## Project Overview
Singularis is a professional-grade Progressive Web App for performing mentalists. It computes a spectator's date of birth and star sign from two secretly inputted numbers. The app has a clean Home dashboard for setup/practice, and a pure-black Performance Mode screen where the performer inputs numbers blind with the phone in their pocket. Results are pushed to the performer's smartwatch via ntfy.sh. No decoy calculator — the stealth is in how the phone is used, not what it looks like.

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
    │   ├── speech.ts       # Web Speech API voice input
    │   ├── wakeLock.ts     # Screen wake lock
    │   └── license.ts      # License key validation
    ├── hooks/
    │   ├── useStealthInput.ts  # Touch zone + gesture logic
    │   └── useVoiceCapture.ts  # Speech recognition hook
    └── utils/
        ├── constants.ts
        └── types.ts
```

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

### Remaining
- Phase 2: Zustand store, Home screen, StealthInput (performance mode), App router
- Phase 3: ResultPeek (visual fallback), AmbiguousResolver, ntfy service, .ics service
- Phase 4: Settings panel, History panel, PracticeMode
- Phase 5: Voice input (Web Speech API)
- Phase 6: PWA polish, icons, wake lock, keyboard shortcuts
- Phase 7: License gate, anti-debugging, domain lock, obfuscation

### Key Decisions Made
- No Decoy Calculator — app has a Home dashboard instead
- Performance mode = pure black screen, phone always in pocket
- ntfy → watch is the primary output channel; ResultPeek is visual fallback
- Ambiguous: ntfy fires twice (both options, then confirmed); top = earlier date, bottom = later
- Phase indicator has 4 states: ANCHOR → DIFFERENCE → COMPUTED → RESOLVING
