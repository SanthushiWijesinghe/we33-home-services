# Mobile application architecture

```text
Capacitor Android shell
  └─ React app entry and navigation
      ├─ Member 1: auth, home, discovery, provider, admin
      ├─ Member 2: profile, location, payments display, feedback, filters
      ├─ Member 3: services, availability, booking creation, notifications (proposed)
      └─ Member 4: bookings, status, reviews, support
          ├─ Supabase Auth (session and user identity)
          ├─ Supabase Data API + RLS (owner-scoped CRUD)
          └─ Express REST API (multi-step workflows and integration)
                 └─ Supabase PostgreSQL
```

## Repository boundaries

- `src/app/MemberOneApp.tsx`: current mobile entry and role-aware screen orchestration. It uses `AuthProvider`; it does not grant database privileges.
- `src/features/<domain>/`: screen, component, hook, service and types owned by the feature member. Avoid member-named code folders.
- `src/shared/`, `src/navigation/`, `src/services/`, `src/theme/`, `src/config/`: shared client infrastructure.
- `server/src/modules/<domain>/`: Express routes/controllers/services for custom workflows. The Member 1 routes under `auth`, `providers` and `admin` are implemented.
- `supabase/migrations/`: versioned PostgreSQL schema, grants, RLS policies, storage policies and trusted functions. Member 1's migration must be applied before live screens work.
- `android/`: generated Capacitor project. Web changes require `npm run android:sync` before an APK rebuild.

## Identity and authorization

1. The app signs up or signs in using Supabase Auth. Public signup metadata permits CUSTOMER or SERVICE_PROVIDER only.
2. A trusted database trigger creates `public.profiles`. ADMIN is never assigned from public signup.
3. The app reads its own `profiles` row to route to the correct workspace.
4. Every data table has explicit grants and RLS. Admin verification uses the `review_provider` database function, which checks `public.is_admin()` inside PostgreSQL.
5. Express checks the Supabase access token through Auth, reads the current role from `profiles`, and applies role middleware. Client routing is presentation, not authorization.

The Supabase publishable key can be bundled in Android. A database password or Supabase secret key must only live in a trusted server environment and is not required for the current Member 1 mobile flows.

## Data and cross-member contracts

Use UUIDs from Supabase Auth/PostgreSQL for primary keys. Use ISO 8601 timestamps in API payloads, UTC storage for availability, and integer LKR amounts for displayed prices. The current provider profile stores a starting price in LKR; Member 3's Service model can later hold service-specific prices. Bookings must reserve slots transactionally and store price/address snapshots. Member 4 owns booking status and review writes.

Current shared UI states are loading, error and empty. No fake provider data is returned when Supabase is empty. The previous browser demo remains in `src/app/App.jsx` and `src/features/pages/` as reference, but is not the active mobile entry.

## Environment and release

Root `.env`: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; optional `VITE_API_URL`. Server `.env`: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `PORT`, `WEB_ORIGIN`. Only the publishable key enters the client. For a local Express API, Android emulator uses `10.0.2.2`; a physical phone uses the computer's reachable LAN address or deployed HTTPS API. Supabase itself is remote and does not use the emulator's `localhost`.

Build gates: TypeScript check, Vite build, server compile, Capacitor sync and Android debug build. A successful compile does not prove the Supabase migration was applied or that every screen matches the source design.
