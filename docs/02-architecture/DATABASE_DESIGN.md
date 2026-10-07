# Database design proposal

Database: MongoDB Atlas with Mongoose schemas. Status: **design only**; no domain models or live Atlas connection are implemented in Stage 2. Use ObjectId references and timestamps. Add compound indexes for ownership and date queries as data is implemented.

| Entity | Purpose and key fields | Relationships | Data owner / CRUD | Authorization |
| --- | --- | --- | --- | --- |
| User | Email unique, bcrypt password hash, name, phone, role, saved addresses, status | One provider profile; many bookings/reviews/feedback | Member 1 auth; Member 2 profile. Register, read, update, deactivate | Self for own profile; admin for moderation. Never return password hash |
| ServiceProviderProfile | User ref unique, bio, service areas, verification status/evidence reference, rating summary | Belongs to provider User; has services and slots | Member 1 provider/admin. Create, read, update; admin verification | Owner edits public details; admin alone changes verification |
| ServiceCategory | Name unique, slug unique, icon key, active flag | Has many services | Member 3 categories; admin approval by Member 1. CRUD | Public read; admin write |
| Service | Provider ref, category ref, title, description, base price in LKR minor units, active flag | Belongs to provider and category; used in bookings | Member 3 service detail and provider service UI with Member 1 coordination. CRUD | Public read active; owning provider write; admin moderate |
| AvailabilitySlot | Provider ref, start/end UTC, state (available/blocked/booked) | Belongs to provider; optional booking ref | Member 3 availability. CRUD | Provider own slots; public read available slots; atomic booking claim |
| Booking | Customer/provider/service refs, slot ref, address snapshot, price snapshot, payment choice, status, human reference | Joins customer, provider, service and slot | Member 3 creates; Member 4 manages/history. CRUD/status transitions | Customer own records; provider assigned records; admin oversight |
| Review | Booking/customer/provider refs, stars 1–5, comment, visibility | One review per completed booking | Member 4 submit/update/delete; Member 2 browse | Customer writes own completed-booking review; public read visible; admin moderate |
| Feedback | Author ref optional, topic, message, status | Optional User ref | Member 2 create/read; Member 1 admin status | Author reads own; admin reads/updates status |
| SupportRequest | Customer ref, optional booking ref, subject, message, status, reply metadata | User and optional booking | Member 4 create/read; Member 1 admin processing | Owner or admin only |
| Notification | Recipient ref, type, title, message, readAt, related entity ref | Belongs to User | Member 3 notification read/update; services create events | Recipient only; server creates records |
| PaymentMethodDisplay | User ref, label, type, optional gateway token/last four if an approved gateway is added | Belongs to User | Member 2 add/read/update/delete safe display metadata | Owner only; no raw card data |

No plain-text passwords, CVV, or complete card data may be stored. The current payment choice is demonstration data only. Verification status is not evidence that a person was checked; the future admin workflow must record a real decision and audit trail. Booking price/address are snapshots so later edits do not rewrite history. Use unique indexes for email, category slug, provider user, and booking review; enforce slot conflicts atomically.
