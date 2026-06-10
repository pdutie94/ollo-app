---
name: webview
description: >-
  Guides Electron webview tag usage for isolated browser profiles with persistent
  partitions. Use when editing src/renderer/components/WebView, src/main/services/session,
  profile partitions, proxy setup, extensions, or webview lifecycle events.
---

# Webview skill

## Why webview
- A `<webview>` tag allows embedding a separate renderer process with its own partition.
- Use `partition="persist:profile_<id>"` to persist cookies, localStorage, cache per profile.
- Avoid opening many `BrowserWindow` instances.

## Usage in React
- Use `dangerouslySetInnerHTML` or a `useEffect` to create the webview element (since React JSX doesn't support `<webview>` directly). Better: use `useRef` and create the element imperatively.
- Example:

```tsx
import { useRef, useEffect } from 'react'

export function WebViewContainer({ profileId, url }: { profileId: string; url: string }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const webview = document.createElement('webview') as Electron.WebviewTag
    webview.setAttribute('partition', `persist:profile_${profileId}`)
    webview.setAttribute('src', url)
    webview.style.width = '100%'
    webview.style.height = '100%'
    containerRef.current?.appendChild(webview)

    return () => {
      webview.remove()
    }
  }, [profileId, url])

  return <div ref={containerRef} className="flex-1" />
}
```

## Proxy and extensions
- Before loading, send IPC to main process to set proxy and load extensions for that partition.
- Main process uses `session.fromPartition(...).setProxy(...)` and `session.loadExtension(...)`.
- After setup, IPC returns success, then set `src` of webview.

## Events
- `dom-ready`, `did-navigate`, `page-title-updated` can be listened for status updates.
- Use `webview.addEventListener` (in main process via `webContents` if needed).

## Security
- Enable `webviewTag: true` in `webPreferences` of the `BrowserWindow` that hosts the React app.
- Do not enable `nodeintegration` in webview.
