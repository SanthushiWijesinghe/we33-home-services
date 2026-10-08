# Member 4 — booking follow-through and support

Owner checkout: Nadun. Student ID: **to be filled by the member**.

Implemented mobile screens: customer/provider/admin booking list, booking details and activity history, cancellation, provider completion, customer review create/edit/delete, public provider review cards, support request form and admin support queue. Source: `src/features/member4/` and `src/styles/member-four.css`. Shared navigation entry points are in `src/app/MemberOneApp.tsx` and the Member 1–3 screens.

Database source: `supabase/migrations/20261010_member4_booking_followthrough.sql`. It extends Member 3 bookings and slots. Status changes and reviews use role-checked SQL functions; support requests use RLS. A cancelled future booking keeps its history and releases its slot. Reviews require a completed booking and update the provider rating automatically. Public review cards omit customer and booking IDs.

Optional Express endpoints: `server/src/modules/bookings/member4.booking-management.routes.ts`, `server/src/modules/reviews/member4.reviews.routes.ts`, and `server/src/modules/support/member4.support.routes.ts`. The mobile app calls Supabase directly.

Related requirements: FR7, FR8, FR9. For the viva, demonstrate booking list/detail, cancellation before the start time, completion after the end time, review ownership and rating changes, and support request status/response. Run the SQL migration in Supabase before attempting the live flow. See `src/features/member4/README.md` for the walkthrough.
