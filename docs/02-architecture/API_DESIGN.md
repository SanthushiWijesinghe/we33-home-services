# API design — Supabase and Express

The mobile app uses Supabase Auth and RLS-protected data access for Member 1's current screens. Express under `/api` provides equivalent custom REST entry points for integration and future multi-step workflows. **Implemented** means code exists in this repository; the Supabase SQL migration still must be applied remotely before live data calls can work.

| Method | Endpoint / operation | Purpose | Role | Request → response | Requirement | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SDK | `auth.signUp` | Register customer/provider with platform callback URL | Public | name, email, password, role → user/confirmation | FR1 | M1 | Implemented in mobile; allow list required |
| SDK | `auth.setSession` / `auth.exchangeCodeForSession` | Complete Android email callback | Public | deep-link tokens or code → session | FR1 | M1 | Implemented in mobile; allow list required |
| SDK | `auth.signInWithPassword` | Sign in | Public | email, password → session | FR1 | M1 | Implemented in mobile |
| SDK | `auth.signOut` | End session | Signed in | — → success | FR1 | M1 | Implemented in mobile |
| GET | `/api/health` | API configuration state | Public | — → status/database configured | NFR | Shared | Implemented |
| GET | `/api/auth/me` | Current account profile | C/P/A | bearer access token → user | FR1/2 | M1 | Implemented |
| GET | `/api/providers` | Approved provider search | Public | `q`, `category` → provider list | FR3 | M1 | Implemented |
| GET | `/api/providers/:id` | Public approved provider detail | Public | UUID → provider | FR3 | M1 | Implemented |
| GET | `/api/providers/me` | Own provider profile | P | bearer token → provider | FR2 | M1 | Implemented |
| PUT | `/api/providers/me` | Create/update own profile | P | trade, area, bio, experience, price → provider | FR2/4 | M1 | Implemented |
| GET | `/api/admin/overview` | Verification counts | A | bearer token → pending/approved/rejected | FR4 | M1 | Implemented |
| GET | `/api/admin/providers` | Verification queue | A | optional status → list | FR4 | M1 | Implemented |
| GET | `/api/admin/providers/:id/documents` | Short-lived document links | A | provider UUID → links | FR4 | M1 | Implemented |
| PATCH | `/api/admin/providers/:id/verification` | Approve/reject | A | status, note → provider | FR4 | M1 | Implemented |
| SDK | `provider_documents` + private Storage | Upload identity evidence | P owner | file kind and path → document | FR4 | M1 | Implemented in mobile |
| RPC | `review_provider` | Trusted verification decision | A | provider, status, note → profile | FR4 | M1 | Migration written |

For Express, `C`, `P` and `A` mean CUSTOMER, SERVICE_PROVIDER and ADMIN. `Authorization: Bearer <Supabase access token>` is required on protected routes. The server verifies that token with Supabase Auth and reads the current role from the `profiles` table; it does not trust a role sent by the phone. The app's direct Supabase calls are protected by grants and RLS. Error shape: `{ "error": { "code": "...", "message": "..." } }`.

Email confirmation returns to `lk.we33.homeservices://auth/callback` on Android or `<web origin>/auth/callback` in a browser. These are app callbacks, not Express `/api` endpoints. Supabase Authentication → URL Configuration must allow the matching redirect URL.

## Planned interfaces for other members

| Method | Endpoint / module | Purpose | Role | Request → response | Requirement | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| GET/PATCH | `/api/users/me` | Profile and saved locations | C/P/A self | profile fields → profile | FR2 | M2 | Planned |
| GET | `/api/providers` filtering extension | Price, rating and distance filters | Public | filters → list | FR3 | M2 with M1 | Planned |
| GET/POST/PATCH/DELETE | `/api/categories` | Service categories; admin list at `/manage` | Public read / A write | category fields → category | FR6 | M3 with M1 | Implemented; SQL required |
| GET/POST/PATCH/DELETE | `/api/services` | Service details and provider services; own list at `/mine` | Public read / P owner write | fields → service | FR6 | M3 | Implemented; SQL required |
| GET/POST/PATCH/DELETE | `/api/availability` | Available slots and calendar; own list at `/mine` | Public read / P owner write | date and slot → slot | FR5 | M3 | Implemented; SQL required |
| POST | `/api/bookings` | Atomically reserve a slot and create booking | C | service, slot, address → booking | FR5 | M3 | Implemented; SQL required |
| GET/PATCH | `/api/bookings` | List, detail and status transitions | C owner / P assigned / A | booking fields → booking | FR7/9 | M4 | Planned |
| GET/POST/PATCH/DELETE | `/api/reviews` | Read and manage eligible reviews | Public read / C owner write | review → review | FR8 | M4 write, M2 browse | Planned |
| GET/POST/PATCH | `/api/feedback` | Submit and process feedback | C/P submit / A process | feedback → feedback | Feedback | M2, M1 admin | Planned |
| GET/POST/PATCH | `/api/support` | Support requests | C/P owner / A | request → status | Support | M4, M1 admin | Planned |
| GET/PATCH | `/api/notifications`, `/:id/read` | Inbox and read state | Recipient | list → notifications; mark one read | FR10 | M3 | Implemented; SQL required |

Never send card numbers or CVV to these endpoints. Booking creation must use a transaction or equivalent conflict-safe database operation; a client-only slot check is insufficient.
