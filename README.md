# spa-villa-rish

The project is now split into dedicated `frontend` and `backend` workspaces so each side can evolve independently.

## Repository layout

- `frontend/` – existing React SPA (moved from the repo root).
- `backend/` – placeholder for the API/service layer; add your preferred stack here.

## Frontend usage

```bash
cd frontend
npm install        # only needed once after the move
npm start          # dev server
npm test           # unit tests
npm run build      # production assets in frontend/build
```

## Backend usage

Backend work now lives under `backend/`. Create the framework structure you prefer (Express, Nest, serverless, etc.) inside that directory and keep its tooling isolated from the frontend.
