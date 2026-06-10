import { useState } from "react";
import { toast } from "sonner";
import {
  Plus, Play, Square, Copy, Trash2, Upload, Download, Search,
  Filter, MoreHorizontal, ChevronDown, ChevronUp, ChevronLeft,
  ChevronRight, X, AlertTriangle,
} from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { CreateProfileDrawer } from "./CreateProfileDrawer";

type Status = "running" | "stopped" | "error" | "pending";

interface Profile {
  id: string;
  name: string;
  group: string;
  proxy: string;
  browser: string;
  fingerprint: "Verified" | "Warning" | "Unknown";
  status: Status;
  lastActive: string;
}

const initialProfiles: Profile[] = [
  { id: "1", name: "US-Chrome-Marketing-001", group: "Marketing", proxy: "Residential-US-12", browser: "Chrome 120", fingerprint: "Verified", status: "running", lastActive: "2m ago" },
  { id: "2", name: "EU-Firefox-Scraping-023", group: "Scraping", proxy: "Datacenter-DE-04", browser: "Firefox 121", fingerprint: "Verified", status: "running", lastActive: "5m ago" },
  { id: "3", name: "APAC-Chrome-Testing-118", group: "Testing", proxy: "Residential-JP-07", browser: "Chrome 119", fingerprint: "Warning", status: "stopped", lastActive: "1h ago" },
  { id: "4", name: "UK-Edge-Research-007", group: "Research", proxy: "None", browser: "Edge 120", fingerprint: "Verified", status: "stopped", lastActive: "3h ago" },
  { id: "5", name: "US-Chrome-Social-042", group: "Marketing", proxy: "Residential-US-33", browser: "Chrome 120", fingerprint: "Unknown", status: "error", lastActive: "6h ago" },
  { id: "6", name: "CN-Chrome-E-Commerce-009", group: "Scraping", proxy: "Residential-CN-02", browser: "Chrome 118", fingerprint: "Verified", status: "running", lastActive: "8m ago" },
  { id: "7", name: "US-Chromium-Dev-055", group: "Testing", proxy: "Datacenter-US-19", browser: "Chromium 120", fingerprint: "Verified", status: "pending", lastActive: "12m ago" },
  { id: "8", name: "BR-Chrome-Analytics-031", group: "Marketing", proxy: "Residential-BR-11", browser: "Chrome 120", fingerprint: "Verified", status: "stopped", lastActive: "2d ago" },
  { id: "9", name: "IN-Chrome-Research-088", group: "Research", proxy: "Datacenter-IN-06", browser: "Chrome 119", fingerprint: "Warning", status: "running", lastActive: "15m ago" },
  { id: "10", name: "AU-Firefox-Testing-017", group: "Testing", proxy: "None", browser: "Firefox 120", fingerprint: "Verified", status: "stopped", lastActive: "1d ago" },
  { id: "11", name: "CA-Chrome-Marketing-076", group: "Marketing", proxy: "Residential-CA-08", browser: "Chrome 120", fingerprint: "Verified", status: "running", lastActive: "3m ago" },
  { id: "12", name: "FR-Edge-Scraping-004", group: "Scraping", proxy: "Residential-FR-15", browser: "Edge 119", fingerprint: "Verified", status: "stopped", lastActive: "5h ago" },
];

const fingerprintColors: Record<string, { bg: string; text: string }> = {
  Verified: { bg: "rgba(34,197,94,0.12)", text: "#22C55E" },
  Warning: { bg: "rgba(245,158,11,0.12)", text: "#F59E0B" },
  Unknown: { bg: "rgba(107,114,128,0.12)", text: "#6B7280" },
};

function DeleteConfirmModal({
  count,
  onConfirm,
  onCancel,
}: {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)" }}
      onClick={onCancel}
    >
      <div
        className="rounded-2xl p-6"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          width: 400,
          boxShadow: "0 20px 48px rgba(0,0,0,0.6)",
          fontFamily: "Inter, sans-serif",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl flex items-center justify-center" style={{ width: 40, height: 40, background: "rgba(239,68,68,0.12)" }}>
            <AlertTriangle size={20} color="#EF4444" />
          </div>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Delete {count} profile{count > 1 ? "s" : ""}?</h2>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>This action cannot be undone.</p>
          </div>
        </div>
        <div className="rounded-xl px-4 py-3 mb-5" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p style={{ fontSize: 12, color: "#EF4444" }}>
            All sessions, cookies, and fingerprint data for {count === 1 ? "this profile" : `these ${count} profiles`} will be permanently erased.
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2"
            style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg px-4 py-2"
            style={{ background: "#EF4444", border: "none", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            Delete {count > 1 ? `${count} profiles` : "profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportModal({ onClose }: { onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleImport = () => {
    setImporting(true);
    setTimeout(() => {
      onClose();
      toast.success("50 profiles imported successfully");
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)", width: 440, boxShadow: "0 20px 48px rgba(0,0,0,0.6)", fontFamily: "Inter, sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Import Profiles</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={16} color="var(--muted-foreground)" />
          </button>
        </div>

        <div
          className="rounded-xl flex flex-col items-center justify-center gap-3 mb-4"
          style={{
            height: 140,
            border: `2px dashed ${dragging ? "var(--primary)" : "var(--border)"}`,
            background: dragging ? "rgba(79,124,255,0.06)" : "var(--accent)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); handleImport(); }}
          onClick={handleImport}
        >
          <Upload size={24} color={dragging ? "var(--primary)" : "var(--muted-foreground)"} />
          <div className="text-center">
            <p style={{ fontSize: 13, fontWeight: 500, color: dragging ? "var(--primary)" : "#fff" }}>
              {importing ? "Importing..." : "Drop CSV or JSON here"}
            </p>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
              or click to browse
            </p>
          </div>
          {importing && (
            <div className="rounded-full overflow-hidden" style={{ width: 180, height: 3, background: "var(--border)" }}>
              <div
                className="rounded-full"
                style={{ width: "60%", height: 3, background: "var(--primary)", animation: "pulse 1s infinite" }}
              />
            </div>
          )}
        </div>

        <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginBottom: 16 }}>
          Supported formats: CSV, JSON · Max 10,000 profiles per import
        </p>

        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="rounded-lg px-4 py-2" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={handleImport} className="rounded-lg px-4 py-2" style={{ background: "var(--primary)", border: "none", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }} disabled={importing}>
            {importing ? "Importing..." : "Choose File"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BrowserProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<keyof Profile | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [deleteModal, setDeleteModal] = useState<string[] | null>(null);
  const [importModal, setImportModal] = useState(false);
  const PER_PAGE = 8;

  const filtered = profiles.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.group.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const sorted = sortCol
    ? [...filtered].sort((a, b) => {
        const va = a[sortCol] as string;
        const vb = b[sortCol] as string;
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      })
    : filtered;

  const paginated = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(sorted.length / PER_PAGE);

  const toggleSort = (col: keyof Profile) => {
    if (sortCol === col) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((p) => p.id)));
  };

  const launchSelected = () => {
    setProfiles((ps) =>
      ps.map((p) => selected.has(p.id) ? { ...p, status: "running", lastActive: "Just now" } : p)
    );
    toast.success(`${selected.size} profile${selected.size > 1 ? "s" : ""} launched`);
    setSelected(new Set());
  };

  const stopSelected = () => {
    setProfiles((ps) =>
      ps.map((p) => selected.has(p.id) ? { ...p, status: "stopped" } : p)
    );
    toast.success(`${selected.size} profile${selected.size > 1 ? "s" : ""} stopped`);
    setSelected(new Set());
  };

  const cloneSelected = () => {
    const toClone = profiles.filter((p) => selected.has(p.id));
    const clones: Profile[] = toClone.map((p) => ({
      ...p,
      id: `clone-${Date.now()}-${p.id}`,
      name: `${p.name}-copy`,
      status: "stopped" as Status,
      lastActive: "Never",
    }));
    setProfiles((ps) => [...ps, ...clones]);
    toast.success(`${clones.length} profile${clones.length > 1 ? "s" : ""} cloned`);
    setSelected(new Set());
  };

  const confirmDelete = () => {
    if (!deleteModal) return;
    setProfiles((ps) => ps.filter((p) => !deleteModal.includes(p.id)));
    toast.success(`${deleteModal.length} profile${deleteModal.length > 1 ? "s" : ""} deleted`);
    setSelected(new Set());
    setDeleteModal(null);
    setActiveMenu(null);
  };

  const launchSingle = (id: string) => {
    setProfiles((ps) =>
      ps.map((p) => p.id === id ? { ...p, status: "running", lastActive: "Just now" } : p)
    );
    toast.success("Profile launched");
    setActiveMenu(null);
  };

  const cloneSingle = (profile: Profile) => {
    const clone: Profile = {
      ...profile,
      id: `clone-${Date.now()}`,
      name: `${profile.name}-copy`,
      status: "stopped",
      lastActive: "Never",
    };
    setProfiles((ps) => [...ps, clone]);
    toast.success("Profile cloned");
    setActiveMenu(null);
  };

  const SortIcon = ({ col }: { col: keyof Profile }) => {
    if (sortCol !== col) return <ChevronDown size={12} color="rgba(161,168,181,0.4)" />;
    return sortDir === "asc" ? <ChevronUp size={12} color="var(--primary)" /> : <ChevronDown size={12} color="var(--primary)" />;
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "Inter, sans-serif" }} onClick={() => { setActiveMenu(null); }}>
      {/* Page title + toolbar */}
      <div className="px-6 pt-5 pb-0 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff" }}>Browser Profiles</h1>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
              {profiles.length} total · {profiles.filter((p) => p.status === "running").length} running
            </p>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2"
            style={{ background: "var(--primary)", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            <Plus size={15} />
            Create Profile
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 pb-3">
          {selected.size > 0 && (
            <div
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 mr-1"
              style={{ background: "rgba(79,124,255,0.1)", border: "1px solid rgba(79,124,255,0.3)" }}
            >
              <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>{selected.size} selected</span>
            </div>
          )}

          <ToolbarBtn icon={Play} label="Launch" disabled={selected.size === 0} onClick={launchSelected} />
          <ToolbarBtn icon={Square} label="Stop" disabled={selected.size === 0} onClick={stopSelected} />
          <ToolbarBtn icon={Copy} label="Clone" disabled={selected.size === 0} onClick={cloneSelected} />
          <ToolbarBtn icon={Trash2} label="Delete" disabled={selected.size === 0} danger onClick={() => setDeleteModal([...selected])} />

          <div style={{ width: 1, height: 20, background: "var(--border)", margin: "0 4px" }} />

          <ToolbarBtn icon={Upload} label="Import" onClick={() => setImportModal(true)} />
          <ToolbarBtn
            icon={Download}
            label="Export"
            onClick={() => toast.success("Exported 12 profiles to CSV")}
          />

          <div className="flex items-center gap-2 ml-auto rounded-lg px-3 py-1.5" style={{ background: "var(--card)", border: "1px solid var(--border)", minWidth: 220 }}>
            <Search size={13} color="var(--muted-foreground)" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Filter profiles..."
              style={{ background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 12, fontFamily: "Inter, sans-serif", width: "100%" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <X size={12} color="var(--muted-foreground)" />
              </button>
            )}
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 28px 6px 10px", color: "var(--muted-foreground)", fontSize: 12, fontFamily: "Inter, sans-serif", outline: "none", appearance: "none", cursor: "pointer" }}
            >
              {["All", "Running", "Stopped", "Error", "Pending"].map((s) => (
                <option key={s} style={{ background: "#1C2130" }}>{s}</option>
              ))}
            </select>
            <Filter size={12} color="var(--muted-foreground)" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--card)" }}>
              <th style={{ width: 40, padding: "10px 16px", textAlign: "center" }}>
                <input
                  type="checkbox"
                  checked={selected.size === paginated.length && paginated.length > 0}
                  onChange={toggleAll}
                  style={{ accentColor: "var(--primary)", cursor: "pointer" }}
                />
              </th>
              {[
                { key: "name", label: "Profile Name" },
                { key: "group", label: "Group" },
                { key: "proxy", label: "Proxy" },
                { key: "browser", label: "Browser" },
                { key: "fingerprint", label: "Fingerprint" },
                { key: "status", label: "Status" },
                { key: "lastActive", label: "Last Active" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key as keyof Profile)}
                  style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", fontFamily: "Inter, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap", borderBottom: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key as keyof Profile} />
                  </div>
                </th>
              ))}
              <th style={{ width: 80, padding: "10px 12px", borderBottom: "1px solid var(--border)" }} />
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: "48px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 14, color: "var(--muted-foreground)", fontFamily: "Inter, sans-serif" }}>
                    No profiles found
                  </p>
                </td>
              </tr>
            ) : (
              paginated.map((profile, i) => {
                const isSelected = selected.has(profile.id);
                const fp = fingerprintColors[profile.fingerprint];
                return (
                  <tr
                    key={profile.id}
                    style={{ background: isSelected ? "rgba(79,124,255,0.06)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)", borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                    onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)"; }}
                  >
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(profile.id)} style={{ accentColor: "var(--primary)", cursor: "pointer" }} />
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#fff", fontFamily: "JetBrains Mono, monospace", letterSpacing: "-0.01em" }}>
                        {profile.name}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span className="inline-flex items-center px-2 py-0.5 rounded" style={{ background: "var(--accent)", fontSize: 11, color: "var(--muted-foreground)", fontFamily: "Inter, sans-serif" }}>
                        {profile.group}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--muted-foreground)", fontFamily: "Inter, sans-serif" }}>{profile.proxy}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--muted-foreground)", fontFamily: "Inter, sans-serif" }}>{profile.browser}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full" style={{ background: fp.bg, color: fp.text, fontSize: 11, fontWeight: 500, fontFamily: "Inter, sans-serif" }}>
                        {profile.fingerprint}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px" }}><StatusBadge status={profile.status} /></td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: "var(--muted-foreground)", fontFamily: "Inter, sans-serif" }}>{profile.lastActive}</td>
                    <td style={{ padding: "10px 12px" }} onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <button
                          className="rounded p-1.5 transition-all"
                          title={profile.status === "running" ? "Stop" : "Launch"}
                          style={{ background: "transparent", border: "none", cursor: "pointer" }}
                          onClick={() => launchSingle(profile.id)}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(34,197,94,0.1)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                        >
                          {profile.status === "running"
                            ? <Square size={13} color="#EF4444" />
                            : <Play size={13} color="#22C55E" />}
                        </button>
                        <div className="relative">
                          <button
                            className="rounded p-1.5 transition-all"
                            style={{ background: "transparent", border: "none", cursor: "pointer" }}
                            onClick={() => setActiveMenu(activeMenu === profile.id ? null : profile.id)}
                            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)")}
                            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                          >
                            <MoreHorizontal size={13} color="var(--muted-foreground)" />
                          </button>
                          {activeMenu === profile.id && (
                            <div className="absolute right-0 z-50 rounded-lg py-1" style={{ top: "100%", background: "var(--popover)", border: "1px solid var(--border)", minWidth: 140, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                              {[
                                { label: profile.status === "running" ? "Stop" : "Launch", color: profile.status === "running" ? "#EF4444" : "#22C55E", action: () => launchSingle(profile.id) },
                                { label: "Edit", action: () => { setDrawerOpen(true); setActiveMenu(null); } },
                                { label: "Clone", action: () => cloneSingle(profile) },
                                { label: "Delete", color: "#EF4444", action: () => { setDeleteModal([profile.id]); setActiveMenu(null); } },
                              ].map((item) => (
                                <button
                                  key={item.label}
                                  className="w-full text-left px-3 py-2 transition-all"
                                  style={{ background: "transparent", border: "none", color: item.color || "var(--muted-foreground)", fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer", display: "block" }}
                                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)")}
                                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                                  onClick={item.action}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
        <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          Showing {sorted.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, sorted.length)} of {sorted.length}
        </span>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="rounded-lg p-1.5" style={{ background: "transparent", border: "1px solid var(--border)", color: page === 1 ? "rgba(161,168,181,0.3)" : "var(--muted-foreground)", cursor: page === 1 ? "not-allowed" : "pointer" }}>
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} onClick={() => setPage(i + 1)} className="rounded-lg w-8 h-8" style={{ background: page === i + 1 ? "var(--primary)" : "transparent", border: "1px solid var(--border)", color: page === i + 1 ? "#fff" : "var(--muted-foreground)", fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer" }}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="rounded-lg p-1.5" style={{ background: "transparent", border: "1px solid var(--border)", color: page === totalPages ? "rgba(161,168,181,0.3)" : "var(--muted-foreground)", cursor: page === totalPages ? "not-allowed" : "pointer" }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <CreateProfileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {deleteModal && (
        <DeleteConfirmModal
          count={deleteModal.length}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal(null)}
        />
      )}
      {importModal && <ImportModal onClose={() => setImportModal(false)} />}
    </div>
  );
}

function ToolbarBtn({
  icon: Icon,
  label,
  disabled = false,
  danger = false,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all"
      style={{
        background: disabled ? "transparent" : danger ? "rgba(239,68,68,0.08)" : "var(--card)",
        border: `1px solid ${danger && !disabled ? "rgba(239,68,68,0.25)" : "var(--border)"}`,
        color: disabled ? "rgba(161,168,181,0.35)" : danger ? "#EF4444" : "var(--muted-foreground)",
        fontSize: 12,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}
