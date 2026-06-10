# Ollo App — Implementation Tasks

## Phase 1: Backend Foundation ✅

- [x] Step 1: Tạo `group-manager.ts` service + IPC `group:*` + preload API
- [x] Step 2: Tạo `useGroupStore` + wire ProfileGroups page
- [x] Step 3: Tạo `settings-manager.ts` service + IPC `settings:*` + preload API
- [x] Step 4: Tạo `useSettingsStore` + wire Settings page
- [x] Step 5: Wire BrowserProfiles & ProxyManagement, xoá mock fallback

---

## Phase 2: Real Data & Dashboard ✅

- [x] Step 6: Dashboard KPI từ store thật (profiles, proxies, groups, chart, activity)
- [x] Step 7: Tạo `EditProfileDrawer` (reuse CreateProfileDrawer pattern, pre-filled data)
- [x] Step 8: Profile duplication (`profile:duplicate` IPC + UI context menu + toolbar)

---

## Phase 3: Animations & Polish ✅

- [x] Step 9: Cài Framer Motion + tạo animation variants (`src/lib/animations.ts`)
- [x] Step 10: Animate Sidebar (stagger, layoutId activeNav), Cards (hoverScale), Drawers (slideInRight + backdrop), StatusBadge (pulse), Dashboard (stagger KPI)
- [x] Step 11: Figma detail parity — loading skeletons (TableSkeleton, CardSkeleton), empty states, loading state on BrowserProfiles

---

## Phase 4: Extensions & Advanced ✅

- [x] Step 12: Extension manager service + IPC + wire Extensions page
- [x] Step 13: Bulk import/export JSON qua file dialog thực tế
- [x] Step 14: Server-side search, filter, sort, pagination (`profile:query`)

---

## Bug Fixes

- [x] Profile launch/stop không cập nhật UI status
- [x] Proxy không sửa được (thiếu store update + UI edit)
- [x] CreateProfile không truyền groupId + toast không hiện
- [x] Theme light: hover không background, select option đen
- [x] Vân tay badge: tiếng Việt + không xuống dòng
- [x] Font đồng nhất Inter toàn bộ
- [x] Badge Nhóm hiển thị màu theo màu nhóm
- [x] Group page: layout gọn hơn (4 cột, card nhỏ)
