# Technology stack decision — Supabase revision

Decision date: 2026-10-07. The project owner chose Supabase after the Stage 2 MongoDB proposal. This revision applies to new work; the Stage 2 audit remains a historical snapshot.

| Layer | Choice | Reason |
| --- | --- | --- |
| Android app | Existing React 18, Vite 6 and Capacitor 7 | Reuses the mobile prototype and generated Android project. Capacitor packages the built web assets as an installable Android application. |
| New frontend modules | TypeScript/TSX and feature folders | Clear contracts for four members without rewriting legacy demo code. |
| Authentication | Supabase Auth | Handles email/password sessions and token refresh. Public registration can create CUSTOMER or SERVICE_PROVIDER accounts; admin promotion is trusted-only. No separate password database or second JWT system. |
| Database | Supabase PostgreSQL | Foreign keys and constrained records fit users, provider approvals, services, slots and bookings. SQL migrations provide a reviewable team contract. |
| Authorization | Supabase Row Level Security plus server role checks | The mobile publishable key is public. RLS enforces row access; Express verifies the access token and rechecks the account role for API routes. |
| Backend API | Existing Node.js/Express/TypeScript | Keeps custom workflows and stable REST endpoints for booking conflict rules, admin operations and future integrations. Member 1 routes are implemented; other member routes remain planned. |

## Why the existing app remains

The assignment already has a React UI and an Android wrapper. Rewriting in a different mobile framework would discard working screens, introduce a second component system and increase integration work. The new Member 1 app entry is isolated in `src/app/MemberOneApp.tsx`; the Stage 2 demo remains in `src/app/App.jsx` for reference and later extraction by the assigned owners.

## Limits and constraints

- Supabase requires a network connection. Offline write support is not included.
- Supabase Auth email confirmation and Google OAuth require dashboard configuration and mobile deep linking. Email/password is implemented; Google OAuth is pending setup.
- A publishable key is safe in the Android bundle only when table grants and RLS policies are correct. Secret keys and database passwords never enter `VITE_` variables or source control.
- The provided composite screenshots are too small for pixel-exact asset and typography matching. A Figma file or full-resolution exports are needed for the final visual pass.
- Member 2–4 business flows and complete usability evidence remain their own work.

## Installable Android application

`npm run build` creates `dist/`; `npx cap sync android` copies it into the native project. Android Studio or Gradle builds an APK. The UI, navigation and Auth session run inside Android's WebView. A local Express URL is optional for the current Member 1 screens because they use Supabase Auth and RLS directly; future complex operations can call the Express API.
