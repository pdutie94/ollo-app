import { useState } from "react";
import { toast } from "sonner";
import { Plus, Upload, Trash2, ExternalLink, AlertCircle, X } from "lucide-react";

const catalogExtensions = [
  { name: "Privacy Badger", icon: "🦡", version: "2024.1.4", description: "Blocks invisible trackers automatically" },
  { name: "uBlock Origin", icon: "🛑", version: "1.57.2", description: "Wide-spectrum content blocker" },
  { name: "EditThisCookie", icon: "🍪", version: "1.5.0", description: "Edit, import, and export cookies" },
  { name: "Fingerprint Defender", icon: "🖐️", version: "0.2.0", description: "Advanced fingerprint randomization" },
  { name: "IP Address & Domain Information", icon: "🌐", version: "4.0.3", description: "Quick IP lookup and geo info" },
];

function AddExtensionModal({ onClose, onAdd }: { onClose: () => void; onAdd: (e: { name: string; version: string; description: string; icon: string; enabled: boolean; profileCount: number; size: string; updateAvailable: boolean }) => void }) {
  const [tab, setTab] = useState<"catalog" | "url" | "file">("catalog");
  const [url, setUrl] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const handleAdd = () => {
    if (tab === "catalog" && selected) {
      const ext = catalogExtensions.find((e) => e.name === selected);
      if (!ext) return;
      onAdd({ ...ext, id: `ext-${Date.now()}`, enabled: true, profileCount: 0, size: "< 1 MB", updateAvailable: false } as any);
      toast.success(`"${ext.name}" installed`);
      onClose();
    } else if (tab === "url") {
      if (!url.trim()) { toast.error("Enter an extension URL"); return; }
      toast.success("Extension installed from URL");
      onClose();
    } else {
      toast.success("Extension installed from file");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)", width: 500, boxShadow: "0 20px 48px rgba(0,0,0,0.6)", fontFamily: "Inter, sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Add Extension</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={16} color="var(--muted-foreground)" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 p-1 rounded-lg" style={{ background: "var(--accent)" }}>
          {(["catalog", "url", "file"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-1.5 rounded-md capitalize transition-all" style={{ background: tab === t ? "var(--card)" : "transparent", border: "none", color: tab === t ? "#fff" : "var(--muted-foreground)", fontSize: 12, fontWeight: tab === t ? 500 : 400, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              {t === "url" ? "From URL" : t === "file" ? "From File" : "Catalog"}
            </button>
          ))}
        </div>

        {tab === "catalog" && (
          <div className="flex flex-col gap-2" style={{ maxHeight: 280, overflowY: "auto" }}>
            {catalogExtensions.map((ext) => (
              <button
                key={ext.name}
                onClick={() => setSelected(ext.name)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all w-full"
                style={{
                  background: selected === ext.name ? "rgba(79,124,255,0.12)" : "var(--accent)",
                  border: selected === ext.name ? "1px solid var(--primary)" : "1px solid transparent",
                  cursor: "pointer",
                }}
              >
                <span className="rounded-lg flex items-center justify-center text-lg" style={{ width: 36, height: 36, background: "var(--card)", flexShrink: 0 }}>{ext.icon}</span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{ext.name}</p>
                  <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>{ext.description}</p>
                </div>
                <span style={{ fontSize: 10, color: "var(--muted-foreground)", fontFamily: "JetBrains Mono, monospace", flexShrink: 0 }}>v{ext.version}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "url" && (
          <div className="flex flex-col gap-3">
            <div>
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6 }}>Chrome Web Store URL</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://chromewebstore.google.com/detail/..." style={{ width: "100%", background: "var(--accent)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 12, fontFamily: "JetBrains Mono, monospace", outline: "none", boxSizing: "border-box" }} />
            </div>
            <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Paste a Chrome Web Store or Firefox Add-ons URL</p>
          </div>
        )}

        {tab === "file" && (
          <div
            className="rounded-xl flex flex-col items-center justify-center gap-3"
            style={{ height: 140, border: "2px dashed var(--border)", background: "var(--accent)", cursor: "pointer" }}
            onClick={handleAdd}
          >
            <Upload size={24} color="var(--muted-foreground)" />
            <div className="text-center">
              <p style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>Drop .crx or .xpi here</p>
              <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>or click to browse</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end mt-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Cancel</button>
          <button onClick={handleAdd} className="rounded-lg px-4 py-2" style={{ background: "var(--primary)", border: "none", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            {tab === "catalog" ? (selected ? `Install "${selected}"` : "Select an extension") : "Install"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface Extension {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  enabled: boolean;
  profileCount: number;
  size: string;
  updateAvailable: boolean;
}

const initialExtensions: Extension[] = [
  { id: "1", name: "Cookie Manager Pro", version: "2.4.1", description: "Manage cookies across browser sessions with import/export capabilities", icon: "🍪", enabled: true, profileCount: 847, size: "2.3 MB", updateAvailable: false },
  { id: "2", name: "User-Agent Switcher", version: "3.1.0", description: "Rotate and spoof browser user-agent strings automatically", icon: "🔄", enabled: true, profileCount: 1284, size: "890 KB", updateAvailable: true },
  { id: "3", name: "Canvas Blocker", version: "1.8.5", description: "Blocks and randomizes canvas fingerprinting scripts", icon: "🛡️", enabled: true, profileCount: 623, size: "1.1 MB", updateAvailable: false },
  { id: "4", name: "WebRTC Leak Shield", version: "2.0.3", description: "Prevents WebRTC IP leaks and local network exposure", icon: "🔒", enabled: true, profileCount: 912, size: "670 KB", updateAvailable: true },
  { id: "5", name: "Proxy Helper", version: "1.2.0", description: "Quick proxy configuration and switching per tab", icon: "🌐", enabled: false, profileCount: 234, size: "1.4 MB", updateAvailable: false },
  { id: "6", name: "Audio Context Spoofer", version: "1.0.4", description: "Randomizes audio fingerprint to prevent tracking", icon: "🎵", enabled: true, profileCount: 445, size: "560 KB", updateAvailable: false },
  { id: "7", name: "Font Fingerprint Guard", version: "1.3.2", description: "Masks installed font list to prevent font-based tracking", icon: "🔤", enabled: false, profileCount: 178, size: "430 KB", updateAvailable: true },
  { id: "8", name: "TimeZone Spoofer", version: "2.1.0", description: "Override browser timezone to match proxy location", icon: "🕐", enabled: true, profileCount: 567, size: "320 KB", updateAvailable: false },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="rounded-full transition-all"
      style={{
        width: 36,
        height: 20,
        background: on ? "var(--primary)" : "var(--border)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <span
        className="absolute rounded-full transition-all"
        style={{
          width: 14,
          height: 14,
          background: "#fff",
          top: 3,
          left: on ? 19 : 3,
        }}
      />
    </button>
  );
}

export function Extensions() {
  const [extensions, setExtensions] = useState<Extension[]>(initialExtensions);
  const [filter, setFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [addModal, setAddModal] = useState(false);

  const toggleExtension = (id: string) => {
    setExtensions((exts) =>
      exts.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
    );
  };

  const removeExtension = (id: string) => {
    const ext = extensions.find((e) => e.id === id);
    setExtensions((exts) => exts.filter((e) => e.id !== id));
    toast.success(`"${ext?.name}" removed`);
  };

  const filtered = extensions.filter((e) => {
    if (filter === "enabled") return e.enabled;
    if (filter === "disabled") return !e.enabled;
    return true;
  });

  const enabledCount = extensions.filter((e) => e.enabled).length;
  const updateCount = extensions.filter((e) => e.updateAvailable).length;

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "Inter, sans-serif" }}>
      <div
        className="px-6 pt-5 pb-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff" }}>Extensions</h1>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
              {extensions.length} installed · {enabledCount} enabled
              {updateCount > 0 && (
                <span style={{ color: "#F59E0B", marginLeft: 8 }}>
                  · {updateCount} update{updateCount > 1 ? "s" : ""} available
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toast.info("Select a .crx or .xpi file to import")}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            >
              <Upload size={14} />
              Import
            </button>
            <button
              onClick={() => setAddModal(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2"
              style={{ background: "var(--primary)", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            >
              <Plus size={15} />
              Add Extension
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          {(["all", "enabled", "disabled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-md px-3 py-1.5 capitalize transition-all"
              style={{
                background: filter === f ? "rgba(79,124,255,0.15)" : "transparent",
                color: filter === f ? "var(--primary)" : "var(--muted-foreground)",
                border: "none",
                fontSize: 12,
                fontWeight: filter === f ? 500 : 400,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {/* Update banner */}
        {updateCount > 0 && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
          >
            <AlertCircle size={16} color="#F59E0B" />
            <p style={{ fontSize: 13, color: "#F59E0B", flex: 1 }}>
              {updateCount} extension{updateCount > 1 ? "s" : ""} have updates available
            </p>
            <button
              className="rounded-lg px-3 py-1"
              style={{ background: "#F59E0B", color: "#000", border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              Update All
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {filtered.map((ext) => (
            <div
              key={ext.id}
              className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                opacity: ext.enabled ? 1 : 0.6,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(79,124,255,0.3)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")
              }
            >
              {/* Icon */}
              <div
                className="rounded-xl flex items-center justify-center shrink-0"
                style={{ width: 44, height: 44, background: "var(--accent)", fontSize: 22 }}
              >
                {ext.icon}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                    {ext.name}
                  </span>
                  <span
                    className="px-1.5 py-0.5 rounded"
                    style={{ background: "var(--accent)", fontSize: 10, color: "var(--muted-foreground)", fontFamily: "JetBrains Mono, monospace" }}
                  >
                    v{ext.version}
                  </span>
                  {ext.updateAvailable && (
                    <span
                      className="px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B", fontSize: 10, fontWeight: 500 }}
                    >
                      Update
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {ext.description}
                </p>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                    {ext.profileCount.toLocaleString()}
                  </p>
                  <p style={{ fontSize: 10, color: "var(--muted-foreground)" }}>profiles</p>
                </div>
                <div className="text-right">
                  <p style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "JetBrains Mono, monospace" }}>
                    {ext.size}
                  </p>
                  <p style={{ fontSize: 10, color: "rgba(161,168,181,0.5)" }}>size</p>
                </div>

                <Toggle on={ext.enabled} onChange={() => toggleExtension(ext.id)} />

                <div className="flex items-center gap-1">
                  <button
                    className="rounded-lg p-1.5 transition-all"
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                  >
                    <ExternalLink size={13} color="var(--muted-foreground)" />
                  </button>
                  <button
                    className="rounded-lg p-1.5 transition-all"
                    style={{ background: "transparent", border: "none", cursor: "pointer" }}
                    onClick={() => removeExtension(ext.id)}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                  >
                    <Trash2 size={13} color="#EF4444" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {addModal && (
        <AddExtensionModal
          onClose={() => setAddModal(false)}
          onAdd={(ext) => setExtensions((es) => [{ ...ext, id: `ext-${Date.now()}` } as any, ...es])}
        />
      )}
    </div>
  );
}
