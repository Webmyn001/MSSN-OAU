## Monorepo Overview

This repository contains the **marketing SvelteKit frontend** under the `marketing/` directory.

- **App directory**: `marketing/`
  - SvelteKit app entrypoint and routes
  - Local `package.json`, tooling config, and scripts
- **Root**:
  - Shared configuration (e.g. `.gitignore`, `CHANGELOG.md`)
  - Git metadata and repository-level settings

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


