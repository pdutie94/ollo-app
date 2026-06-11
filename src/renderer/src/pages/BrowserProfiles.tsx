import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Play, Square, Copy, Trash2, Upload, Download, Search,
  MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft,
  ChevronRight, X, AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { CreateProfileDrawer } from "@/components/CreateProfileDrawer";
import { EditProfileDrawer } from "@/components/EditProfileDrawer";
import { useProfileStore } from "@/store/useProfileStore";
import { useGroupStore } from "@/store/useGroupStore";
import { useProxyStore } from "@/store/useProxyStore";
import { useToastStore } from "@/store/useToastStore";
import type { Profile, Group, Proxy } from "@shared/types";

const fingerprintColors: Record<string, { bg: string; text: string; label: string }> = {
  Verified: { bg: "rgba(34,197,94,0.12)", text: "#22C55E", label: "Xác thực" },
  Warning: { bg: "rgba(245,158,11,0.12)", text: "#F59E0B", label: "Cảnh báo" },
  Unknown: { bg: "rgba(107,114,128,0.12)", text: "#6B7280", label: "Không rõ" },
};

function DeleteConfirmDrawer({ count, onConfirm, onCancel }: { count: number; onConfirm: () => void; onCancel: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onCancel} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col w-[480px] bg-[var(--card)] border-l border-[var(--border)] font-inter">
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">Xoá {count} profile?</h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Hành động này không thể hoàn tác</p>
          </div>
          <button onClick={onCancel} className="rounded-lg p-1.5 bg-transparent border-none cursor-pointer text-[var(--muted-foreground)]"><X size={18} /></button>
        </div>
        <div className="flex-1 px-6 py-5">
          <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <div className="rounded-lg flex items-center justify-center shrink-0 w-8 h-8" style={{ background: "rgba(239,68,68,0.12)" }}><AlertTriangle size={16} color="#EF4444" /></div>
            <p className="text-xs text-[#EF4444]">Toàn bộ dữ liệu phiên, cookie, fingerprint của {count} profile sẽ bị xoá vĩnh viễn.</p>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-t border-[var(--border)]">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] text-[13px] font-medium cursor-pointer">Huỷ</button>
          <button onClick={onConfirm} className="rounded-lg px-4 py-2 bg-[#EF4444] border-none text-[var(--destructive-foreground)] text-[13px] font-medium cursor-pointer">Xoá {count} profile</button>
        </div>
      </div>
    </>
  );
}

function ImportDrawer({ onClose }: { onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const addToast = useToastStore((s) => s.addToast);
  const setProfiles = useProfileStore((s) => s.setProfiles);

  const handleImport = async () => {
    setImporting(true);
    const res = await window.api.profileImportFile();
    setImporting(false);
    if (res.success && res.data) {
      const count = (res.data as { count: number }).count;
      addToast(`Đã import ${count} profile`, "success");
      window.api.profileList().then((r) => { if (r.success && r.data) setProfiles(r.data as Profile[]); }).catch((err) => console.error("Failed to reload profiles:", err));
      onClose();
    } else if (res.error !== "Import cancelled") {
      addToast(res.error ?? "Import thất bại", "error");
    }
  };
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col w-[480px] bg-[var(--card)] border-l border-[var(--border)] font-inter">
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Import Profile</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 bg-transparent border-none cursor-pointer text-[var(--muted-foreground)]"><X size={18} /></button>
        </div>
        <div className="flex-1 px-6 py-5">
          <div className="rounded-xl flex flex-col items-center justify-center gap-3 h-40 cursor-pointer"
            style={{ border: `2px dashed ${dragging ? "var(--primary)" : "var(--border)"}`, background: dragging ? "rgba(79,124,255,0.06)" : "var(--accent)" }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); handleImport(); }} onClick={handleImport}>
            <Upload size={28} color={dragging ? "var(--primary)" : "var(--muted-foreground)"} />
            <p className="text-[13px] font-medium" style={{ color: dragging ? "var(--primary)" : "#fff" }}>Thả CSV hoặc JSON vào đây</p>
            <p className="text-xs text-[var(--muted-foreground)]">hoặc click để chọn file</p>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-4">Hỗ trợ CSV, JSON · Tối đa 10.000 profile mỗi lần</p>
        </div>
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-t border-[var(--border)]">
          <button onClick={onClose} disabled={importing} className="rounded-lg px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] text-[13px] cursor-pointer">Huỷ</button>
          <button onClick={handleImport} disabled={importing} className="rounded-lg px-4 py-2 bg-[var(--primary)] border-none text-[var(--primary-foreground)] text-[13px] font-medium cursor-pointer">{importing ? "Đang import..." : "Chọn File"}</button>
        </div>
      </div>
    </>
  );
}

export function BrowserProfiles() {
  const profiles = useProfileStore((s) => s.profiles);
  const runningProfileIds = useProfileStore((s) => s.runningProfileIds);
  const setProfiles = useProfileStore((s) => s.setProfiles);
  const removeProfile = useProfileStore((s) => s.removeProfile);
  const setProfileRunning = useProfileStore((s) => s.setProfileRunning);
  const setProfileStopped = useProfileStore((s) => s.setProfileStopped);
  const addToast = useToastStore((s) => s.addToast);
  const groups = useGroupStore((s) => s.groups);
  const setGroups = useGroupStore((s) => s.setGroups);
  const proxies = useProxyStore((s) => s.proxies);
  const setProxies = useProxyStore((s) => s.setProxies);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number; up: boolean } | null>(null);
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [page, setPage] = useState(1);
  const [deleteDrawer, setDeleteDrawer] = useState<string[] | null>(null);
  const [importDrawer, setImportDrawer] = useState(false);
  const [editProfileId, setEditProfileId] = useState<string | null>(null);
  const PER_PAGE = 8;

  useEffect(() => {
    window.api.profileList().then((res) => { if (res.success && res.data) setProfiles(res.data as Profile[]); }).catch((err) => console.error("Failed to load profiles:", err));
    window.api.groupList().then((res) => { if (res.success && res.data) setGroups(res.data as Group[]); }).catch((err) => console.error("Failed to load groups:", err));
    window.api.proxyList().then((res) => { if (res.success && res.data) setProxies(res.data as Proxy[]); }).catch((err) => console.error("Failed to load proxies:", err));
  }, []);

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return "Chưa phân loại";
    const g = groups.find((gr) => gr.id === groupId);
    return g ? g.name : "Chưa phân loại";
  };

  const getGroupColor = (groupId: string | null) => {
    if (!groupId) return "var(--accent)";
    const g = groups.find((gr) => gr.id === groupId);
    return g?.color ? g.color + "28" : "var(--accent)";
  };

  const getProxyHost = (proxyId: string | null) => {
    if (!proxyId) return "—";
    const p = proxies.find((px) => px.id === proxyId);
    return p ? `${p.host}:${p.port}` : "—";
  };

  const displayProfiles = profiles.map((p) => ({
    id: p.id,
    name: p.name,
    group: getGroupName(p.groupId),
    groupId: p.groupId,
    proxy: getProxyHost(p.proxyId),
    browser: p.userAgent ? p.userAgent.slice(0, 30) + (p.userAgent.length > 30 ? "..." : "") : "—",
    fingerprint: "Verified" as const,
    status: (runningProfileIds.includes(p.id) ? "running" : "stopped") as "running" | "stopped" | "error" | "pending",
    lastActive: new Date(p.updatedAt).toLocaleDateString("vi-VN"),
  }));

  const editProfile = editProfileId ? profiles.find((p) => p.id === editProfileId) : null;

  const statusMap: Record<string, string> = { "Tất cả": "All", "Đang chạy": "running", "Đã dừng": "stopped", "Lỗi": "error", "Đang chờ": "pending" };
  const filtered = displayProfiles.filter((p) => { const s = statusMap[statusFilter] || "All"; return p.name.toLowerCase().includes(search.toLowerCase()) && (s === "All" || p.status === s); });
  const sorted = sortCol ? [...filtered].sort((a, b) => { const va = String(a[sortCol as keyof typeof a] ?? ""); const vb = String(b[sortCol as keyof typeof b] ?? ""); return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va); }) : filtered;
  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(sorted.length / PER_PAGE);

  const toggleSort = (col: string) => { if (sortCol === col) setSortDir(sortDir === "asc" ? "desc" : "asc"); else { setSortCol(col); setSortDir("asc"); } };
  const toggleSelect = (id: string) => { const next = new Set(selected); if (next.has(id)) next.delete(id); else next.add(id); setSelected(next); };
  const toggleAll = () => { if (selected.size === paginated.length) setSelected(new Set()); else setSelected(new Set(paginated.map((p) => p.id))); };
  const SortIcon = ({ col }: { col: string }) => { if (sortCol !== col) return <ChevronDown size={12} color="rgba(161,168,181,0.4)" />; return sortDir === "asc" ? <ChevronUp size={12} color="var(--primary)" /> : <ChevronDown size={12} color="var(--primary)" />; };

  const launchSingle = async (id: string) => { const res = await window.api.profileLaunch(id); if (res.success) setProfileRunning(id); addToast(res.success ? "Đã chạy profile" : (res.error ?? "Thất bại"), res.success ? "success" : "error"); setActiveMenu(null); };
  const stopSingle = async (id: string) => { const res = await window.api.profileStop(id); if (res.success) setProfileStopped(id); setActiveMenu(null); };
  const launchSelected = async () => { for (const id of selected) await window.api.profileLaunch(id); addToast(`Đã chạy ${selected.size} profile`, "success"); setSelected(new Set()); };
  const stopSelected = async () => { for (const id of selected) await window.api.profileStop(id); setSelected(new Set()); };
  const duplicateSelected = async () => {
    for (const id of selected) { await window.api.profileDuplicate(id); }
    const res = await window.api.profileList();
    if (res.success && res.data) setProfiles(res.data as Profile[]);
    addToast(`Đã nhân bản ${selected.size} profile`, "success");
    setSelected(new Set());
  };
  const handleExport = async () => {
    const res = await window.api.configExport();
    if (res.success) addToast("Đã export cấu hình ra JSON", "success");
    else addToast(res.error ?? "Export thất bại", "error");
  };
  const handleImportOpen = () => setImportDrawer(true);
  const deleteSelected = async () => { if (!deleteDrawer) return; const res = await window.api.profileBulkDelete(deleteDrawer); if (res.success) { deleteDrawer.forEach((id) => removeProfile(id)); addToast(`Đã xoá ${deleteDrawer.length} profile`, "success"); } setSelected(new Set()); setDeleteDrawer(null); setActiveMenu(null); };
  const deleteSingle = async (id: string) => { const res = await window.api.profileDelete(id); if (res.success) { removeProfile(id); addToast("Đã xoá profile", "success"); } setActiveMenu(null); };
  const duplicateSingle = async (id: string) => {
    const res = await window.api.profileDuplicate(id);
    if (res.success && res.data) {
      addToast("Đã nhân bản profile", "success");
      window.api.profileList().then((r) => { if (r.success && r.data) setProfiles(r.data as Profile[]); }).catch((err) => console.error("Failed to reload profiles:", err));
    } else {
      addToast(res.error ?? "Nhân bản thất bại", "error");
    }
    setActiveMenu(null);
  };

  let tableBodyContent: React.ReactNode;
  if (paginated.length === 0) {
    tableBodyContent = <tr><td colSpan={9} className="py-12 text-center"><p className="text-sm text-[var(--muted-foreground)]">Không tìm thấy profile</p></td></tr>;
  } else {
    tableBodyContent = paginated.map((profile, i) => {
      const isSelected = selected.has(profile.id);
      const running = profile.status === "running";
      const fp = fingerprintColors[profile.fingerprint] || fingerprintColors.Unknown;
      const rowBg = isSelected ? "rgba(79,124,255,0.06)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)";
      return (
        <tr key={profile.id} className="border-b border-[var(--border)]" style={{ background: rowBg }}>
          <td className="sticky left-0 z-[1] px-4 py-2.5 text-center" style={{ background: isSelected ? "var(--card)" : "var(--background)" }}><input type="checkbox" checked={isSelected} onChange={() => toggleSelect(profile.id)} className="accent-[var(--primary)] cursor-pointer" /></td>
          <td className="sticky left-[45px] z-[1] px-3 py-2.5" style={{ background: isSelected ? "var(--card)" : "var(--background)" }}><span className="text-[13px] font-medium text-[var(--foreground)] font-inter">{profile.name}</span></td>
          <td className="px-3 py-2.5"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs whitespace-nowrap" style={{ background: getGroupColor(profile.groupId), color: groups.find((g) => g.id === profile.groupId)?.color ?? "var(--muted-foreground)" }}>{profile.group}</span></td>
          <td className="px-3 py-2.5 text-xs text-[var(--muted-foreground)]">{profile.proxy}</td>
          <td className="px-3 py-2.5 text-xs text-[var(--muted-foreground)]">{profile.browser}</td>
          <td className="px-3 py-2.5"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap" style={{ background: fp.bg, color: fp.text }}>{fp.label}</span></td>
          <td className="px-3 py-2.5"><StatusBadge status={profile.status} /></td>
          <td className="px-3 py-2.5 text-xs text-[var(--muted-foreground)]">{profile.lastActive}</td>
          <td className="sticky right-0 z-[1] px-3 py-2.5" style={{ background: isSelected ? "var(--card)" : "var(--background)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1">
              <button className="rounded p-1.5 bg-transparent border-none cursor-pointer"
                onClick={() => running ? stopSingle(profile.id) : launchSingle(profile.id)}>
                {running ? <Square size={13} color="#EF4444" /> : <Play size={13} color="#22C55E" />}
              </button>
              <div>
                <button className="bg-transparent border-none cursor-pointer rounded p-1.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeMenu === profile.id) { setActiveMenu(null); return; }
                    const btn = e.currentTarget;
                    const r = btn.getBoundingClientRect();
                    const menuH = 138;
                    const spaceBelow = window.innerHeight - r.bottom;
                    const up = spaceBelow < menuH;
                    setMenuPos({ top: up ? r.top - menuH : r.bottom, right: window.innerWidth - r.right, up });
                    setActiveMenu(profile.id);
                  }}>
                  <MoreHorizontal size={13} color="var(--muted-foreground)" />
                </button>
              </div>
            </div>
          </td>
        </tr>
      );
    });
  }

  return (
    <div className="flex flex-col h-full font-inter" onClick={() => setActiveMenu(null)}>
      <div className="px-6 pt-5 pb-0 shrink-0 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--foreground)]">Profile</h1>
            <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">{displayProfiles.length} tổng · {displayProfiles.filter((p) => p.status === "running").length} đang chạy</p>
          </div>
          <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] border-none text-[13px] font-medium cursor-pointer">
            <Plus size={15} /> Tạo Profile
          </button>
        </div>
        <div className="flex items-center gap-2 pb-3">
          {selected.size > 0 && <div className="flex items-center gap-1 rounded-lg px-3 py-1.5 mr-1" style={{ background: "rgba(79,124,255,0.1)", border: "1px solid rgba(79,124,255,0.3)" }}><span className="text-xs text-[var(--primary)] font-medium">Đã chọn {selected.size}</span></div>}
          <ToolbarBtn icon={Play} label="Chạy" disabled={selected.size === 0} onClick={launchSelected} />
          <ToolbarBtn icon={Square} label="Dừng" disabled={selected.size === 0} onClick={stopSelected} />
          <ToolbarBtn icon={Copy} label="Nhân bản" disabled={selected.size === 0} onClick={duplicateSelected} />
          <ToolbarBtn icon={Trash2} label="Xoá" disabled={selected.size === 0} danger onClick={() => setDeleteDrawer([...selected])} />
          <div className="w-px h-5 bg-[var(--border)] mx-1" />
          <ToolbarBtn icon={Upload} label="Import" onClick={handleImportOpen} />
          <ToolbarBtn icon={Download} label="Export" onClick={handleExport} />
          <div className="flex items-center gap-2 ml-auto rounded-lg px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] min-w-[220px]">
            <Search size={13} color="var(--muted-foreground)" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Lọc profile..." className="bg-transparent border-none outline-none text-[var(--foreground)] text-xs font-inter w-full" />
            {search && <button onClick={() => setSearch("")} className="bg-none border-none cursor-pointer p-0 text-[var(--muted-foreground)]"><X size={12} /></button>}
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--muted-foreground)] text-xs font-inter outline-none appearance-none cursor-pointer"
              style={{ padding: "6px 28px 6px 10px" }}>
              {["Tất cả", "Đang chạy", "Đã dừng", "Lỗi", "Đang chờ"].map((s) => <option key={s} className="bg-\[var\(--popover\)\]">{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto relative">
        <div className="min-w-[900px]">
        <table className="w-full border-collapse">
          <thead><tr className="bg-[var(--card)]">
            <th className="sticky left-0 z-[3] bg-[var(--card)] w-10 px-4 py-2.5 text-center border-b border-[var(--border)]"><input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={toggleAll} className="accent-[var(--primary)] cursor-pointer" /></th>
            <th onClick={() => toggleSort("name")} className="sticky left-[45px] z-[3] bg-[var(--card)] px-3 py-2.5 text-left text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase cursor-pointer whitespace-nowrap border-b border-[var(--border)]">
              <div className="flex items-center gap-1">Tên Profile <SortIcon col="name" /></div>
            </th>
            {[{ key: "group", label: "Nhóm" }, { key: "proxy", label: "Proxy" }, { key: "browser", label: "Trình duyệt" }, { key: "fingerprint", label: "Vân tay" }, { key: "status", label: "Trạng thái" }, { key: "lastActive", label: "Gần nhất" }].map((col) => (
              <th key={col.key} onClick={() => toggleSort(col.key)} className="px-3 py-2.5 text-left text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase cursor-pointer whitespace-nowrap border-b border-[var(--border)]">
                <div className="flex items-center gap-1">{col.label} <SortIcon col={col.key} /></div>
              </th>
            ))}
            <th className="sticky right-0 z-[3] bg-[var(--card)] w-20 px-3 py-2.5 border-b border-[var(--border)]" />
          </tr></thead>
          <tbody>{tableBodyContent}</tbody>
        </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 shrink-0 border-t border-[var(--border)]">
          <span className="text-xs text-[var(--muted-foreground)]">{sorted.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, sorted.length)} / {sorted.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg p-1.5 border border-[var(--border)] cursor-pointer"
              style={{ color: page === 1 ? "rgba(161,168,181,0.3)" : "var(--muted-foreground)" }}><ChevronLeft size={14} /></button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i + 1} onClick={() => setPage(i + 1)} className="rounded-lg w-8 h-8 border border-[var(--border)] text-xs cursor-pointer"
                style={{ background: page === i + 1 ? "var(--primary)" : "transparent", color: page === i + 1 ? "#fff" : "var(--muted-foreground)" }}>{i + 1}</button>
            ))}
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-lg p-1.5 border border-[var(--border)] cursor-pointer"
              style={{ color: page === totalPages ? "rgba(161,168,181,0.3)" : "var(--muted-foreground)" }}><ChevronRight size={14} /></button>
          </div>
        </div>
      )}

      <CreateProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      {editProfile && <EditProfileDrawer profile={editProfile} onClose={() => setEditProfileId(null)} />}
      {deleteDrawer && <DeleteConfirmDrawer count={deleteDrawer.length} onConfirm={deleteSelected} onCancel={() => setDeleteDrawer(null)} />}
      {importDrawer && <ImportDrawer onClose={() => setImportDrawer(false)} />}
      {activeMenu && menuPos && createPortal(
        <div className="fixed z-[9999] rounded-lg py-1 border border-[var(--border)] bg-[var(--popover)] shadow-lg min-w-[140px]"
          style={{ top: menuPos.top, right: menuPos.right }}>
          {(() => {
            const isRunning = runningProfileIds.includes(activeMenu);
            return (<>
              <MenuItem label={isRunning ? "Dừng" : "Chạy"} color={isRunning ? "#EF4444" : "#22C55E"} onClick={() => { isRunning ? stopSingle(activeMenu) : launchSingle(activeMenu); }} />
              <MenuItem label="Sửa" onClick={() => { setEditProfileId(activeMenu); setActiveMenu(null); }} />
              <MenuItem label="Nhân bản" onClick={() => { duplicateSingle(activeMenu); }} />
              <MenuItem label="Xoá" color="#EF4444" onClick={() => { deleteSingle(activeMenu); }} />
            </>);
          })()}
        </div>,
        document.body
      )}
    </div>
  );
}

function MenuItem({ label, color, onClick }: { label: string; color?: string; onClick: () => void }) {
  return (
    <button className="w-full text-left px-3 py-2 bg-transparent border-none text-xs cursor-pointer block hover:bg-[var(--accent)]"
      style={{ color: color || "var(--muted-foreground)" }}
      onClick={onClick}>{label}</button>
  );
}

function ToolbarBtn({ icon: Icon, label, disabled = false, danger = false, onClick }: { icon: React.ElementType; label: string; disabled?: boolean; danger?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
      style={{
        background: disabled ? "transparent" : danger ? "rgba(239,68,68,0.08)" : "var(--card)",
        border: `1px solid ${danger && !disabled ? "rgba(239,68,68,0.25)" : "var(--border)"}`,
        color: disabled ? "rgba(161,168,181,0.35)" : danger ? "#EF4444" : "var(--muted-foreground)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}>
      <Icon size={13} /> {label}
    </button>
  );
}
