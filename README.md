
# Smart Patient Intake System

A Vite, React, and TypeScript healthcare intake dashboard for patient registration, records search, AI triage, analytics, and clinic settings.

## Frontend

- Professional login and authenticated app shell
- Dashboard KPIs, recent patients, charts, notifications, and quick actions
- Patient registration with validation feedback and AI-assisted triage preview
- Patient records with debounced search, filters, pagination, and row actions
- Patient details, AI triage workflow, analytics reports, and settings
- Light and dark theme support

## Project Layout

```text
src/
  app/           Current app shell and screens
  hooks/         Reusable React hooks
  lib/           Shared infrastructure such as API requests
  routes/        Route constants
  services/      API service modules
  styles/        Tailwind and theme styles
  types/         Shared TypeScript domain types
  utils/         Domain helpers
```

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Set `VITE_API_BASE_URL` when connecting the frontend to a FastAPI backend. It defaults to `http://localhost:8000`.
