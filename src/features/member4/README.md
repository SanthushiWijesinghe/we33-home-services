# Member 4 — booking follow-through and support

Owner: Nadun. This folder contains the live Supabase calls, types and mobile screens for booking lists, details, status/history, completed booking reviews, and support requests (FR7–FR9).

## Files

- `Member4Screens.tsx`: customer/provider/admin booking views, review submission and deletion, public provider reviews, support form and admin queue.
- `member4.service.ts`: Supabase operations. Booking changes and review writes use database RPCs.
- `member4.types.ts`: booking, review, event and support contracts.
- `src/styles/member-four.css`: mobile styles for these screens.
- `supabase/migrations/20261010_member4_booking_followthrough.sql`: status rules, booking events, review eligibility and rating updates, support RLS and RPCs.
- `server/src/modules/bookings/member4.booking-management.routes.ts`, `server/src/modules/reviews/member4.reviews.routes.ts`, `server/src/modules/support/member4.support.routes.ts`: optional Express routes using the same user-scoped Supabase rules.

Apply migrations in order: Member 1, Member 3, then Member 4. Member 2 is needed for the customer profile screens. The mobile app reads Supabase directly; Express is optional.

## Live walkthrough

1. Customer makes a booking in Member 3, then opens **Bookings** to see its details.
2. Customer or provider cancels before the appointment begins. The booking stays in **History**, and the future slot becomes available again.
3. After the appointment ends, provider opens **Bookings** and marks it completed. Customer opens **History**, rates and reviews it, then edits or deletes their review. Ratings update on the provider profile.
4. Customer opens **Help & Support**, sends a request, and sees it in their list. Admin opens the support queue, changes its status and adds a response.

Member 4 adds links to `MemberOneApp.tsx`, the provider/admin dashboards, customer profile, provider detail, and Member 3 booking confirmation. The migration must be run in the Supabase SQL Editor before live screens can save data.
