# Member 3 workload and implementation boundary

The Milestone 02 workload table did **not** clearly assign Member 3 interfaces. The user requested implementation of the proposed Member 3 scope in the `kosala` checkout. The group should still record the final allocation, actual student name, ID, commits and viva evidence; this document does not claim a student's personal contribution.

Implemented screen/code boundaries: `src/features/member3/` and `src/styles/member-three.css`. The Supabase schema/RPC is in `supabase/migrations/20261009_member3_service_booking.sql`. Optional Express routes are in `server/src/modules/{categories,services,availability,bookings,notifications}/member3.*.routes.ts`. The shared app screens only link into Member 3's screens.

Member 3 implements service categories and service CRUD, provider availability/calendar CRUD, atomic booking creation, and notification read state. Member 4 retains booking status/history and post-booking interactions. Live results require applying the migration to Supabase.

Related IDs: FR5, FR6, FR10. Viva walkthrough: provider approval → service → slot → customer booking → both inboxes. Explain RLS, the slot exclusion constraint, row lock in `book_service_slot`, and which work is still assigned to Member 4. Record actual test outcomes only after running the live flow.
