# Requirement traceability foundation

Statuses describe the **current repository**, not the planned API. Existing means a working local demo flow; Partial means a screen exists but a requirement is incomplete; Planned means only a contract/design exists; Missing means no implemented flow. Test IDs refer to the planned/manual cases in the testing documentation.

| Requirement ID | Requirement | Prototype interface | Implementation feature | Frontend file | Backend module | API | CRUD | Test case | Member owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FR1 | Authentication | Splash, Login, Sign Up | `auth/` | None yet | `auth/` planned | `/auth/*` planned | Register/read session | TC01–03 | M1 | Missing |
| FR2 | Profile management | Customer/Provider Profile | `profile/`, `providers/` | `src/features/pages/Pages.jsx` | `users/`, `providers/` planned | `/users/me`, `/providers/me` planned | Read/update local UI | TC04 | M1/M2 | Partial |
| FR3 | Search and filtering | Search, Filters, Results | `discovery/` | `src/features/pages/Pages.jsx` | `providers/`, `services/` planned | GET `/providers`, `/services` planned | Read local seed data | TC05–06 | M1/M2 | Existing |
| FR4 | Provider verification | Verification, Provider Profile | `admin/` | `src/features/pages/Pages.jsx` | `providers/` planned | PATCH `/providers/:id/verification` planned | Local status update | TC07 | M1 | Partial |
| FR5 | Availability and booking | Availability, Calendar, Booking, Payment | `availability/`, `bookings/` | `src/features/pages/Dialogs.jsx` | `availability/`, `bookings/` planned | `/availability`, POST `/bookings` planned | Local booking create; no slot CRUD | TC08–11 | M3 (proposed) | Partial |
| FR6 | Category and service management | Categories, Service Details, Manage Services | `services/` | `src/features/pages/Pages.jsx` | `categories/`, `services/` planned | `/categories`, `/services` planned | Local provider listing CRUD | TC12–14 | M3 (proposed)/M1 | Partial |
| FR7 | Booking status | My Bookings, Booking Details | `bookings/` | `src/features/bookings/BookingCard.jsx`; `Pages.jsx` | `bookings/` planned | `/bookings`, `/bookings/:id/status` planned | Local read/update/cancel | TC15–17 | M4 | Partial |
| FR8 | Ratings and reviews | Provider Reviews, Rate & Review | `reviews/` | `src/features/pages/Dialogs.jsx` | `reviews/` planned | `/reviews` planned | Local create/read only | TC18–20 | M2 browse/M4 submit | Partial |
| FR9 | Booking history | My Bookings, History | `bookings/` | `src/features/pages/Pages.jsx` | `bookings/` planned | GET `/bookings` planned | Local read/remove | TC21 | M4 | Partial |
| FR10 | Notifications | Notifications, Dashboard | `notifications/` | Header icon in `src/app/App.jsx` | `notifications/` planned | `/notifications` planned | None | TC22 | M3 (proposed) | Missing |

The Milestone 02 report leaves Member 3's interface workload unspecified. All M3 entries are proposals pending team confirmation. The embedded prototype screenshots and original Figma file should be checked screen by screen before claiming fidelity.
