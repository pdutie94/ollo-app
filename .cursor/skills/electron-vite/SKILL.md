---
name: electron-vite
description: >-
  Configures and troubleshoots Electron-Vite build tooling, project structure,
  native module externalization, and electron-builder packaging. Use when editing
  electron.vite.config.ts, src/main/, src/preload/, or when working with
  better-sqlite3, electron-vite dev/build, or electron-builder.yml.
---

# electron-vite skill

## Project structure
- `src/main/` – Main process (Node.js), ESM only.
- `src/preload/` – Preload scripts (ESM).
- `src/renderer/` – React SPA, static export.

## Configuration (`electron.vite.config.ts`)
- Import `defineConfig` from `electron-vite`.
- Plugins: `react` from `@vitejs/plugin-react` for renderer.
- For main and preload, `externalizeDepsPlugin()` automatically externalizes native modules like `better-sqlite3`.
- Aliases: `@main` -> `src/main`, `@` -> `src/renderer`.

Example:
```ts
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: { alias: { '@main': resolve('src/main') } }
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: { alias: { '@': resolve('src/renderer') } },
    plugins: [react()]
  }
})
```

## Build & Run
- Dev: `electron-vite dev` (launches Electron with HMR).
- Build: `electron-vite build` (outputs `out/`).
- `electron-builder` uses `electron-builder.yml` for packaging.

## Native modules (better-sqlite3)
- Must be externalized. `externalizeDepsPlugin()` handles it.
- If better-sqlite3 causes rebuild errors, add to `electron-builder.yml`:

```yaml
npmRebuild: false
```

- And ensure native module compiled for Electron's Node version.
