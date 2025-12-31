## Monorepo Overview

This repository contains the **MSSN Website** project with multiple services:

- **Marketing Site** (`marketing/`): SvelteKit frontend for public-facing pages
- **API Service** (`api/`): Hono-based API service (Bun runtime)
- **Dashboard** (`dashboard/`): SvelteKit dashboard for Exco members

### Documentation

- **[API Specification](./API_SPECIFICATION.md)**: Complete API endpoint documentation based on PRD requirements
- **Project Structure**:
  - `marketing/`: SvelteKit app entrypoint and routes
  - `api/`: Hono API service with Bun runtime
  - `dashboard/`: Exco dashboard application
  - **Root**: Shared configuration (e.g. `.gitignore`, `CHANGELOG.md`, `API_SPECIFICATION.md`)

### Development

- **Install dependencies**:

```bash
cd marketing
npm install
```

- **Run the dev server**:

```bash
cd marketing
npm run dev
```

### Notes

- Environment files (`.env*`), `node_modules/`, SvelteKit build output (`.svelte-kit/`, `build/`, `dist/`), and IDE metadata are intentionally ignored at the root and in `marketing/`.
- Format and tooling configuration for the app (Prettier, `.npmrc`, etc.) live inside `marketing/` to keep concerns scoped to the SvelteKit project.


