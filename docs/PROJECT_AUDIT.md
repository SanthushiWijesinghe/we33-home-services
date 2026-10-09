# WE_33 HomeServices project audit

Audit date: 5 October 2026. Sources: `Assignment 3.pdf`, `HCI assignment 02_WE_33.docx`, the current workspace, and the existing README and architecture notes. The separate `PropWise_AI_Final_Group_Technical_Report_FINAL.docx` is not a HomeServices implementation source.

## Current architecture detected

| Area | Finding |
| --- | --- |
| Frontend | React 18, JavaScript/JSX, Vite 6, Lucide icons, and one global CSS file. This is a responsive browser application. |
| Mobile delivery | No Android/iOS project, React Native/Expo project, Capacitor configuration, APK, or mobile build script exists. |
| Backend/API | None. There are no HTTP clients, API routes, controllers, or server package. |
| Database | None. Providers, bookings, and reviews use browser `localStorage`; seed records are in `src/data/seed.js`. Data is limited to one browser installation. |
| Authentication | None. No registration, login, password handling, or session persistence. |
| Roles | A Customer / Service provider / Admin switch in `src/app/App.jsx` changes the visible workspace. It does not authorize access to data or actions. |
| Navigation | Conditional `view` state in `src/app/App.jsx`, a desktop header, a mobile bottom bar, and modals. No route history, deep links, or Android back integration. |
| Existing screens | Customer home, search/results/filter, provider details, booking flow, payment choice, booking list/details, customer profile, feedback, support FAQ, provider dashboard/listing form, and admin dashboard/verification. |
| Existing CRUD | Local create/read/update/delete for provider listings; create/read/status update/remove for bookings; create/read for reviews; profile fields update only in memory; provider verification update. |
| Tests | No automated test files or test scripts. `docs/TEST_TRACEABILITY.md` is a template with results unfilled. |
| Documentation | README, architecture overview, ownership notes, prototype deviation template, milestone notes, and test traceability template. No final measured test results or installable build instructions. |
| Dependencies | `package.json` lists React, React DOM, Lucide, Vite, and the React Vite plugin. Prior production builds passed. No dependency defect was identified in the audit. |

## Missing or incomplete screens and behavior

- Auth: splash, registration, login, account recovery, secure session, and role-aware entry are absent.
- Customer: dedicated service details, availability calendar, editable booking, saved locations, payment method management, persistent feedback, notifications, and review edit/delete are absent. The payment choice screen is a mock and does not charge money.
- Provider: editable provider profile, availability CRUD/calendar, request acceptance for newly created bookings, booking history and review management need completion. Newly created bookings are currently marked Confirmed immediately.
- Admin: category management, issue reports, feedback review, review moderation, and meaningful monitoring are absent.
- Existing visible actions that need implementation review: the provider card's Save button only changes its own DOM; the provider dashboard's View my profile dispatches an event without a listener; support contact shows a toast without creating a support request; notification icon shows a toast without a notification inbox. The customer profile's name/location live in component state and are lost after refresh.
- Prototype fidelity: embedded Milestone 02 screenshots show customer discovery and booking/payment flows with cream, orange, and dark text. The exact Figma frames have not been compared screen by screen with the current implementation. `docs/PROTOTYPE_DEVIATIONS.md` remains a draft.

## Requirements from Milestone 02

| ID | Requirement | Current coverage | Gap |
| --- | --- | --- | --- |
| FR1 | User registration and authentication | None | Registration, login, session, role authorization |
| FR2 | Profile creation and management | Customer form, provider listing data | Persistent customer/provider profiles and validated updates |
| FR3 | Service search and filtering | Search, categories, sort, price/rating filters | Connect to shared data/API and handle loading/errors |
| FR4 | Service provider verification | Admin local toggle | Verified evidence and admin authorization |
| FR5 | Service availability and booking | Date/time picker and local booking | Availability CRUD, conflicts, provider acceptance, booking edits |
| FR6 | Service category and service management | Seed categories, provider listing CRUD | Category CRUD and distinct service details |
| FR7 | Booking management and status | Read, cancel, remove, status update | Business rules, shared role access, complete status transitions |
| FR8 | Ratings and reviews | Create/read a review for completed booking | Edit/delete own review, shared persistence, moderation |
| FR9 | Booking history | Past bookings list and removal | Shared persistence and accurate historical states |
| FR10 | Notifications | Notification icon and toast | Persistent inbox and relevant event notifications |

## Nonfunctional requirements to preserve

| ID | Quality | Implementation implication |
| --- | --- | --- |
| NFR1 | Usability | Clear mobile navigation, labels, feedback, and short booking flow |
| NFR2 | Performance | Efficient search and focused, responsive screens |
| NFR3 | Security and privacy | Password hashing, server-side authorization, minimal exposure of personal data |
| NFR4 | Reliability and availability | Loading, errors, retry paths, and booking conflict handling |
| NFR5 | Scalability | Reusable feature modules and a database-backed API |
| NFR6 | Compatibility | Mobile layouts and a tested Android build; browser compatibility where retained |
| NFR7 | Maintainability | Shared theme/components and small feature-owned modules |
| NFR8 | Trust and transparency | Accurate provider verification, visible pricing, ratings and reviews |

## Assignment 3 obligations

Milestone 03 calls for a working installable/runnable mobile app aligned with the high-fidelity prototype; at least two working CRUD operations per assigned interface; functional cases and a requirement-to-test traceability matrix; at least five real or proxy usability participants; a version-controlled repository and clear README; a consolidated report; and an individual viva. The current browser app and unfilled templates do not yet satisfy those deliverables.

## Code and structure findings

- `src/app/App.jsx` holds navigation, all role state, persistence, booking/provider/review mutations, and modal wiring. It is too large for independent member ownership.
- `src/features/pages/Pages.jsx` and `Dialogs.jsx` combine multiple members' screens. Feature boundaries exist in names but are not yet isolated by module.
- `src/data/index.js` merely re-exports seed values and has no meaningful consumer in the current app.
- Prices, dates, the sample customer identity, dashboard copy, and location are hard-coded for the demo. The booking date minimum is fixed to October 2026 and will become stale.
- Local role switching and client-side verification are unsuitable security controls. Demo names/ratings must remain labeled as sample content.
- The current project has no Git metadata in this workspace. Create a real repository before team contributions, without inventing historical commits.

## Recommended architecture

Preserve the working React interface and package it as an Android application with Capacitor, then extract screens into feature-owned modules. This yields an installable Android client while retaining the existing prototype work. Add a TypeScript Node/Express REST API with validation, JWT sessions, bcrypt password hashing, and role checks. Use MongoDB/Mongoose as the shared store only after local or Atlas connection details are configured. The mobile client should call a centralized API service; screens should not contain data access or business rules. Payment methods should store safe display metadata only; no card credentials.

React Native/Expo would require rebuilding every existing screen. It is a reasonable alternative only if the group specifically requires native React Native components. The assignment permits stack choice and asks for justification, so a Capacitor approach is viable for the current codebase. Backend and mobile development can proceed independently after the API contract is written.

## Proposed final folders

```text
android/                         Capacitor-generated Android project
src/
  app/                           Navigation, session provider, composition
  features/
    auth/ home/ discovery/ services/ provider/ admin/
    profile/ availability/ bookings/ payments/ reviews/
    feedback/ support/ notifications/
  shared/                        Components, hooks, constants, helpers
  services/                      API client and platform adapters
  theme/                         Colors, spacing, typography
  types/                         Shared client types
server/
  src/config/ src/middleware/ src/modules/ src/routes/
  tests/ seed/ .env.example package.json
docs/
  01-requirements/ 02-architecture/ 03-traceability/
  04-testing/ 05-members/
```

The existing `src/` stays at the repository root to avoid a disruptive move. This is equivalent to the pasted brief's `mobile/src/` boundary; the Android project lives beside it. Add feature folders as behavior is extracted rather than creating empty directories.

## Member ownership proposal

| Member | Ownership | Status |
| --- | --- | --- |
| 1 | Auth, splash/login/signup, home, provider/admin dashboards, provider search, related API | Based on Milestone 02 workload |
| 2 | Filters, customer profile/location, safe payment options, review browsing, feedback | Based on Milestone 02 workload |
| 3 | Categories, service details, availability/calendar, booking creation, notifications | **Proposed**: Milestone 02 did not assign this member clear interfaces |
| 4 | My bookings/details/status/history, review submission, help/support | Based on Milestone 02 workload |

### Member 3 workload clarification required

The Milestone 02 workload table leaves Member 3's module/interface allocation blank. The proposed scope above must be agreed by the four members and reflected in the final report and contribution matrix. Do not claim it as the original allocation.

## Implementation order

1. Freeze the audit and write architecture, database and API contracts.
2. Generate the Android project from the existing React app and verify an installable debug APK.
3. Extract feature modules and shared theme while preserving working flows.
4. Build auth and the backend data model/API; connect the mobile client incrementally.
5. Complete availability, booking, review, profile, feedback, payment representation and admin CRUD.
6. Add meaningful API and app checks, run manual functional cases, compare prototype frames, conduct five usability sessions, and record actual results.

## Risks and ambiguities

- The exact Figma frame-by-frame design context is referenced by the report but not available as exported source screens in the workspace; embedded screenshots are lower resolution.
- Member 3's workload needs group agreement.
- MongoDB connection credentials and any production backend host are unavailable. Environment examples can be added, but a real shared database cannot be verified without them.
- The repository is not initialized with Git here, so branch and PR evidence will come from the group's real repository.
- Usability participants, their observations, and final report evidence must be supplied by actual group work; they cannot be inferred from code.
