# Copilot / AI Agent Instructions — mobile/

Purpose: orient an AI coding agent to the Expo React Native mobile app so changes are correct, minimal, and follow project conventions.

- **Big picture (mobile-only):**
  - The mobile app is an Expo-managed React Native project located at `mobile/`.
  - Navigation and app entry live in `mobile/App.js`. Screens are under `mobile/src/screens/`.
  - Network calls are made via the axios client at `mobile/src/services/api.js` which targets `${apiUrl}/api` (reads `Constants.expoConfig.extra.apiUrl` or falls back to `http://localhost:3000`).

- **Primary flows to be aware of:**
  - Create ticket flow: `CreateTicketScreen.js` constructs `FormData` with field name `images` and posts to `ticketAPI.createTicket` → backend `POST /api/tickets` expects `multipart/form-data` and `images` (see `mobile/src/screens/CreateTicketScreen.js`).
  - Ticket list and details: `HomeScreen.js` and `TicketDetailScreen.js` use `ticketAPI.getTickets` and `ticketAPI.getTicketById` respectively.

- **Project-specific conventions:**
  - Use `FormData` with `images` or `afterImages` keys when sending files. Each file object must include `uri`, `type`, and `name` when appending to `FormData`.
  - Keep `mobile/src/services/api.js` as the single source of truth for base URL, timeouts, and headers. Prefer adding new API methods here rather than calling `axios` directly from screens.
  - Use Expo APIs for media/permissions (see `expo-image-picker` usage in `CreateTicketScreen.js`). Preserve permission-request UX and alerts when altering flows.
  - UI strings and simple validation (required `building` and `room`) are handled in-screen; avoid moving validation server-side without updating mobile UX.

- **Run / debug / test (mobile):**
  - Install and run:
    ```bash
    cd mobile
    npm install
    npm start
    ```
  - For physical-device testing, set `app.json` → `extra.apiUrl` to `http://<your-host-ip>:3000` so Expo on device can reach backend.
  - Common debug checks:
    - Verify `apiUrl` in `mobile/src/services/api.js` (reads `Constants.expoConfig.extra.apiUrl`).
    - If uploads fail, check `Content-Type` headers in `ticketAPI.createTicket` where multipart headers are set.

- **When making PRs or edits:**
  - Keep mobile changes small and focused. Update `mobile/README.md` when developer-visible commands change.
  - When modifying the API surface (e.g., changing endpoint paths or field names), update `mobile/src/services/api.js` and all screens that consume the API in the same PR.
  - Preserve user-facing flows: camera/gallery permission checks, FormData keys (`images`), and navigation back to `Home` after success.

- **Files to inspect first for mobile tasks:**
  - `mobile/App.js` — app entry / navigation
  - `mobile/src/services/api.js` — axios client and all API methods
  - `mobile/src/screens/CreateTicketScreen.js` — image capture and FormData example
  - `mobile/src/screens/HomeScreen.js`, `mobile/src/screens/TicketDetailScreen.js` — list/detail usage
  - `mobile/app.json` — `extra.apiUrl` for local-device testing

- **Concrete examples:**
  - FormData usage (follow `CreateTicketScreen.js`): append `{ uri, type: 'image/jpeg', name: 'issue.jpg' }` to key `images`.
  - Base URL override: set `app.json.extra.apiUrl` to `http://192.168.x.y:3000` when testing on a phone.

If you want, I can also generate a small Postman collection or a set of curl examples focused on the mobile-client shapes. Confirm if you'd like that or any additions to this file.
