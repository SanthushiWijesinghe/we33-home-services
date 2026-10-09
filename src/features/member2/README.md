# Member 2 feature boundary

Member 2 owns customer discovery filters, profile preferences, saved service locations, payment metadata, provider review browsing, and customer feedback.

## File ownership

- `src/features/member2/Member2Screens.tsx` — Member 2 customer screens and user interactions.
- `src/features/member2/Member2CustomerReviewsScreen.tsx` — Customer Reviews summary, rating breakdown, sorting and saved review cards.
- `src/features/member2/member2.service.ts` — Member 2 Supabase reads and writes.
- `src/styles/member-two.css` — Member 2-only visual styles.
- `supabase/migrations/20261008_member2_customer_preferences.sql` — Member 2 tables, grants, indexes, and RLS policies.
- `supabase/migrations/20261011_member2_reviews_profile_photos.sql` — Private customer photo storage, profile photo path, and review browsing RPC. Apply after the Member 4 migration.
- `src/app/MemberOneApp.tsx` — shared route wiring only; the Member 2 screens are mounted here.
- `src/features/discovery/SearchProvidersScreen.tsx` — shared search screen receives the Member 2 advanced-filter action.

The migration stores only safe payment metadata (`method_type`, label, and optional last four digits). It never stores full card numbers or CVV values.

## Customer Reviews and profile photos

Owner: Member 2 (Nuleka). Profile → Rate and Reviews now opens the Customer Reviews screen. The summary uses the latest 200 actual reviews from approved providers; no sample ratings are inserted. Reviewer cards show first names without customer IDs, booking IDs or contact details. Write a Review opens Bookings, where Member 4 checks booking ownership and owns review creation/edit/deletion.

Profile → camera icon lets a customer select a JPG, PNG or WebP photo under 5 MB. The photo uploads to the private `customer-profile-photos` Supabase bucket, and `profiles.avatar_path` stores its location. Signed URLs display the image. Photos save immediately, separately from the name/phone Save changes form; reopen Profile to verify persistence. Storage policies restrict access to the photo owner.

Run `20261011_member2_reviews_profile_photos.sql`, then `20261012_member4_demo_checkout_booking_reviews.sql` in the shared Supabase SQL Editor before checking these features. SQL files in Git are not automatically applied to the remote database. Reviews are now available immediately for confirmed bookings as well as completed bookings. A later cancellation retains already-written booking feedback; new reviews cannot be submitted on cancelled bookings.

### Demo card preferences

Member 2 owns `Member2CardFields.tsx` and the profile card-entry form. Choose Card in Profile → Payment options, enter sample details, and save. Only a label and last four digits enter `customer_payment_methods`; full card number, expiry and CVV are not sent to Supabase. Sample card: 4242 4242 4242 4242, future MM/YY expiry, any three-digit sample security code. This is a demo, not a payment gateway. Member 4 reuses these fields for booking-specific demo checkout.

## Database setup for Member 2 screens

The app needs three tables in the same Supabase project used by `.env`: `customer_addresses`, `customer_payment_methods`, and `customer_feedback`. If a screen reports that one of these tables is missing from the schema cache, the Member 2 migration has not been applied to that project.

1. Apply `supabase/migrations/20261007_member1_foundation.sql` first if the Member 1 tables are not present.
2. In the Supabase Dashboard SQL Editor, run the complete contents of `supabase/migrations/20261008_member2_customer_preferences.sql`. This migration also upgrades a database where the older `20261007_member2_customer_preferences.sql` was already run.
3. Reopen the app screens and save a location or submit feedback again. Data entered before the migration failed to save and must be submitted again.

The migration sends `NOTIFY pgrst, 'reload schema'` so the REST API sees the tables. Check the Table Editor for the three tables if the error remains, and confirm the app points to the same Supabase project.
