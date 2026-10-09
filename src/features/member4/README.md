# Member 4 — booking follow-through and support

Owner: Nadun. This folder contains the live Supabase calls, types and mobile screens for booking lists, details, status/history, booking reviews, demo checkout and support requests (FR7–FR9).

## Booking review and demo checkout update

The group requested review writing immediately after booking. Apply `20261012_member4_demo_checkout_booking_reviews.sql` after the earlier migrations. Confirmed and completed bookings now offer review create/update/delete. Existing reviews remain visible if a booking is later cancelled, but cancelled bookings cannot receive new review submissions.

`Member4DemoCheckout.tsx` owns booking-specific simulated checkout. It reuses Member 2's sample card-entry fields and saved masked card preferences. Every screen and receipt identifies the transaction as a demo; there is no Stripe integration or movement of money. The `member4_record_demo_payment` RPC checks booking ownership, rejects cancelled bookings, takes the amount from the trusted booking and serializes repeated calls to one receipt per booking. Table: `booking_demo_payments`; status: `demo_paid`. No card number, expiry or CVV is stored or sent to the database.

Flow: Profile → Payment options → add a sample card; book a slot → Payment and write a review → enter/select demo card → Confirm demo payment. Reopen booking to see the receipt and submit a booking review immediately. Card validation rejects invalid numbers, past expiry, empty cardholder names and invalid security codes. The mobile app calls Supabase directly and requires no payment server for this demo.

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
3. Customer can review immediately in **Active** or later in **History**. After the appointment ends, the provider can mark it completed. Review creation, editing and deletion update the provider rating.
4. Customer opens **Help & Support**, sends a request, and sees it in their list. Admin opens the support queue, changes its status and adds a response.

Member 4 adds links to `MemberOneApp.tsx`, the provider/admin dashboards, customer profile, provider detail, and Member 3 booking confirmation. The migration must be run in the Supabase SQL Editor before live screens can save data.
