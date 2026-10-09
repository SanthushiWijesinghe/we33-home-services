# Functional test and traceability template

Record actual app results before using this in the consolidated report. Map the requirement IDs to Milestone 01 wording where available.

| Test ID | Requirement | Feature / interface | Preconditions and steps | Expected result | Actual result | Pass / fail | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC01 | FR1 | Demo role navigation | Open app; switch Customer, Provider and Admin roles | Each workspace is visible and actions remain navigable | To execute | — | Member 1 |
| TC02 | FR3 | Search and filtering | Search for “plumber”; select Plumbing; set rating and price filters | Matching provider cards update; clear filters restores results | To execute | — | Member 1 / 2 |
| TC03 | FR5 | Create booking | Select a provider; choose date/time/address/payment; confirm | Booking confirmation shown and booking is in Upcoming | To execute | — | Member 4 |
| TC04 | FR7 / FR9 | Read booking details | Open My bookings and select a booking | Booking ID, provider, service, time, address, price and status are shown | To execute | — | Member 4 |
| TC05 | FR7 | Update booking status | Cancel a confirmed booking | Status becomes Cancelled and booking moves to Past | To execute | — | Member 4 |
| TC06 | FR9 | Delete booking history | Remove a past booking | Booking is removed from the list and remains removed after refresh | To execute | — | Member 4 |
| TC07 | FR2 / FR6 | Provider create/update/delete | Add listing; edit price/title; remove listing | Listing appears, updates, is removed, and survives refresh | To execute | — | Member 1 / 3 |
| TC08 | FR4 | Admin verification | Add provider; approve verification | Provider badge changes to Verified and survives refresh | To execute | — | Member 1 |
| TC09 | FR8 | Rating and review | Open a completed booking; add stars and comment | Review is saved and appears on provider Reviews tab | To execute | — | Member 2 / 4 |
| TC10 | FR10 | Notifications / feedback | Use feedback form and booking confirmation | User receives visible success feedback | To execute | — | Member 2 |
| TC11 | NFR6 | Responsive layout | Open at desktop and phone widths | Main tasks remain visible and usable at both widths | To execute | — | Member 3 |
| TC12 | NFR7 | Persistence | Create or update a record; refresh the browser | Local demo record remains available | To execute | — | All |

## Usability study record (required: at least 5 participants)

Do not fill the result cells with invented observations. Record real/proxy participants, task completion, time, issues, and consent/evidence location.

| Participant code | Role | Task | Completed? | Time / assistance | Observed issue | Participant feedback | Evidence reference |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P1 | Customer | Find/filter a provider and start a booking | To conduct | — | — | — | — |
| P2 | Customer | Review provider services and reviews | To conduct | — | — | — | — |
| P3 | Customer | Book a service and find booking details | To conduct | — | — | — | — |
| P4 | Customer | Cancel a booking and find it under Past | To conduct | — | — | — | — |
| P5 | Provider | Add or edit a service listing | To conduct | — | — | — | — |
