# spa-villa-rish

The repository now contains two coordinated workspaces:

- `frontend/` – React SPA that showcases the spa experience and now embeds an online booking widget plus a lightweight admin console.
- `backend/` – Express + MongoDB API that powers availability, booking, and authentication.

## Frontend usage

```bash
cd frontend
npm install
cp .env.example .env    # edit REACT_APP_API_URL if needed (defaults to /api through the CRA proxy)
npm start               # dev server on http://localhost:3000
npm run build           # production build
```

Key UI additions:

- `/booking` is a multi-step flow (contact → slot selection → hosted payment placeholder) wired to the API.
- `/admin` route offers a minimal console to log in (using backend credentials), view bookings, and update statuses.

## Backend usage

```bash
cd backend
npm install
cp .env.example .env    # supply real secrets/connection string
npm run dev             # nodemon on http://localhost:4000
```

The API exposes `/api/services`, `/api/availability`, `/api/bookings`, and `/api/auth/login`. Seed the `Service` and `Settings` collections so the frontend can surface real data.
