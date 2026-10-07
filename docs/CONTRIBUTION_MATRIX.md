# Contribution matrix

The rows below describe **planned ownership**, not completed personal contributions. Members must update them with real names, student IDs, files, commits, pull requests, test evidence and viva screenshots as work happens. See individual files under `05-members/`.

| Member | Assigned/proposed interfaces | Frontend boundary | Backend boundary | Requirement IDs | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Auth, home, provider/admin dashboards, search, verification | `auth/`, `home/`, `admin/`, search | `auth/`, provider/admin routes | FR1–4, FR6 | Assignment documented; implementation pending |
| 2 | Filters, profile, location, payment options, review browsing, feedback | `discovery/`, `profile/`, `payments/`, `feedback/`, review browse | users, safe payment metadata, feedback | FR2, FR3, FR8 | Assignment documented; implementation pending |
| 3 | Categories, details, availability/calendar, booking creation, notifications | `services/`, `availability/`, `notifications/` | categories, services, availability, notifications | FR5, FR6, FR10 | **PROPOSED — team confirmation required** |
| 4 | Bookings, status/history, review submission, support | `bookings/`, review submit, `support/` | bookings, reviews, support | FR7–9 | Assignment documented; implementation pending |

Existing demo screens were already present before this ownership plan. Do not attribute that existing code to individual members without actual evidence. No fake commits or retroactive attribution.
