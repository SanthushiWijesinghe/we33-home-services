# Requirement traceability foundation

Statuses describe the **active Member 1 mobile app**. Partial means code exists but remote SQL, configuration, design comparison or functional evidence remains incomplete; Planned means an assigned owner has a contract but no active flow. The previous local demo still exists in `src/app/App.jsx` but is not the active entry. Test IDs refer to planned cases, not completed results.

| Requirement ID | Requirement | Prototype interface | Implementation feature | Frontend file | Backend module | API | CRUD | Test case | Member owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FR1 | Authentication | Splash, Login, Sign Up | `auth/` | `src/features/auth/AuthProvider.tsx`, `AuthScreens.tsx` | Supabase Auth, `auth/` | Supabase Auth, GET `/api/auth/me` | Signup/session read/logout code; migration not applied | TC01–03 | M1 | Partial |
| FR2 | Profile management | Customer/Provider Profile | `profile/`, `providers/` | `src/features/providers/ProviderScreens.tsx` | Supabase `profiles`, `provider_profiles`; `providers/` | GET/PUT `/api/providers/me` | Provider create/read/update code; customer profile M2 planned | TC04 | M1/M2 | Partial |
| FR3 | Search and filtering | Search, Filters, Results | `discovery/` | `src/features/discovery/SearchProvidersScreen.tsx` | Supabase `provider_profiles`; `providers/` | GET `/api/providers` | Approved provider read/text/category code; advanced filters M2 planned | TC05–06 | M1/M2 | Partial |
| FR4 | Provider verification | Verification, Provider Profile | `admin/` | `src/features/admin/AdminScreens.tsx` | Supabase RPC/storage; `admin/` | PATCH `/api/admin/providers/:id/verification` | Document upload/read and approve/reject code; migration not applied | TC07 | M1 | Partial |
| FR5 | Availability and booking | Availability, Calendar, Booking, Payment | `availability/`, `bookings/` | Legacy `Dialogs.jsx` only | `availability/`, `bookings/` planned | `/availability`, POST `/bookings` planned | No active CRUD | TC08–11 | M3 (proposed) | Planned |
| FR6 | Category and service management | Categories, Service Details, Manage Services | `services/` | Category navigation in `HomeScreen.tsx` | `categories/`, `services/` planned | `/categories`, `/services` planned | No active CRUD | TC12–14 | M3 (proposed)/M1 | Planned |
| FR7 | Booking status | My Bookings, Booking Details | `bookings/` | Placeholder in active entry; legacy demo retained | `bookings/` planned | `/bookings`, `/bookings/:id/status` planned | No active CRUD | TC15–17 | M4 | Planned |
| FR8 | Ratings and reviews | Provider Reviews, Rate & Review | `reviews/` | Legacy `Dialogs.jsx` only | `reviews/` planned | `/reviews` planned | No active CRUD | TC18–20 | M2 browse/M4 submit | Planned |
| FR9 | Booking history | My Bookings, History | `bookings/` | Placeholder in active entry | `bookings/` planned | GET `/bookings` planned | No active CRUD | TC21 | M4 | Planned |
| FR10 | Notifications | Notifications, Dashboard | `notifications/` | Header icon only | `notifications/` planned | `/notifications` planned | No active CRUD | TC22 | M3 (proposed) | Planned |

The Milestone 02 report leaves Member 3's interface workload unspecified. All M3 entries are proposals pending team confirmation. The embedded prototype screenshots and original Figma file should be checked screen by screen before claiming fidelity.
