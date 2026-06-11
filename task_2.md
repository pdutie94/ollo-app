# Ollo App — Task 2: Hardening, Real Implementation & Production Readiness

> **Created**: 2026-06-11
> **Scope**: Error Resilience → Stub Completion → Mock Removal → Fingerprint → Extension Loading → Testing → CI/CD
> **Tổng số task**: 71 tasks / 7 Phases (5-11)

---

## Tổng Quan

Task 1 đã hoàn thành MVP với đầy đủ CRUD + UI + animation. Task 2 tập trung vào:

1. **Ổn định hóa** — Bắt tất cả lỗi, không crash silent
2. **Thay thế toàn bộ stub/fake** — Proxy test thật, import/export thật, search thật
3. **Xóa mock data** — Dashboard dùng data thật, sidebar/header dynamic
4. **Fingerprint thực tế** — Canvas/WebGL/Audio spoofing khi launch browser
5. **Extension loading** — Load CRX vào Playwright context thực tế
6. **Testing đầy đủ** — Unit + Integration + E2E
7. **Sẵn sàng production** — CI/CD, auto-updater, crash recovery

---

## Phase 5: Error Resilience 🔴 P0 — Critical Path

**Goal**: App không bao giờ crash silent. Tất cả error path đều được catch, log, và hiển thị.

### 5.1 — React Error Boundary

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 5.1.1 | Tạo `ErrorBoundary` component với fallback UI, error logging, nút "Tải lại" | `src/renderer/src/components/ErrorBoundary.tsx` (MỚI) | P0 | ☐ |
| 5.1.2 | Bọc `<App>` trong ErrorBoundary | `src/renderer/src/main.tsx` (~line 8) | P0 | ☐ |
| 5.1.3 | Per-page ErrorBoundary cho Dashboard, BrowserProfiles, ProxyManagement, Extensions, Settings, ProfileGroups | `src/renderer/src/App.tsx` | P1 | ☐ |

### 5.2 — Thêm .catch() cho toàn bộ Promise Chains (Renderer)

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 5.2.1 | `.catch()` cho `window.api.profile*()` | `BrowserProfiles.tsx`, `Dashboard.tsx`, `App.tsx` | P0 | ☐ |
| 5.2.2 | `.catch()` cho `window.api.proxy*()` | `ProxyManagement.tsx` | P0 | ☐ |
| 5.2.3 | `.catch()` cho `window.api.extension*()` | `Extensions.tsx` | P0 | ☐ |
| 5.2.4 | `.catch()` cho `window.api.settings*()` | `Settings.tsx` | P0 | ☐ |
| 5.2.5 | `.catch()` cho `window.api.group*()` | `ProfileGroups.tsx` | P0 | ☐ |
| 5.2.6 | `.catch()` cho configExport/configImport | `BrowserProfiles.tsx` | P0 | ☐ |

### 5.3 — Main Process Error Handling

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 5.3.1 | Bọc `browserLauncher.stop()` trong try-catch, đảm bảo reset profile status nếu stop fails | `src/main/services/browser-launcher.ts` | P0 | ☐ |
| 5.3.2 | Bọc toàn bộ SQL execution trong `initDatabase()` với try-catch | `src/main/db/index.ts` | P0 | ☐ |
| 5.3.3 | Thay `String(error)` bằng `error instanceof Error ? error.message : String(error)` trong 24 IPC handler | `src/main/ipc-handlers.ts` | P0 | ☐ |
| 5.3.4 | Tạo error-logging utility: ghi structured JSON vào `LOGS_DIR/error-{date}.log` | `src/main/core/errors/errorLogger.ts` (MỚI) | P0 | ☐ |
| 5.3.5 | Wire errorLogger vào tất cả IPC handler catch blocks | `src/main/ipc-handlers.ts` | P0 | ☐ |
| 5.3.6 | Thêm try-catch quanh `ensureDirs()` và `initDatabase()` trong `app.whenReady()` | `src/main/index.ts` | P1 | ☐ |

### 5.4 — CRUD Service Error Safety

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 5.4.1 | Bọc từng hàm `profile-manager` với try-catch | `src/main/services/profile-manager.ts` | P1 | ☐ |
| 5.4.2 | Bọc từng hàm `proxy-manager` với try-catch | `src/main/services/proxy-manager.ts` | P1 | ☐ |
| 5.4.3 | Bọc từng hàm `group-manager` với try-catch | `src/main/services/group-manager.ts` | P1 | ☐ |
| 5.4.4 | Bọc từng hàm `settings-manager` với try-catch | `src/main/services/settings-manager.ts` | P1 | ☐ |
| 5.4.5 | Bọc từng hàm `extension-manager` với try-catch | `src/main/services/extension-manager.ts` | P1 | ☐ |

### 5.5 — Bug Fixes Cụ Thể

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 5.5.1 | Fix `testProxy`: Set không cleanup khi proxy not found — dùng try/finally | `ProxyManagement.tsx` (~127-148) | P0 | ☐ |
| 5.5.2 | Fix `handleReset`: thay `{} as UserSettings` bằng `defaultSettings` từ `@shared/types` | `Settings.tsx` (~129-138) | P0 | ☐ |
| 5.5.3 | Convert Extensions page từ local `useState` sang Zustand store | `Extensions.tsx` + `useExtensionStore.ts` (MỚI) | P1 | ☐ |

---

## Phase 6: Complete Stub Implementations 🔴 P0

**Goal**: Thay thế tất cả fake/simulated behavior bằng implementation thực tế.

### 6.1 — Real Proxy Testing & Latency

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 6.1.1 | Thay `AddProxyDrawer.handleTest()` fake setTimeout+random bằng real `window.api.proxyTest()` | `ProxyManagement.tsx` (~64-65) | P0 | ☐ |
| 6.1.2 | Thay `testProxy()` fake latency bằng real timing: `Date.now()` trước/sau API call | `ProxyManagement.tsx` (~133-136) | P0 | ☐ |
| 6.1.3 | Dùng `result.country` thực thay hardcoded `"—"`, hiển thị flag emoji | `ProxyManagement.tsx` (~121) | P0 | ☐ |
| 6.1.4 | Implement SOCKS5 proxy test dùng `socks-proxy-agent` | `proxy-manager.ts` (~67-70) | P1 | ☐ |

### 6.2 — Real Import/Export

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 6.2.1 | Implement `ImportDrawer` với real CSV/JSON parsing, validate, batch create, progress | `BrowserProfiles.tsx` (~83-96) | P0 | ☐ |
| 6.2.2 | Wire ImportDrawer open/close — `importDrawer` state chưa được set true | `BrowserProfiles.tsx` (~103, ~252) | P0 | ☐ |
| 6.2.3 | Implement proxy Export — export CSV/JSON | `ProxyManagement.tsx` (~182) | P1 | ☐ |
| 6.2.4 | Implement proxy Import — parse CSV/TXT, batch create | `ProxyManagement.tsx` (~183) | P1 | ☐ |

### 6.3 — Real Extension Installation

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 6.3.1 | Implement "Từ URL" tab — download CRX, lưu vào extensions dir, add DB | `Extensions.tsx` + `extension-manager.ts` | P1 | ☐ |
| 6.3.2 | Implement "Từ file" tab — file dialog `.crx`/`.xpi`, copy vào extensions dir | `Extensions.tsx` + `extension-manager.ts` | P1 | ☐ |
| 6.3.3 | Thêm IPC handlers `extension:install-from-url` và `extension:install-from-file` | `ipc-handlers.ts` + `preload/index.ts` | P1 | ☐ |

### 6.4 — Search Bar & Stubs Khác

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 6.4.1 | Wire Header search bar vào global search — filter profile/group/proxy | `Header.tsx` + `useUIStore.ts` | P1 | ☐ |
| 6.4.2 | Implement "Lưu nháp" button — localStorage hoặc drafts table | `CreateProfileDrawer.tsx` (~210) | P2 | ☐ |
| 6.4.3 | Implement Header profile button → user settings/account modal | `Header.tsx` (~151-161) | P2 | ☐ |
| 6.4.4 | Implement LogOut button → confirm dialog + clear session | `Header.tsx` (~157-160) | P2 | ☐ |

---

## Phase 7: Remove Mock Data 🔴 P0

**Goal**: Mọi UI hiển thị data thật từ database. Zero hardcoded values.

### 7.1 — Dashboard Real Data

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 7.1.1 | Thay `chartData` mock bằng real time-series từ event history, expose qua IPC `event:history` | `Dashboard.tsx` + `event-history.ts` (MỚI) | P0 | ☐ |
| 7.1.2 | Thay hardcoded `value: 0` error count bằng real error count từ errorLogger | `Dashboard.tsx` (~131) | P0 | ☐ |
| 7.1.3 | Thay activity feed mock bằng real event history (start/stop/create/delete) | `Dashboard.tsx` (~55-62) | P1 | ☐ |

### 7.2 — Header & Sidebar Real Data

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 7.2.1 | Thay hardcoded notifications bằng live event-driven từ main process eventBus | `Header.tsx` (~10-16) | P1 | ☐ |
| 7.2.2 | Thay hardcoded "Alex Kim" / "Gói Pro" bằng real user profile | `Header.tsx` + `Sidebar.tsx` | P1 | ☐ |
| 7.2.3 | Thay hardcoded "AK" initials bằng computed initials | `Header.tsx` + `Sidebar.tsx` | P2 | ☐ |

### 7.3 — Fingerprint & Extension Status Thật

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 7.3.1 | Tính fingerprint status thực dựa trên config profile | `BrowserProfiles.tsx` (~131) | P1 | ☐ |
| 7.3.2 | Tính real extension update count | `Extensions.tsx` (~144) | P2 | ☐ |
| 7.3.3 | Tính real extension size từ filesystem qua IPC `extension:size` | `Extensions.tsx` (~181) | P2 | ☐ |

### 7.4 — BrowserProfile Batch Operations

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 7.4.1 | Handle individual results `launchSelected` — collect success/failure, hiện lỗi | `BrowserProfiles.tsx` (~159-161) | P1 | ☐ |
| 7.4.2 | Handle individual results `stopSelected` | `BrowserProfiles.tsx` (~162) | P2 | ☐ |

---

## Phase 8: Fingerprint Management 🔴 P0

**Goal**: Áp dụng fingerprint spoofing (canvas, WebGL, audio, WebRTC, fonts, timezone, resolution) khi launch browser.

### 8.1 — Schema & Types

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 8.1.1 | Define `ProfileFingerprint` interface | `src/shared/types.ts` (MỚI) | P0 | ☐ |
| 8.1.2 | Thêm `fingerprint` column (JSON) vào profiles table | `src/main/db/schema.ts` + migration | P0 | ☐ |
| 8.1.3 | Thêm `fingerprint` field vào `Profile`, `CreateProfileDTO`, `UpdateProfileDTO` | `src/shared/types.ts` | P0 | ☐ |

### 8.2 — Fingerprint Application During Launch

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 8.2.1 | Build Playwright launch arg builder: translate fingerprint → Chromium CLI args | `fingerprint-applier.ts` (MỚI) | P0 | ☐ |
| 8.2.2 | Tích hợp fingerprint arg builder vào `PlaywrightRuntime.launch()` | `playwright-runtime.ts` | P0 | ☐ |
| 8.2.3 | Inject canvas/WebGL/Audio spoofing scripts qua `context.addInitScript()` | `fingerprint-scripts.ts` (MỚI) | P0 | ☐ |
| 8.2.4 | WebRTC leak protection | `playwright-runtime.ts` + `fingerprint-scripts.ts` | P1 | ☐ |
| 8.2.5 | Font fingerprint guard | `fingerprint-scripts.ts` | P1 | ☐ |
| 8.2.6 | Resolution override bằng `--window-size` + viewport | `playwright-runtime.ts` | P1 | ☐ |

### 8.3 — UI Integration

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 8.3.1 | Wire CreateProfileDrawer fingerprint toggles vào DTO (đang bị discard) | `CreateProfileDrawer.tsx` (~193-200) | P0 | ☐ |
| 8.3.2 | Wire EditProfileDrawer fingerprint toggles (onChange đang no-op) | `EditProfileDrawer.tsx` (~157-164) | P1 | ☐ |
| 8.3.3 | Load saved fingerprint vào EditProfileDrawer khi mở | `EditProfileDrawer.tsx` (~59-67) | P1 | ☐ |

---

## Phase 9: Extension Loading into Playwright 🟡 P1

**Goal**: Extensions trong DB được load thực tế vào Playwright browser context khi launch.

### 9.1 — Extension Storage & Resolution

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 9.1.1 | Define `EXTENSIONS_DIR` và ensure exists | `paths.ts` | P1 | ☐ |
| 9.1.2 | Lưu CRX file vào `EXTENSIONS_DIR/{ext.id}/`, ghi path vào DB | `extension-manager.ts` | P1 | ☐ |
| 9.1.3 | Thêm `installPath` field vào `AppExtension` type | `src/shared/types.ts` | P1 | ☐ |

### 9.2 — Loading Extensions at Launch

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 9.2.1 | `BrowserLauncher.launch()`: query enabled extensions, resolve paths, pass vào runtime | `browser-launcher.ts` | P1 | ☐ |
| 9.2.2 | `PlaywrightRuntime.launch()`: load qua `--load-extension=` / `--disable-extensions-except=` | `playwright-runtime.ts` | P1 | ☐ |
| 9.2.3 | Hỗ trợ unpacked extensions (directory-based) | `playwright-runtime.ts` | P1 | ☐ |
| 9.2.4 | Verify extensions loaded — log loaded IDs | `playwright-runtime.ts` | P2 | ☐ |

### 9.3 — Extension Sizing

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 9.3.1 | Thêm IPC handler `extension:size` | `ipc-handlers.ts` + `preload/index.ts` | P2 | ☐ |
| 9.3.2 | Hiển thị real file size thay `"—"` | `Extensions.tsx` (~181) | P2 | ☐ |

---

## Phase 10: Testing Infrastructure 🟡 P1

**Goal**: Thiết lập testing toàn diện với Vitest (unit/integration) và Playwright (E2E).

### 10.1 — Vitest Setup

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 10.1.1 | Cài `vitest`, `@vitest/ui`, `@vitest/coverage-v8` | `package.json` | P1 | ☐ |
| 10.1.2 | Tạo `vitest.config.main.ts` | (MỚI) | P1 | ☐ |
| 10.1.3 | Tạo `vitest.config.renderer.ts` | (MỚI) | P1 | ☐ |
| 10.1.4 | Thêm test scripts vào `package.json` | `package.json` | P1 | ☐ |

### 10.2 — Unit Tests (Main Process Services) — 8 files

| # | Test target | File | P | ✅ |
|---|---|---|---|---|
| 10.2.1 | profile-manager | `__tests__/profile-manager.test.ts` (MỚI) | P1 | ☐ |
| 10.2.2 | proxy-manager | `__tests__/proxy-manager.test.ts` (MỚI) | P1 | ☐ |
| 10.2.3 | group-manager | `__tests__/group-manager.test.ts` (MỚI) | P1 | ☐ |
| 10.2.4 | settings-manager | `__tests__/settings-manager.test.ts` (MỚI) | P1 | ☐ |
| 10.2.5 | extension-manager | `__tests__/extension-manager.test.ts` (MỚI) | P1 | ☐ |
| 10.2.6 | fingerprint-applier | `__tests__/fingerprint-applier.test.ts` (MỚI) | P2 | ☐ |
| 10.2.7 | process-manager | `__tests__/process-manager.test.ts` (MỚI) | P1 | ☐ |
| 10.2.8 | event-bus | `__tests__/event-bus.test.ts` (MỚI) | P1 | ☐ |

### 10.3 — Unit Tests (Renderer Stores) — 7 files

| # | Test target | File | P | ✅ |
|---|---|---|---|---|
| 10.3.1 | useProfileStore | `__tests__/useProfileStore.test.ts` (MỚI) | P1 | ☐ |
| 10.3.2 | useProxyStore | `__tests__/useProxyStore.test.ts` (MỚI) | P1 | ☐ |
| 10.3.3 | useGroupStore | `__tests__/useGroupStore.test.ts` (MỚI) | P1 | ☐ |
| 10.3.4 | useSettingsStore | `__tests__/useSettingsStore.test.ts` (MỚI) | P1 | ☐ |
| 10.3.5 | useToastStore | `__tests__/useToastStore.test.ts` (MỚI) | P1 | ☐ |
| 10.3.6 | useUIStore | `__tests__/useUIStore.test.ts` (MỚI) | P2 | ☐ |
| 10.3.7 | useExtensionStore | `__tests__/useExtensionStore.test.ts` (MỚI) | P2 | ☐ |

### 10.4 — Integration Tests — 4 files

| # | Test target | File | P | ✅ |
|---|---|---|---|---|
| 10.4.1 | IPC profile round-trip | `tests/integration/ipc-profiles.test.ts` (MỚI) | P1 | ☐ |
| 10.4.2 | IPC proxy round-trip | `tests/integration/ipc-proxies.test.ts` (MỚI) | P1 | ☐ |
| 10.4.3 | Config export/import | `tests/integration/config-export-import.test.ts` (MỚI) | P2 | ☐ |
| 10.4.4 | Browser launch error paths | `tests/integration/browser-launcher.test.ts` (MỚI) | P2 | ☐ |

### 10.5 — E2E Tests (Playwright) — 5 files

| # | Test target | File | P | ✅ |
|---|---|---|---|---|
| 10.5.1 | Playwright E2E config | `e2e/playwright.config.ts` (MỚI) | P2 | ☐ |
| 10.5.2 | App launch + navigation | `e2e/navigation.spec.ts` (MỚI) | P2 | ☐ |
| 10.5.3 | Profile CRUD + launch/stop | `e2e/profiles.spec.ts` (MỚI) | P2 | ☐ |
| 10.5.4 | Proxy CRUD + test | `e2e/proxies.spec.ts` (MỚI) | P2 | ☐ |
| 10.5.5 | Extension add/remove/toggle | `e2e/extensions.spec.ts` (MỚI) | P2 | ☐ |

---

## Phase 11: CI/CD & Production Readiness 🟡 P1

**Goal**: Automated quality gates, reliable updates, production-grade resilience.

### 11.1 — GitHub Actions

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 11.1.1 | CI workflow: typecheck → lint → format-check → test | `.github/workflows/ci.yml` (MỚI) | P1 | ☐ |
| 11.1.2 | Build workflow: Win/macOS/Linux on tag, upload artifacts | `.github/workflows/build.yml` (MỚI) | P2 | ☐ |
| 11.1.3 | Status badges vào README | `README.md` | P2 | ☐ |
| 11.1.4 | Dependabot config | `.github/dependabot.yml` (MỚI) | P2 | ☐ |

### 11.2 — Auto-Updater

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 11.2.1 | Wire `electron-updater` — check on startup + periodic | `updater.ts` (MỚI) + `index.ts` | P1 | ☐ |
| 11.2.2 | Update notification UI (banner + progress) | `UpdateBanner.tsx` (MỚI) + IPC `update:*` | P2 | ☐ |
| 11.2.3 | Config `electron-builder` publish (GitHub releases) | `electron-builder.yml` | P1 | ☐ |

### 11.3 — Crash Recovery & Log Management

| # | Task | File(s) | P | ✅ |
|---|---|---|---|---|
| 11.3.1 | Crash reporter: `render-process-gone`, `child-process-gone` | `src/main/index.ts` | P1 | ☐ |
| 11.3.2 | Auto-restart logic nếu main process crash | `src/main/index.ts` | P2 | ☐ |
| 11.3.3 | Log rotation cho errorLogger (N days hoặc N MB) | `errorLogger.ts` | P1 | ☐ |
| 11.3.4 | Stale lock check — reset running profiles về "stopped" khi app bị kill | `src/main/index.ts` | P1 | ☐ |

---

## Verification Checklist

- [ ] **Phase 5**: Throw error trong render → ErrorBoundary hiển thị. Stop browser khi process crash → không orphan process.
- [ ] **Phase 6**: Test proxy thực tế → latency/country chính xác. Import CSV → profiles xuất hiện.
- [ ] **Phase 7**: Dashboard chart từ event history thực. Sidebar tên người dùng từ settings.
- [ ] **Phase 8**: Launch profile fingerprint → `navigator.webglDriver` / canvas hash khác nhau.
- [ ] **Phase 9**: Launch profile với extension → extension trong Chrome toolbar.
- [ ] **Phase 10**: `npm test` pass tất cả. Coverage > 70%.
- [ ] **Phase 11**: Push commit → CI chạy. Tag release → build artifacts trên GitHub Releases.
