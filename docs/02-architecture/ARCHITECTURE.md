# System architecture

```text
Android app (Capacitor + existing React/Vite UI)
  → feature screen and hook
  → shared API client / session state
  → HTTPS REST API
  → Express route and auth/role/validation middleware
  → feature controller
  → service/business rules
  → Mongoose model
  → MongoDB Atlas
```

The existing React screens stay under the root `src/` directory. The generated `android/` project packages `dist/` from `npm run build`; run `npx cap sync android` after each web change. `server/` is an independent TypeScript package. No business logic should be added to `src/app/App.jsx` as member features are built. Extract screens and data hooks by feature when an owner begins that work.

## Shared contracts

- IDs: MongoDB ObjectIds on the server; the current `HS-*` booking references are demo IDs. Preserve a human-readable booking reference separately from the database ID.
- Roles: `CUSTOMER`, `SERVICE_PROVIDER`, `ADMIN`. Server authorization decides access; visible role navigation never grants authority.
- Dates: ISO 8601 in API payloads. Store availability instants in UTC and display in the device's local time zone; store addresses separately from provider service areas.
- Prices: integer LKR minor units in the API. Show estimated total, service fee and payment choice before booking confirmation.
- Errors: `{ "error": { "code": "...", "message": "...", "details": [] } }`. The shared client turns non-2xx responses into `ApiError`.
- Request validation and role checks happen before controller/service execution. Controllers translate input/output; services enforce business rules; models persist data.

## Current boundaries

`src/services/api/client.ts` is the shared HTTP entry point; it is not yet called by existing demo screens. `src/services/storage/demoStore.ts` is a safe browser storage adapter. `src/theme/tokens.ts` holds reusable future UI values while the established design remains in `src/styles/global.css`. `src/navigation/useAndroidBack.ts` handles Android system Back. `server/src/app.ts` provides middleware and health; domain routes are for member stages.

## Environments

The Vite build embeds `VITE_API_URL`; Android cannot use the computer's `localhost`. Use `10.0.2.2` for an Android emulator reaching the host computer, a LAN IP for a physical phone, or a deployed HTTPS API. Never put JWT secrets in Vite environment variables. The server reads `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN` and `WEB_ORIGIN` from `server/.env`.

## Security and reliability

Passwords will be hashed with bcrypt before storage. JWT validation and role checks are server middleware. Feature owners must also check record ownership, for example customers only seeing their bookings. Validate all request bodies, handle duplicate booking slots, and avoid storing card numbers or CVV. The existing localStorage demo does not provide these guarantees and must not be used as the shared backend.
