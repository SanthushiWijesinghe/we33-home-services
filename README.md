# HomeService — WE_33

Installable Android home services app for the WE_33 HCI assignment. The active mobile entry implements **Member 1** screens first: splash, onboarding, role selection, email login/signup, customer Home and provider search, provider registration/dashboard, and admin dashboard/verification. The other members' domain folders remain reserved for their own implementation. The legacy Stage 2 demo remains in `src/app/App.jsx` for reference.

## Current status

- React/Vite + Capacitor Android project and Express/TypeScript API are in this repository.
- Member 1 frontend and server code compiles. Supabase Auth and PostgreSQL are the selected backend.
- The SQL migration is **written but not yet applied** to the user's Supabase project. Live accounts, search results and admin decisions require that migration.
- The uploaded composite screenshots guide the current layout. Exact visual matching still needs the promised Figma file or full-resolution assets. Google OAuth and Member 2–4 business flows are not implemented.
- No fake personal contribution commits or usability results are claimed.

## Architecture

```text
src/app/MemberOneApp.tsx       role-aware mobile entry and screen flow
src/features/auth/            Supabase Auth, splash, onboarding, login, signup
src/features/home/            customer home
src/features/discovery/       provider search (Member 2 owns advanced filters)
src/features/providers/       provider detail, registration, dashboard, data access
src/features/admin/           admin dashboard and verification
src/shared/                   shared UI and types
src/services/supabase/        client using publishable key
server/src/modules/           Express REST routes; Member 1 auth/providers/admin implemented
supabase/migrations/          SQL schema, RLS, private document bucket, verification RPC
android/                      Capacitor Android project
docs/                        requirements, architecture, API, traceability, ownership
```

See [architecture](docs/02-architecture/ARCHITECTURE.md), [technology choice](docs/02-architecture/TECH_STACK.md), [database](docs/02-architecture/DATABASE_DESIGN.md), [API](docs/02-architecture/API_DESIGN.md), and [member ownership](docs/CONTRIBUTION_MATRIX.md).

## Prerequisites

Node.js 22+, npm, Android Studio with SDK Platform 35+, and a Supabase project. This repository uses Capacitor 7 because the available Android Studio installation is compatible with it. The Android app requires network access to Supabase.

## Configure Supabase

1. In the Supabase dashboard, open **SQL Editor**. Review and run [`supabase/migrations/20261007_member1_foundation.sql`](supabase/migrations/20261007_member1_foundation.sql) once. It creates `profiles`, `provider_profiles`, `provider_documents`, RLS policies, the private document bucket, and admin verification function. Do not run a migration from an unreviewed source.
2. Copy `.env.example` to `.env` in the repository root. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` using **Connect** or **Project Settings → API Keys**. The publishable key may be shipped in the app; RLS controls data access. Do not put an `sb_secret_...` key, service role key, or database password in any `VITE_` variable.
3. In Supabase **Authentication**, enable email/password sign-in. If email confirmation is enabled, new users must confirm before login. For Android confirmation links, configure an approved mobile redirect/deep link before relying on email links inside the app; this is pending.
4. For a separate admin account, create/sign up the account, then have a trusted project operator set its `profiles.role` to `ADMIN` in the SQL Editor. Public signup can never request ADMIN. Example, after replacing the email deliberately:

   ```sql
   update public.profiles set role = 'ADMIN'
   where id = (select id from auth.users where email = 'admin@example.com');
   ```

5. Providers sign up with the provider role, complete **Provider Registration**, and upload both ID sides. Admin approval requires both documents. Only approved providers appear in customer search.

The migration has not been run by this repository. An empty or unmigrated project will show empty/error states rather than fabricated provider data.

## Run the mobile frontend

```sh
npm install
npm run dev
```

Open the Vite URL shown in the terminal for browser preview. On Windows PowerShell, copy the example with `Copy-Item .env.example .env` if needed. The active entry is `src/app/MemberOneApp.tsx`; the earlier demo is retained but not mounted by default.

## Run the Express API

```sh
cd server
npm install
cp .env.example .env
npm run dev
```

On PowerShell, use `Copy-Item .env.example .env`. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `server/.env`; no service key is needed for the Member 1 routes. `GET /api/health` reports whether configuration exists, **not** whether remote SQL was applied or network connectivity succeeded. Express checks Supabase access tokens and database roles for protected routes. The current mobile Member 1 screens also use Supabase directly with RLS, so the Express server is optional for their preview.

## Build and open Android

```sh
npm run android:sync
npx cap open android
```

The first command runs `npm run build` and `npx cap sync android`. In Android Studio, run the app on an emulator or connected device. To build a debug APK from `android/` on Windows, use `./gradlew.bat assembleDebug`; output is `android/app/build/outputs/apk/debug/app-debug.apk`. Rebuild after each sync. A debug APK is not a release artifact.

Supabase uses its remote HTTPS URL on desktop, emulator and phone. If future features call local Express, use `http://10.0.2.2:3000/api` on an Android emulator, a reachable LAN URL on a physical phone, or deployed HTTPS. The phone's `localhost` is the phone itself.

## Member ownership and Git

Member 1 owns auth, Home, provider search, provider dashboard, admin dashboard and verification. Member 2 owns advanced filters, profile, location, payment display, reviews browsing and feedback. Member 3's categories, availability, booking creation and notifications allocation needs team confirmation. Member 4 owns booking management, status, review submission and support. See individual files in `docs/05-members/` and [CONTRIBUTING.md](CONTRIBUTING.md). Each member should personally implement, commit, push and explain their assigned changes.

## Known limitations

The Member 1 screens are based on low-resolution composite screenshots; a pixel-exact asset/spacing pass awaits the Figma source. Home search is backed by approved `provider_profiles`; service-specific catalog, availability, bookings, payments, detailed filters and notifications belong to later member integrations. The Android launcher and native splash use a HomeService vector mark; their final visual treatment also awaits the Figma source. No live database migration, Google OAuth setup, usability session or end-to-end booking result is claimed.
