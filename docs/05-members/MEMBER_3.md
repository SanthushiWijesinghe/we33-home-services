# MEMBER 3 WORKLOAD — TEAM CONFIRMATION REQUIRED

The Milestone 02 workload table does **not** clearly assign Member 3 interfaces. The allocation below is **proposed**, not an assertion about the original report. The group must agree and record the final allocation, student name and ID before feature work or viva claims.

Proposed screens: service categories, service details, availability, availability calendar, booking creation flow and notifications. Proposed frontend boundaries: `src/features/services/`, `availability/`, `notifications/`, and booking creation in coordination with Member 4. Proposed backend ownership: `categories/`, `services/`, `availability/`, notification routes; booking creation contract shared with Member 4.

Proposed CRUD: category read/admin maintenance; service create/read/update/delete with provider ownership; availability slot create/read/update/delete; booking creation with conflict checks; notification read/mark read. Related IDs: FR5, FR6, FR10. Expected cases: service details/pricing, availability slot conflicts, booking creation, notification read state, role denial. Viva: proposed module boundaries, date/time and concurrency rules, and actual test outcomes.
