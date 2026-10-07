# Member 2 feature boundary

Member 2 owns customer discovery filters, profile preferences, saved service locations, payment metadata, provider review browsing, and customer feedback.

## File ownership

- `src/features/member2/Member2Screens.tsx` — Member 2 customer screens and user interactions.
- `src/features/member2/member2.service.ts` — Member 2 Supabase reads and writes.
- `src/styles/member-two.css` — Member 2-only visual styles.
- `supabase/migrations/20261008_member2_customer_preferences.sql` — Member 2 tables, grants, indexes, and RLS policies.
- `src/app/MemberOneApp.tsx` — shared route wiring only; the Member 2 screens are mounted here.
- `src/features/discovery/SearchProvidersScreen.tsx` — shared search screen receives the Member 2 advanced-filter action.

The migration stores only safe payment metadata (`method_type`, label, and optional last four digits). It never stores full card numbers or CVV values.

## Database setup for Member 2 screens

The app needs three tables in the same Supabase project used by `.env`: `customer_addresses`, `customer_payment_methods`, and `customer_feedback`. If a screen reports that one of these tables is missing from the schema cache, the Member 2 migration has not been applied to that project.

1. Apply `supabase/migrations/20261007_member1_foundation.sql` first if the Member 1 tables are not present.
2. In the Supabase Dashboard SQL Editor, run the complete contents of `supabase/migrations/20261008_member2_customer_preferences.sql`. This migration also upgrades a database where the older `20261007_member2_customer_preferences.sql` was already run.
3. Reopen the app screens and save a location or submit feedback again. Data entered before the migration failed to save and must be submitted again.

The migration sends `NOTIFY pgrst, 'reload schema'` so the REST API sees the tables. Check the Table Editor for the three tables if the error remains, and confirm the app points to the same Supabase project.
