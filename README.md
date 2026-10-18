## Monorepo Overview

This repository contains the **MSSN Website** project with multiple services:

- **Marketing Site** (`marketing-react/`): React Router v7 frontend for public-facing pages (SSR)
- **API Service** (`api/`): Hono-based API service (Bun runtime)
- **Dashboard** (`dashboard-react/`): React Router v7 single-page dashboard for Exco members

### Documentation

- **[API Specification](./API_SPECIFICATION.md)**: Complete API endpoint documentation based on PRD requirements
- **Project Structure**:
  - `marketing-react/`: React Router marketing app (SSR)
  - `dashboard-react/`: React Router Exco dashboard (SPA)
  - `api/`: Hono API service (Bun runtime)
  - `research/`: Reference notes and specifications

### Development

Each app is self-contained; install and run from its own directory:

```bash
cd marketing-react   # or dashboard-react
npm install
npm run dev
```

### Deployment

- `marketing-react/` and `dashboard-react/` deploy to Vercel (see each app's `vercel.json`).
- `api/` is the Hono/Bun backend service.

### Notes

- Environment files (`.env*`), `node_modules/`, and build output (`build/`, `dist/`, `.vercel/`) are intentionally ignored.
