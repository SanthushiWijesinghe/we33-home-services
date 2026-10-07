# HomeServices

WE_33's IT3060 Human Computer Interaction Milestone 03 home services app. The existing React interface follows the Milestone 02 high-fidelity report's cream, orange and dark text design direction. This repository now includes a Capacitor Android project and a shared TypeScript API foundation. Member-owned business features are intentionally reserved for their feature branches.

## Current status

- The React demo supports local provider search/filter, booking, review creation, listing management and role workspaces. It persists selected demo records only in the current browser/WebView.
- A debug Android APK has been built from the Capacitor project. The current demo role switch is **not** authentication or access control.
- The Express server exposes only `/api/health`; MongoDB connection, JWT checking and role middleware are scaffolded. Auth/domain routes and shared persistence are planned for the next stage.
- Requirements, API, database, traceability and ownership are documented under `docs/`. There are no real usability results yet.

## Architecture and technology

React 18 + Vite 6 for the retained interface; TypeScript for new shared client modules; Capacitor 7 for Android; Node.js/Express 5/TypeScript for the REST server; MongoDB Atlas/Mongoose for the planned shared database; JWT and bcrypt password hashing for planned authentication. See [stack decision](docs/02-architecture/TECH_STACK.md), [architecture](docs/02-architecture/ARCHITECTURE.md), [database](docs/02-architecture/DATABASE_DESIGN.md), and [API contract](docs/02-architecture/API_DESIGN.md). Roles are CUSTOMER, SERVICE_PROVIDER and ADMIN; server authorization will enforce them when domain routes are implemented.

## Project structure

```text
src/                         Existing React app, navigation, feature boundaries,
  app/                       shared components/services, config and theme
  features/                  Member-owned feature folders and current demo pages
  navigation/ services/ shared/ theme/ config/
android/                     Generated Capacitor Android project
server/                      Express/TypeScript shell and domain boundaries
docs/01-requirements/        FR1–FR10 and NFR1–NFR8
docs/02-architecture/        Stack, architecture, database and API plans
docs/03-traceability/        Current coverage, owners and planned tests
docs/04-testing/             Test approach; actual results pending
docs/05-members/             Per-member work boundaries
```

## Prerequisites

- Node.js 22 or newer and npm.
- Android Studio 2024.2.1 or newer for Capacitor 7, with Android SDK Platform 35, build tools and a JDK supplied by Studio. This workspace has Studio 2025.1.2, SDK 35/36 and Node 24. Capacitor 8 requires a newer Studio, so do not upgrade packages independently.
- MongoDB Atlas cluster or local MongoDB only when working on data features. Stage 2 can run without a database.

## Frontend setup and run

```sh
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env`. The Vite dev server prints its local URL. If no API is configured, the existing demo screens continue to use localStorage. Production web build: `npm run build`.

## Backend and database setup

```sh
cd server
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, copy with `Copy-Item .env.example .env`. Set a real `MONGODB_URI` and a long random `JWT_SECRET` in `server/.env` when developing authenticated routes. Never commit this file. With no URI, the server starts in foundation mode and `/api/health` reports `database: unavailable`. With a URI, startup attempts an Atlas connection and fails clearly if it cannot connect. The server is not yet a functional booking API. Compile it with `npm run build` inside `server/`.

## Android and Capacitor setup

The Android package includes the built React assets. After changing frontend code:

```sh
npm run android:sync
npx cap open android
```

`npm run android:sync` runs the Vite build and `npx cap sync android`. In Android Studio, select a device or emulator and Run. To build a debug APK from the command line on Windows:

```powershell
$env:JAVA_HOME='C:\Program Files\Android\Android Studio\jbr'
$env:ANDROID_HOME='C:\Users\ASUS\AppData\Local\Android\Sdk'
$env:ANDROID_USER_HOME='D:\hci\WE_33\.android-home'
$env:GRADLE_USER_HOME='D:\hci\WE_33\.gradle-cache'
Set-Location android
.\gradlew.bat assembleDebug
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`. Install with `adb install -r android/app/build/outputs/apk/debug/app-debug.apk` when a device is connected. The debug APK uses a local debug signing key; it is not a release or Play Store artifact. Rebuild after each `cap sync`.

## API URL on Android

Vite embeds `VITE_API_URL` at build time. Set `http://localhost:3000/api` for the desktop browser, `http://10.0.2.2:3000/api` for an Android emulator reaching the development computer, the computer's LAN IP for a physical phone on the same network, or preferably a deployed HTTPS URL. A phone's `localhost` points to the phone. The Android **debug** manifest permits cleartext HTTP for local development; a release build requires HTTPS. A physical phone also needs the server reachable on the LAN and an appropriate firewall rule. `src/services/api/client.ts` is ready for future feature hooks, but the current demo screens do not call the server yet.

## Testing and contribution

Shared checks: `npx tsc --noEmit`, `npm run build`, `npx cap sync android`, Gradle `assembleDebug`, `cd server && npm run build`, and `/api/health`. The [traceability matrix](docs/03-traceability/TRACEABILITY_MATRIX.md) reports current coverage honestly. Member feature branches must add manual functional cases and real evidence; the assignment also requires at least five usability participants.

Ownership and branches are in [CONTRIBUTING.md](CONTRIBUTING.md) and [CONTRIBUTION_MATRIX.md](docs/CONTRIBUTION_MATRIX.md). Member 3's workload is **proposed and requires team confirmation** because the Milestone 02 report does not specify their interfaces. This workspace is not yet a Git repository; the group should initialize and push the foundation before individual feature work. Do not fabricate commit history.

## Known limitations

The existing demo has no real login, shared database, service availability, backend CRUD, real payment gateway or persistent notification inbox. Demo provider names/ratings and verification badges are sample content. The Android launcher icon and splash are still Capacitor defaults. The included APK packages these demo screens, so it is suitable for installation and early interface review but is not the completed Milestone 03 feature submission. Final prototype comparisons, functional results, usability sessions and report evidence remain group work.
