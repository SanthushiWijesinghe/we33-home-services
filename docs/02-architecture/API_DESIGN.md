# REST API contract proposal

Base path: `/api`. Status: **planned**, except `GET /api/health`, which is implemented in Stage 2. Roles: C customer, P service provider, A admin, Public unauthenticated. `self` means the signed-in user or resource owner. Responses use JSON; validation failures return 400, missing/invalid tokens 401, forbidden access 403, missing records 404, conflicts 409, and successful creates 201. Paginate collections before production use.

| Method | Endpoint | Purpose | Role | Request → response | FR | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/health` | Liveness and database connection state | Public | — → `{status,database}` | NFR4 | Shared |
| POST | `/auth/register` | Register customer/provider | Public | `{name,email,password,role}` → session/user | FR1 | M1 |
| POST | `/auth/login` | Sign in | Public | `{email,password}` → access token/user | FR1 | M1 |
| GET | `/auth/me` | Current identity | C/P/A | bearer token → user | FR1 | M1 |
| GET | `/users/me` | Read profile | C/P/A | — → profile | FR2 | M2 |
| PATCH | `/users/me` | Update name/phone | C/P/A self | profile fields → profile | FR2 | M2 |
| GET | `/users/me/addresses` | List saved locations | C self | — → addresses | FR2 | M2 |
| POST | `/users/me/addresses` | Add location | C self | address → address | FR2 | M2 |
| PATCH | `/users/me/addresses/:id` | Edit location | C self | address → address | FR2 | M2 |
| DELETE | `/users/me/addresses/:id` | Remove location | C self | — → 204 | FR2 | M2 |
| GET | `/providers` | Search/filter providers | Public | query/category/rating/price/page → list | FR3 | M1/M2 |
| GET | `/providers/:id` | Provider profile | Public | — → profile/services/rating | FR2/3 | M1 |
| PATCH | `/providers/me` | Edit own provider profile | P self | profile fields → profile | FR2 | M1 |
| PATCH | `/providers/:id/verification` | Approve/reject verification | A | `{status,note}` → profile | FR4 | M1 |
| GET | `/categories` | List categories | Public | — → categories | FR6 | M3 |
| POST | `/categories` | Create category | A | name/slug → category | FR6 | M1/M3 |
| PATCH | `/categories/:id` | Edit category | A | category fields → category | FR6 | M1/M3 |
| DELETE | `/categories/:id` | Deactivate category | A | — → 204 | FR6 | M1/M3 |
| GET | `/services` | Search/list services | Public | category/provider/query → list | FR3/6 | M3 |
| GET | `/services/:id` | Service details/pricing | Public | — → service | FR6 | M3 |
| POST | `/services` | Add provider service | P | service fields → service | FR6 | M3 |
| PATCH | `/services/:id` | Edit own service | P owner | fields → service | FR6 | M3 |
| DELETE | `/services/:id` | Deactivate own service | P owner / A | — → 204 | FR6 | M3 |
| GET | `/availability` | List provider slots | Public | provider/date range → slots | FR5 | M3 |
| POST | `/availability` | Add available slot | P | start/end → slot | FR5 | M3 |
| PATCH | `/availability/:id` | Edit own slot | P owner | start/end/state → slot | FR5 | M3 |
| DELETE | `/availability/:id` | Remove own free slot | P owner | — → 204 | FR5 | M3 |
| POST | `/bookings` | Reserve slot/create booking | C | service/slot/address/payment choice → booking | FR5/7 | M3 |
| GET | `/bookings` | Own bookings/history | C/P/A scoped | status/page → list | FR7/9 | M4 |
| GET | `/bookings/:id` | Booking details | C/P assigned / A | — → booking | FR7/9 | M4 |
| PATCH | `/bookings/:id` | Edit allowed booking fields | C owner | date/slot/address → booking | FR7 | M4 |
| PATCH | `/bookings/:id/status` | Confirm/complete/cancel | C owner / P assigned / A; transition-specific | status → booking | FR7 | M4 |
| POST | `/reviews` | Review completed booking | C owner | booking/stars/comment → review | FR8 | M4 |
| GET | `/reviews` | Browse provider reviews | Public | provider/page → list | FR8 | M2 |
| PATCH | `/reviews/:id` | Edit own review | C owner | stars/comment → review | FR8 | M4 |
| DELETE | `/reviews/:id` | Remove own review | C owner / A | — → 204 | FR8 | M4 |
| POST | `/feedback` | Submit feedback | C/P | topic/message → feedback | FR10-related | M2 |
| GET | `/feedback` | Review feedback | A | status/page → list | FR10-related | M1 |
| PATCH | `/feedback/:id/status` | Process feedback | A | status → feedback | FR10-related | M1 |
| POST | `/support` | Create support request | C/P | subject/message/booking → request | Support | M4 |
| GET | `/support` | Own or admin requests | C/P self / A | status/page → list | Support | M4/M1 |
| PATCH | `/support/:id/status` | Process issue | A | status → request | Support | M1 |
| GET | `/notifications` | Read inbox | C/P/A self | page/unread → list | FR10 | M3 |
| PATCH | `/notifications/:id/read` | Mark notification read | C/P/A self | — → notification | FR10 | M3 |
| GET | `/users/me/payment-methods` | List safe display methods | C self | — → list | Payment | M2 |
| POST | `/users/me/payment-methods` | Add safe display method | C self | label/type → method | Payment | M2 |
| PATCH | `/users/me/payment-methods/:id` | Edit label/default | C self | fields → method | Payment | M2 |
| DELETE | `/users/me/payment-methods/:id` | Remove method | C self | — → 204 | Payment | M2 |

The payment endpoints must not accept raw bank card credentials. Booking slot reservation must use a conflict-safe server operation. Domain routes and their exact request schemas will be implemented by the assigned members after review of this contract. `GET /api/health` currently returns `{status:'ok', database:'connected'|'unavailable'}`.
