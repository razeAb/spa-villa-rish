# Backend API

Express + MongoDB API that powers booking, availability, and admin flows for Spa Villa Rish.

## Getting started

```bash
cd backend
npm install
cp .env .env.local # or create your own secrets file
npm run dev        # starts nodemon on http://localhost:4000
```

`index.js` boots the server only after a successful connection to the Mongo cluster defined in `MONGODB_URI`. Set `DB_NAME` if you want to target a specific database inside the cluster.

## Environment variables

| Name | Description |
| --- | --- |
| `MONGODB_URI` | Full Mongo connection string. Required. |
| `DB_NAME` | Optional DB name override (`spa_booking` default). |
| `JWT_SECRET` | Used to sign/verify admin JWT tokens. Required. |
| `ADMIN_USER` / `ADMIN_PASS` | Credentials for `/api/auth/login`. |
| `PORT` | Port to listen on (`4000` default). |

> Keep `.env` files out of version control (see `backend/.gitignore`).

## Available endpoints

- `POST /api/auth/login` – exchanges admin credentials for a JWT.
- `GET /api/availability` – returns open slots for a service on a given date.
- `POST /api/bookings` – creates a booking (public).
- `GET /api/bookings` – list bookings (admin auth required).
- `PUT /api/bookings/:id` – update booking time/status/note (admin auth required).
- `GET /api/health` – simple readiness probe.

Routes share Mongoose models located in `backend/models` and helper logic under `backend/utils`.
