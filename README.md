# Singularis

A professional PWA for performing mentalists. Computes a spectator's date of birth and star sign from two secretly inputted numbers. Results are pushed to the performer's smartwatch via ntfy.sh.

Sold via Gumroad. See `CLAUDE.md` for full technical documentation and `SPEC.md` for the feature specification.

## Quick Start

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values. See `.env.example` for documentation.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run build:prod` | Production build + obfuscation |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint |
| `npx vitest run` | Run engine tests |
