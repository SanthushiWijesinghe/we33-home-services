# Stage 2 test foundation

Feature owners will add actual functional cases, success/failure results and evidence in Stage 3. The existing [test template](../TEST_TRACEABILITY.md) is a draft. No usability result or participant is claimed in this file.

Shared build gates: frontend TypeScript check, Vite production build, Capacitor sync, Gradle debug build, server TypeScript build, and server health response. Feature gates will include registration/login, role denial, service and availability CRUD, booking conflicts/status, review ownership and notification state. Record real devices, Android version, screen size, API environment, result, evidence and issue IDs.

Usability sessions must include at least five real or proxy users and the Milestone 02 tasks: provider search/filter/booking, provider details/reviews, service category/details/pricing, booking details/status, and provider availability/calendar. Record observations rather than inventing outcomes.

## Stage 2 checks completed on 2026-10-05

| Check | Actual result | Evidence or limit |
| --- | --- | --- |
| Frontend TypeScript and Vite build | Passed | `npx tsc --noEmit`; `npm run android:sync` completed Vite build and Capacitor copy |
| Server TypeScript build | Passed | `npm run build` in `server/` |
| Server health | Responded | `GET /api/health` returned `{"status":"ok","database":"unavailable"}` with no MongoDB URI configured |
| Android debug package | Passed | Gradle `assembleDebug`; APK installed and launched on Pixel 6 API 36 emulator |
| Mobile screen | Home and Search rendered | [Home](android-stage2-home.png), [Search](android-stage2-search.png) emulator captures |
| Android Back | Search returned to Home | [Back result](android-stage2-back.png) emulator capture |

These checks cover the shared foundation and existing demo screens. They do not validate future authenticated or database backed features.

## Member 1 Android build check

The Member 1 frontend and Express server compiled. The Capacitor Android debug APK built and installed on a Pixel 6 API 36 emulator. The native splash, onboarding, role selection, and login screens opened, and the Android status bar icons were legible after the theme update. Captures: [Native splash](member1-native-splash.png), [Onboarding](member1-onboarding.png), [Role selection](member1-role.png), and [Login](member1-login.png).

This visual check does not establish that Supabase registration, provider approval, search, or admin actions work against the remote project. The SQL migration has not yet been applied there, and the Figma source is still needed for an exact visual comparison.
