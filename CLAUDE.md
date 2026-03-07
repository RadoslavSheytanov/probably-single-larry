# CLAUDE.md — Singularis PWA

## Project Overview
Singularis is a professional-grade Progressive Web App for performing mentalists. It computes a spectator's date of birth and star sign from two secretly inputted numbers. The app disguises itself as an iOS calculator. It runs entirely client-side with zero backend, works offline, and pushes results to the performer's smartwatch via ntfy.sh.

## Tech Stack
- React 18 + TypeScript
- Vite 5 (build tool, dev server, PWA plugin)
- Tailwind CSS 3 (utility-first styling)
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
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── index.html
├── public/
│   ├── manifest.json
│   └── icons/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── state/
    │   └── store.ts              # Zustand store, single source of truth
    ├── engine/
    │   ├── singularis.ts          # Core formula (obfuscated in prod)
    │   ├── starsigns.ts           # Zodiac lookup table
    │   └── engine.test.ts         # Unit tests for the formula
    ├── screens/
    │   ├── DecoyCalculator.tsx     # Fake calculator screen
    │   ├── StealthInput.tsx        # Black screen with invisible zones
    │   ├── ResultPeek.tsx          # Star sign + DOB reveal
    │   ├── Settings.tsx
    │   ├── History.tsx
    │   └── PracticeMode.tsx
    ├── components/
    │   ├── CalcButton.tsx
    │   ├── WatchPreview.tsx        # Simulated watch notification
    │   ├── PhaseIndicator.tsx      # Three dots showing input phase
    │   ├── AmbiguousResolver.tsx   # Two-option date picker
    │   └── LicenseGate.tsx         # License key activation screen
    ├── services/
    │   ├── ntfy.ts                # Push notification to ntfy.sh
    │   ├── ics.ts                 # Calendar file generation
    │   ├── haptics.ts             # Vibration patterns
    │   ├── speech.ts              # Web Speech API voice input
    │   ├── wakeLock.ts            # Screen wake lock
    │   └── license.ts             # License key validation
    ├── hooks/
    │   ├── useStealthInput.ts     # Touch zone + gesture logic
    │   ├── useTapActivation.ts    # 5-tap decoy activation
    │   └── useVoiceCapture.ts     # Speech recognition hook
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
- STEALTH: App looks like an iOS calculator. No branding visible.
- BLACK: Pure #000000 backgrounds. Minimal, near-invisible UI.
- PROFESSIONAL: This is a working tool for paid performers.
- OFFLINE-FIRST: Full functionality without internet (except ntfy push).
- ZERO COGNITIVE LOAD: Performer inputs numbers blind, phone in pocket.

## Critical Rules
- NEVER add console.log in committed code
- NEVER use localStorage for anything except the license key
- ALWAYS validate computed dates before rendering
- NEVER expose the formula in readable source — wrap in obfuscated IIFE for prod
- Tab title and PWA name MUST say "Calculator"
- All touch handlers MUST call e.preventDefault() to block browser defaults
- Test every change against the reference case: A=24, D=10 → July 17, Cancer ♋
