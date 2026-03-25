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

An AI-powered social impact execution platform. Users describe an idea and AI generates a structured initiative with milestones, budget, and volunteer roles. Initiatives earn trust scores through updates, milestones, and community engagement.

### Features
- AI Initiative Builder: describe an idea, get a structured plan with milestones, budget, and roles
- Milestone-Based Funding: locked/unlocked visual funding per milestone with progress bars
- Impact Trust Score: GitHub-style scoring based on updates, milestones, volunteers, and funding
- Impact Proof Feed: timeline of initiative updates with evidence of progress
- AI Volunteer Matching: suggested volunteers with skill-based matching and explanations
- Initiative Lifecycle: visual stage tracker (Idea → Planning → Active → Impact Delivered)
- Landing page with hero, 6 feature cards, and CTA
- Initiative feed with search, category filters, trust scores, and lifecycle badges
- Initiative detail page with structured plan, milestones, updates, volunteer suggestions
- Donor leaderboard, volunteer signup, donation forms

### Key Services
- `artifacts/api-server/src/services/aiService.ts` — mock AI plan generator (deterministic, LLM-ready)
- `artifacts/api-server/src/services/trustScoreService.ts` — trust score calculator (max 100)
- `artifacts/api-server/src/services/volunteerMatchService.ts` — mock volunteer matching engine

### Trust Score Formula
- Updates posted: up to 25 points (5 per update)
- Milestones completed: up to 30 points (proportional)
- Volunteers joined: up to 20 points (4 per volunteer)
- Funding progress: up to 25 points (proportional)
- Total: 100 points maximum

## Production Architecture

**Two-artifact deployment**: In production, the frontend and API are served as separate artifact services.

- **Frontend** (`initiative`): Built with Vite, served as static files (`serve = "static"`) at `/`. The deployment proxy handles SPA routing.
- **API** (`api-server`): Express server bundled with esbuild, served at `/api`. Handles all backend routes.
- **Development**: Two separate dev servers — Vite dev server for the frontend (HMR) and Express for the API. The proxy routes `/` to Vite and `/api` to Express.

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (serves frontend in production)
│   │   └── src/
│   │       ├── routes/     # API routes (initiatives, ai, health)
│   │       └── services/   # Business logic (aiService, trustScoreService, volunteerMatchService)
│   └── initiative/         # React + Vite frontend (dev-only)
│       └── src/
│           ├── pages/      # Home, Initiatives, CreateInitiative, InitiativeDetail
│           └── components/ # TrustScoreBadge, LifecycleBadge, layout/, ui/
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (seed-initiatives.ts)
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
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

- Pages: Home (landing), Initiatives (feed), CreateInitiative (AI + manual), InitiativeDetail
- Components: Navbar, TrustScoreBadge, TrustBreakdown, LifecycleBadge, LifecycleTracker, ui/ (shadcn-style)
- Uses React Query hooks from `@workspace/api-client-react`
- Routing via `wouter`
- Dev-only artifact — in production, its build output is served by the API server

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. In production, also serves the React frontend as static files.

Routes in `src/routes/`:
- `GET /api/initiatives` — list initiatives (with filters, includes trustScore and lifecycleStage)
- `POST /api/initiatives` — create initiative (supports structuredPlan from AI generation)
- `GET /api/initiatives/:id` — initiative detail with milestones, volunteers, topDonors, updates
- `POST /api/initiatives/:id/volunteer` — volunteer signup (with skills field)
- `POST /api/initiatives/:id/donate` — make donation (updates funding + milestone statuses)
- `GET /api/initiatives/:id/leaderboard` — top donors
- `GET /api/initiatives/:id/updates` — get updates timeline
- `POST /api/initiatives/:id/updates` — post new update
- `GET /api/initiatives/:id/suggested-volunteers` — AI volunteer match suggestions
- `POST /api/ai/generate-plan` — AI-generate structured initiative plan from description

### `lib/db` (`@workspace/db`)

Database layer. Schema:
- `initiativesTable` — main initiatives (+ lifecycleStage enum, structuredPlan jsonb)
- `milestonesTable` — milestones per initiative (+ fundsLocked)
- `volunteersTable` — volunteer signups (+ skills, matchedScore)
- `donationsTable` — donation records
- `updatesTable` — initiative update posts (title, content, imageUrl, createdAt)

Enums: initiative_status (active/completed/paused), milestone_status (pending/active/completed), lifecycle_stage (idea/planning/active/impact_delivered)

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config.

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `scripts` (`@workspace/scripts`)

Utility scripts. Run seed: `pnpm --filter @workspace/scripts exec tsx src/seed-initiatives.ts`
