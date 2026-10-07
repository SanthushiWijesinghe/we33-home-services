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
