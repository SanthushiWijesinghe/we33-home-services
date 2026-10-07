# Member 3 feature boundary

This folder contains the mobile screens, types and Supabase data calls for service categories, provider services, availability, customer booking creation and notifications (FR5, FR6, FR10).

## Files

- `Member3Screens.tsx`: category browsing/admin maintenance, provider service CRUD, availability calendar, customer service selection/booking and notification inbox.
- `member3.service.ts`: direct Supabase operations used by the mobile app.
- `member3.types.ts`: typed category, service, slot, booking and notification contracts.
- `src/styles/member-three.css`: Member 3 screen styles.
- `supabase/migrations/20261009_member3_service_booking.sql`: Member 3 tables, grants, RLS, nonoverlapping slots and atomic booking RPC.
- `server/src/modules/{categories,services,availability,bookings,notifications}/member3.*.routes.ts`: optional Express API equivalents. The current mobile app calls Supabase directly; it does not require Express to be running.
- `src/app/MemberOneApp.tsx`, `src/features/home/HomeScreen.tsx`, `src/features/providers/ProviderDetailScreen.tsx`, `src/features/providers/ProviderScreens.tsx`, and `src/features/admin/AdminScreens.tsx`: shared navigation touchpoints only.

Member 4 owns later booking list, status changes, history, reviews and support. The `bookings` table and booking creation RPC form the shared handoff. Do not claim Member 4's status management is complete.

## Apply and check the live flow

Apply `20261007_member1_foundation.sql` first, then run the complete `20261009_member3_service_booking.sql` in the same Supabase project's SQL Editor. Rebuild the Android app after changing JavaScript or CSS. Running the SQL file locally does not change Supabase until a project operator applies it.

1. **Admin:** sign in and open Dashboard → Manage service categories. Add, edit, hide and browse categories.
2. **Approved provider:** open Dashboard → My services. Add a service in the provider's approved trade, edit its price/details, and open Availability calendar to create or move times. Overlapping times are rejected by PostgreSQL.
3. **Customer:** open Home → Search → a verified provider → View services & availability. Select a service and time, enter an address and confirm. The `book_service_slot` RPC locks the slot, creates one booking and creates inbox notifications in one transaction.
4. **Customer/provider:** open the bell icon to read a notification. Tapping an unread notification marks only that account's message as read.

Provider service creation requires an approved provider profile whose primary trade matches an active category. Admin category maintenance and booking writes are protected by role checks and RLS. The publishable Supabase key is sufficient for the app; never put a service role key in the mobile build.
