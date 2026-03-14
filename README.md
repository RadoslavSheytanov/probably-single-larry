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

## Quick Review Deploy

If you want to share the app for stakeholder review without wiring up Gumroad yet:

1. Deploy the root Vite app to Vercel
2. Set `VITE_REVIEW_MODE=true` in the Vercel project environment variables
3. Redeploy

That build bypasses the license gate so reviewers can open the app directly. Remove `VITE_REVIEW_MODE` once you are ready to use the real activation flow.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run build:prod` | Production build + obfuscation |
| `npm run typecheck` | TypeScript type check |
| `npm run lint` | ESLint |
| `npx vitest run` | Run engine tests |
