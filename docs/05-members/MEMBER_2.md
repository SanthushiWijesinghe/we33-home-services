# Member 2 — customer profile and preferences

Name and student ID: **to be filled by the actual member**. Allocation comes from the Milestone 02 workload table.

Owned screens: service filters, customer profile, location settings, payment options, customer review browsing, feedback and submit feedback. Frontend boundaries: `src/features/discovery/`, `profile/`, `payments/`, `feedback/`, and review browsing under `reviews/`. Existing shared `Pages.jsx` and `Dialogs.jsx` require coordinated extraction.

Planned backend ownership: customer profile/address and feedback routes; safe payment method representation; read-only review filtering. Planned CRUD: profile read/update, address create/read/update/delete, safe payment method create/read/update/delete, feedback create/read. Related IDs: FR2, FR3, FR8 and NFR3/NFR8; feedback is a prototype feature outside the numbered FR table. Expected cases: filter success/empty/error, profile update, location CRUD, safe payment metadata, feedback validation, review list. Viva: ownership rules, payment data safety, and actual usability observations.
