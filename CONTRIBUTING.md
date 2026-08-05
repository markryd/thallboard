# Contributing to Thallboard

Thanks for helping improve Thallboard. This is a static SPA (no backend, no accounts). Presets and session state live in the browser’s `localStorage`.

## Prerequisites

- [Bun](https://bun.sh) **1.3.12** (pinned in `package.json` via `packageManager`)

## Setup

```bash
bun install
bun dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## Quality checks

Run these before opening a PR:

```bash
bun run ci      # Biome lint + format (read-only; matches CI)
bun test        # unit tests
bun run build   # TypeScript + Vite production build
```

To auto-fix lint/format locally: `bun run check`.

## Pull requests

- Keep changes focused and easy to review.
- Ensure CI is green (`biome ci`, `bun test`, `bun run build`).
- [Biome](https://biomejs.dev) is the source of truth for formatting and linting — don’t fight the formatter.
- Don’t commit secrets, credentials, or personal machine paths.
- Prefer small PRs; note UI-facing changes in the PR description so reviewers know what to click through.

## Project notes

- Stack: Bun · Vite · React · TypeScript · Tailwind CSS · shadcn/ui · Biome
- Music/theory logic lives under `src/lib/music/`; presets under `src/lib/presets/`
- Prefer tests for theory and preset serialization changes

## Deploy

Production is served at [thallboard.com](https://thallboard.com) via GitHub Pages (Actions workflow on `main`). Custom domain DNS and **Settings → Pages → Source: GitHub Actions** are one-time repo/DNS setup.
