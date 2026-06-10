---
name: electron-ipc
description: >-
  Implements secure Electron IPC communication via contextBridge, ipcMain, and
  ipcRenderer. Use when editing src/main/ipc-*.ts, src/preload/, src/renderer/store/,
  src/renderer/components/, or when adding IPC channels, window.electronAPI methods,
  or preload handlers.
---

# Electron IPC skill

## Architecture
- Renderer never uses Node.js APIs directly.
- All communication goes through `window.electronAPI` exposed by preload.
- Preload uses `contextBridge.exposeInMainWorld`.

## Preload (`src/preload/index.ts`)
- Import `ipcRenderer` from `electron`.
- Expose typed API object:

```ts
contextBridge.exposeInMainWorld('electronAPI', {
  createProfile: (data: CreateProfileDTO) => ipcRenderer.invoke('profile:create', data),
  startProfile: (id: string) => ipcRenderer.invoke('profile:start', id),
  // ... other methods
})
```

## Main process handlers (`src/main/ipc-handlers.ts`)
- Use `ipcMain.handle('channel', async (event, ...args) => { ... })`.
- Validate inputs, return data or throw errors.
- Handle errors gracefully, never expose internal paths.

## Renderer usage
- Call via `window.electronAPI.createProfile(...)`.
- Wrap calls in try/catch, show notifications on error.

## Naming convention
- `object:action` e.g., `profile:create`, `proxy:test`, `session:load-extension`.
- Keep invocations idempotent where possible.
