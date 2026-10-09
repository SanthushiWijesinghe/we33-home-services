# Database design — Supabase PostgreSQL

Status: Member 1 schema and policies are written in [`supabase/migrations/20261007_member1_foundation.sql`](../../supabase/migrations/20261007_member1_foundation.sql). The migration has **not** been applied to the remote project from this workspace. The remaining rows are planned contracts for their owners.

| Entity | Purpose and key fields | Relationship / owner | CRUD and authorization |
| --- | --- | --- | --- |
| `auth.users` | Supabase managed email/password identity | Supabase Auth; Member 1 integration | Auth API only; no public SQL writes |
| `profiles` | ID, full name, role, phone | 1:1 with `auth.users`; Member 1 creates, Member 2 profile editing | Trigger creates; own read/name update; admin read; role update only by trusted operator |
| `provider_profiles` | Trade, location, bio, experience, price, rating summary, verification status | 1:1 with provider `profiles`; Member 1 | Provider owns editable fields; public sees approved; admin sees all and verifies through trusted RPC |
| `provider_documents` | Private ID/certificate storage path and kind | Provider; Member 1 | Provider uploads/reads own, admin reads for verification; approval requires front and back ID |
| `service_categories` | Name, slug, icon, active | Member 3 proposed; admin governance | Public read; admin write |
| `services` | Provider, category, title, description, price, active | Member 3 proposed | Public active read; owner create/update; admin moderation |
| `availability_slots` | Provider, start/end UTC, state | Member 3 proposed | Owner CRUD; public available read; conflict-safe reservation |
| `bookings` | Customer, provider, service, slot, address/price snapshots, status | Member 3 creates; Member 4 manages | Customer own; assigned provider; admin oversight; controlled transitions |
| `reviews` | Completed booking, customer, provider, stars, comment | Member 4 write; Member 2 browse | One review per eligible booking; owner edit/delete; public visible read |
| `feedback` | Author, topic, message, status | Member 2; admin processing Member 1 | Author creates/reads own; admin processes |
| `support_requests` | Author, optional booking, subject, status | Member 4; admin processing | Owner/admin scoped |
| `notifications` | Recipient, type, message, read time | Member 3 proposed | Recipient only; server creates events |
| `payment_method_display` | User, method label and safe display data | Member 2 | Owner only; no raw card numbers or CVV |

The implemented migration uses UUID foreign keys, constrained role/status values and RLS. It creates a private `provider-documents` Storage bucket. Passwords are managed by Supabase Auth; this app never stores plaintext passwords, CVV or full card details.
