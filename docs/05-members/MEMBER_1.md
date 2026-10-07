# Member 1 — authentication, home and administration

Name and student ID: **to be filled by the actual member**. Allocation comes from the Milestone 02 workload table.

Owned screens: splash, login, signup, customer home, provider dashboard, admin dashboard, provider search, provider verification. Frontend boundaries: `src/features/auth/`, `home/`, `admin/`, and provider/search components coordinated with Members 2 and 3. Existing shared `Pages.jsx` must be split in feature branches before simultaneous edits.

Planned backend ownership: `auth/`, provider verification and admin routes; coordinate `providers/` and categories with Member 3. Planned CRUD: register/read session; provider profile read/update; admin verification read/update; admin issue/feedback status. Related IDs: FR1, FR2, FR3, FR4, FR6. Expected cases: valid/invalid login, registration validation, customer role denial for admin routes, provider verification, dashboard loading/error. Viva: architecture, role checks, demo credentials from safe local seed, and actual test outcomes.

## Current implementation boundary

The active Member 1 frontend is `src/app/MemberOneApp.tsx` and the `auth/`, `home/`, `discovery/`, `providers/` and `admin/` feature files. The backend work is `server/src/modules/auth/`, `providers/`, `admin/`, the Supabase client config and `supabase/migrations/20261007_member1_foundation.sql`. Source code is present; the remote migration and full visual design comparison remain pending. Do not present these files as completed personal contribution evidence until the actual member reviews, commits and explains them. Provider search filtering beyond basic text/category belongs to Member 2; service/availability creation belongs to Member 3; bookings and reviews belong to Member 4.
