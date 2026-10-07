# HomeService — WE_33

Installable Android home services app for the WE_33 HCI assignment. The active mobile entry includes Member 1 account/provider/admin flows, Member 2 customer preferences, and Member 3 service, availability, booking creation and notification flows. The legacy Stage 2 demo remains in `src/app/App.jsx` for reference.

## Current status

- React/Vite + Capacitor Android project and Express/TypeScript API are in this repository.
- Member 1 frontend and server code compiles. Supabase Auth and PostgreSQL are the selected backend.
- The Member 1, 2 and 3 SQL migrations are in `supabase/migrations/`. Apply them in order to the target Supabase project before using the corresponding live screens.
- The uploaded composite screenshots guide the current layout. Exact visual matching still needs the promised Figma file or full-resolution assets. Google OAuth and Member 4's booking follow-through remain separate work.
- No fake personal contribution commits or usability results are claimed.

## Architecture

```text
src/app/MemberOneApp.tsx       role-aware mobile entry and screen flow
src/features/auth/            Supabase Auth, splash, onboarding, login, signup
src/features/home/            customer home
src/features/discovery/       provider search (Member 2 owns advanced filters)
src/features/providers/       provider detail, registration, dashboard, data access
src/features/admin/           admin dashboard and verification
src/features/member2/         customer preferences and feedback
src/features/member3/         categories, services, availability, booking creation, inbox
src/shared/                   shared UI and types
src/services/supabase/        client using publishable key
server/src/modules/           Express REST routes; Member 1 auth/providers/admin implemented
supabase/migrations/          SQL schema, RLS and member-specific RPCs
android/                      Capacitor Android project
docs/                        requirements, architecture, API, traceability, ownership
```

See [architecture](docs/02-architecture/ARCHITECTURE.md), [technology choice](docs/02-architecture/TECH_STACK.md), [database](docs/02-architecture/DATABASE_DESIGN.md), [API](docs/02-architecture/API_DESIGN.md), and [member ownership](docs/CONTRIBUTION_MATRIX.md).

## Prerequisites

Node.js 22+, npm, Android Studio with SDK Platform 35+, and a Supabase project. This repository uses Capacitor 7 because the available Android Studio installation is compatible with it. The Android app requires network access to Supabase.

## Configure Supabase

1. In the Supabase dashboard, open **SQL Editor**. Review and run [`supabase/migrations/20261007_member1_foundation.sql`](supabase/migrations/20261007_member1_foundation.sql). It creates `profiles`, `provider_profiles`, `provider_documents`, RLS policies, the private document bucket, and admin verification function. It also adds profiles for users who signed up before the trigger existed, without changing existing roles. If you ran an earlier copy of this migration before signing up, run the updated file again so that backfill executes.
2. Copy `.env.example` to `.env` in the repository root. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` using **Connect** or **Project Settings → API Keys**. The publishable key may be shipped in the app; RLS controls data access. Do not put an `sb_secret_...` key, service role key, or database password in any `VITE_` variable.
3. In Supabase **Authentication**, enable email/password sign-in. If email confirmation is enabled, configure the callback URLs below before registering new accounts.
4. For a separate admin account, create/sign up the account, then have a trusted project operator set its `profiles.role` to `ADMIN` in the SQL Editor. Public signup can never request ADMIN. Example, after replacing the email deliberately:

   ```sql
   update public.profiles set role = 'ADMIN'
   where id = (select id from auth.users where email = 'admin@example.com');
   ```

5. Providers sign up with the provider role, complete **Provider Registration**, and upload both ID sides. Admin approval requires both documents. Only approved providers appear in customer search.

Apply the Member 2 and Member 3 migrations after Member 1 to enable their tables. The repository cannot apply remote SQL just by building the app. An unmigrated project will show an error state rather than fabricated data.

### Email confirmation callbacks

In Supabase **Authentication → URL Configuration**, set the **Site URL** to your running or deployed web app URL. For the local Vite preview, use `http://localhost:5173`. Add these exact **Redirect URLs**:

```text
lk.we33.homeservices://auth/callback
http://localhost:5173/auth/callback
http://127.0.0.1:5173/auth/callback
```

The Android signup flow sends the first URL with `emailRedirectTo`; the browser preview uses its own origin and `/auth/callback`. Android handles both a link that opens the running app and one that starts it from closed. Keep the default confirmation email link using `{{ .ConfirmationURL }}` if you edit Supabase email templates. Rebuild and reinstall the Android APK after changes to the native intent filter.

Open a new Android confirmation email on the emulator or phone to return directly to the app. If you confirm from desktop email instead, return to the Android app and sign in with your password. A confirmation email sent before these settings were changed may still point to the old `localhost:3000` address; clicking it can confirm the account even though that final page does not load. Never share a callback URL containing session tokens.

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

Member 1 owns auth, Home, provider search, provider dashboard, admin dashboard and verification. Member 2 owns advanced filters, profile, location, payment display, reviews browsing and feedback. Member 3's proposed categories, availability, booking creation and notifications scope is implemented in the `kosala` checkout; original-report allocation and personal attribution still need team confirmation. Member 4 owns booking management, status, review submission and support. See individual files in `docs/05-members/` and [CONTRIBUTING.md](CONTRIBUTING.md).

## Known limitations

The Member 1 screens are based on low-resolution composite screenshots; a pixel-exact asset/spacing pass awaits the Figma source. Home search is backed by approved `provider_profiles`; Member 3's service catalog, availability, booking creation and notifications require its remote SQL migration. Member 4's booking management and status flow is not complete. The Android launcher and native splash use a HomeService vector mark; their final visual treatment also awaits the Figma source. No live Member 3 booking result, Google OAuth setup or usability session is claimed here.
