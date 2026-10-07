# Technology stack decision

Decision date: 5 October 2026. Stage: common foundation. The [project audit](../PROJECT_AUDIT.md) records the existing implementation and gaps.

| Layer | Choice | Why it fits WE_33 | Current status |
| --- | --- | --- | --- |
| Mobile UI | React 18, Vite 6, JavaScript screens with TypeScript for new shared modules | Preserves the working Milestone 02 inspired UI, keeps member modules independent, and allows gradual type adoption | Existing app builds; feature screens remain JavaScript |
| Android runtime | Capacitor 7 | Packages the built web assets as an installable Android app, supplies device integration and Back handling, and works with the installed Android Studio 2025.1.2 | Android project generated; debug build verification recorded in README |
| Backend | Node.js, Express 5, TypeScript | A small REST server with middleware for validation, errors and role checks; JavaScript knowledge transfers from the UI | Foundation and health route only |
| Database | MongoDB Atlas, Mongoose 8 | Flexible document models for providers, services, bookings and reviews; Mongoose schema/index support | Connection infrastructure only; no credentials or domain models yet |
| Authentication | JWT, bcrypt password hashes, server-side role checks | Stateless mobile API sessions and explicit access checks for CUSTOMER, SERVICE_PROVIDER and ADMIN | JWT verification middleware skeleton; login/registration and hashing belong to the feature stage |
| API | JSON REST under `/api` | Clear contracts, HTTP status codes and ownership boundaries | Designed; `/api/health` implemented |
| Testing | TypeScript compilation, Vite/Gradle builds; later Vitest and Jest/Supertest | Build checks protect the shared foundation; feature owners add behavior tests and manual evidence | No feature tests yet |

Reusing React reduces the risk of rebuilding many screens from the embedded high-fidelity screenshots. Capacitor ships a native Android project containing the app's built assets, so a successful Gradle output is an installable APK even though the UI renders in Android WebView. A browser preview alone does not meet the installable deliverable.

Limitations: the current UI still uses browser localStorage and a demo role switch. The backend has no member-owned routes yet. A real Atlas connection needs an approved URI and network access. Android WebView performance and native controls differ from React Native, so the group must verify touch targets, safe areas, Back navigation and device usability. A deployed HTTPS API is preferred; local emulator/phone HTTP setup needs explicit development-only network configuration.

Capacitor 7 is pinned because the installed Android Studio is 2025.1.2; [Capacitor's environment guide](https://capacitorjs.com/docs/getting-started/environment-setup) requires Studio 2025.2.1 for version 8. Android API 35 and 36 SDKs are installed. Before a future Capacitor major upgrade, update Android Studio and follow the [official upgrade guide](https://capacitorjs.com/docs/updating/8-0).
