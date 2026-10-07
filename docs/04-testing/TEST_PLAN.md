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
