# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Project: Initiative

An AI-powered social impact platform. Users can create real-world initiatives, discover and explore campaigns, volunteer, and support missions through milestone-based funding.

### Features
- Landing page with hero, features section, and CTA
- Initiative feed with search and category filters
- Initiative creation form
- Initiative detail page with milestone progress timeline
- Donor leaderboard per initiative
- Volunteer signup form
- Donation form

## Production Architecture

**Single-server deployment**: In production, the API server (`api-server`) builds and serves both the Express API and the React frontend static files from a single process.

- **Build**: The `api-server` build script (`build.mjs`) first builds the React frontend (`@workspace/initiative`), copies the output to `dist/public/`, then builds the Express server via esbuild.
- **Runtime**: The Express server serves API routes at `/api`, serves static files from `dist/public/`, and falls back to `index.html` for client-side routing.
- **Development**: Two separate services run — Vite dev server for the frontend (HMR) and Express for the API. The proxy routes `/` to Vite and `/api` to Express.
- **Production config**: Only the `api-server` artifact has a production `run` command. The `initiative` artifact is dev-only (no `[services.production]` section).

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (serves frontend in production)
│   └── initiative/         # React + Vite frontend (dev-only, built into api-server for production)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck`.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/initiative` (`@workspace/initiative`)

React + Vite frontend for the Initiative platform.

- Pages: Home (landing), Initiatives (feed), CreateInitiative, InitiativeDetail
- Components: Navbar, ui components (shadcn-style)
- Uses React Query hooks from `@workspace/api-client-react`
- Routing via `wouter`
- Dev-only artifact — in production, its build output is served by the API server

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. In production, also serves the React frontend as static files.

Routes in `src/routes/`:
- `GET /api/initiatives` — list initiatives (with category/status/search filters)
- `POST /api/initiatives` — create initiative (auto-creates default milestones)
- `GET /api/initiatives/:id` — initiative detail with milestones, volunteers, topDonors
- `POST /api/initiatives/:id/volunteer` — volunteer signup
- `POST /api/initiatives/:id/donate` — make donation (updates funding raised + milestone statuses)
- `GET /api/initiatives/:id/leaderboard` — top donors for an initiative

Production build (`build.mjs`):
1. Builds the React frontend via `pnpm --filter @workspace/initiative run build`
2. Copies frontend output to `dist/public/`
3. Bundles the Express server via esbuild to `dist/index.mjs`

### `lib/db` (`@workspace/db`)

Database layer. Schema:
- `initiativesTable` — main initiatives (title, description, category, location, status, fundingGoal, fundingRaised, volunteerCount, creatorName, imageUrl)
- `milestonesTable` — milestones per initiative (title, description, targetAmount, status, order)
- `volunteersTable` — volunteer signups
- `donationsTable` — donation records

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config.

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts package.
