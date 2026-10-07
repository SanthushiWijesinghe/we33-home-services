# HomeServices architecture guide

**Current decision (2026-10-07): Supabase PostgreSQL + Supabase Auth.** The earlier MongoDB plan in the Stage 2 audit is historical; see the revised documents below.

The Stage 2 architecture lives in [02-architecture/ARCHITECTURE.md](02-architecture/ARCHITECTURE.md). The [stack decision](02-architecture/TECH_STACK.md), [database design](02-architecture/DATABASE_DESIGN.md), and [API contract](02-architecture/API_DESIGN.md) explain the shared foundation.

The active mobile entry is `src/app/MemberOneApp.tsx`; the earlier browser demo remains in `src/app/App.jsx` for reference. `android/` is the Capacitor wrapper, `server/` is a TypeScript Express API, and `supabase/migrations/` defines the database rules. Future member work should build inside the domain folders listed in [CONTRIBUTION_MATRIX.md](CONTRIBUTION_MATRIX.md). Keep personal ownership in documentation and actual commits.

Member 3's allocation is proposed because Milestone 02 does not record their interfaces. The team must confirm it before claiming completed work.
