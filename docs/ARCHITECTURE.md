# HomeServices architecture guide

The Stage 2 architecture lives in [02-architecture/ARCHITECTURE.md](02-architecture/ARCHITECTURE.md). The [stack decision](02-architecture/TECH_STACK.md), [database design](02-architecture/DATABASE_DESIGN.md), and [API contract](02-architecture/API_DESIGN.md) explain the shared foundation.

The current React demo remains in `src/`. `android/` is the Capacitor Android wrapper; `server/` is a separate TypeScript Express foundation. Future member work should extract screens from the current shared `src/features/pages/Pages.jsx` and `Dialogs.jsx` into the feature folders listed in [CONTRIBUTION_MATRIX.md](CONTRIBUTION_MATRIX.md), then connect to the central API client. Keep the source organized by feature, with personal ownership recorded in documentation and actual commits.

Member 3's allocation is proposed because Milestone 02 does not record their interfaces. The team must confirm it before claiming completed work.
