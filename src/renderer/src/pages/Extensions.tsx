import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Upload, Trash2, AlertCircle, X, ExternalLink } from "lucide-react";
import { useExtensionStore } from "@/store/useExtensionStore";
import type { AppExtension } from "@shared/types";

const catalogExtensions = [
  { name: "Privacy Badger", icon: "🦡", version: "2024.1.4", description: "Tự động chặn tracker" },
  { name: "uBlock Origin", icon: "🛑", version: "1.57.2", description: "Trình chặn nội dung" },
  { name: "EditThisCookie", icon: "🍪", version: "1.5.0", description: "Chỉnh sửa, import, export cookie" },
  { name: "Fingerprint Defender", icon: "🖐️", version: "0.2.0", description: "Ngẫu nhiên hoá fingerprint" },
  { name: "IP Address & Domain", icon: "🌐", version: "4.0.3", description: "Tra cứu IP và geo" },
];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="rounded-full border-none cursor-pointer relative shrink-0"
      style={{ width: 36, height: 20, background: on ? "var(--primary)" : "var(--border)" }}>
      <span className="absolute rounded-full top-[3px] w-3.5 h-3.5 bg-white transition-all" style={{ left: on ? 19 : 3 }} />
    </button>
  );
}

function AddExtensionDrawer({ onClose, onInstalled }: { onClose: () => void; onInstalled: () => void }) {
  const [tab, setTab] = useState<"catalog" | "url" | "file">("catalog");
  const [url, setUrl] = useState(""); const [selected, setSelected] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);

  const handleAdd = async () => {
    setInstalling(true);
    try {
      if (tab === "catalog" && selected) {
        const cat = catalogExtensions.find((e) => e.name === selected);
        if (!cat) return;
        const res = await window.api.extensionAdd({ name: cat.name, version: cat.version, description: cat.description, icon: cat.icon, enabled: true });
        if (res.success && res.data) {
          toast.success(`Đã cài "${cat.name}"`);
          onInstalled();
          onClose();
        } else {
          toast.error(res.error || "Cài đặt thất bại");
        }
      } else if (tab === "url") {
        if (!url.trim()) { toast.error("Nhập URL tiện ích"); return; }
        const res = await window.api.extensionInstallFromUrl(url.trim());
        if (res.success) {
          toast.success("Đã cài tiện ích từ URL");
          onInstalled();
          onClose();
        } else {
          toast.error(res.error || "Cài đặt thất bại");
        }
      } else {
        const res = await window.api.extensionInstallFromFile();
        if (res.success) {
          toast.success("Đã cài tiện ích từ file");
          onInstalled();
          onClose();
        } else if (res.error !== "Cancelled") {
          toast.error(res.error || "Cài đặt thất bại");
        }
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col w-[500px] bg-[var(--card)] border-l border-[var(--border)]">
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[var(--border)]">
          <div><h2 className="text-base font-semibold text-[var(--foreground)]">Thêm tiện ích</h2></div>
          <button onClick={onClose} className="rounded-lg p-1.5 bg-transparent border-none cursor-pointer text-[var(--muted-foreground)]"><X size={18} /></button>
        </div>
        <div className="flex gap-1 mx-6 mt-3 p-1 rounded-lg bg-[var(--accent)]">
          {(["catalog", "url", "file"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-1.5 rounded-md capitalize text-xs border-none cursor-pointer"
              style={{ background: tab === t ? "var(--card)" : "transparent", color: tab === t ? "var(--primary)" : "var(--muted-foreground)", fontWeight: tab === t ? 500 : 400 }}>
              {t === "url" ? "Từ URL" : t === "file" ? "Từ file" : "Danh mục"}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === "catalog" && (
            <div className="flex flex-col gap-2">
              {catalogExtensions.map((ext) => (
                <button key={ext.name} onClick={() => setSelected(ext.name)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left w-full cursor-pointer"
                  style={{ background: selected === ext.name ? "rgba(79,124,255,0.12)" : "var(--accent)", border: selected === ext.name ? "1px solid var(--primary)" : "1px solid transparent" }}>
                  <span className="rounded-lg flex items-center justify-center w-9 h-9 bg-[var(--card)] text-lg">{ext.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--foreground)]">{ext.name}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{ext.description}</p>
                  </div>
                  <span className="text-[10px] text-[var(--muted-foreground)] font-inter">v{ext.version}</span>
                </button>
              ))}
            </div>
          )}
          {tab === "url" && (
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">URL Chrome Web Store</label>
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://chromewebstore.google.com/detail/..."
                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-xs font-inter outline-none" />
            </div>
          )}
          {tab === "file" && (
            <div className="rounded-xl flex flex-col items-center justify-center gap-3 h-40 bg-[var(--accent)] border-2 border-dashed border-[var(--border)] cursor-pointer" onClick={handleAdd}>
              <Upload size={24} color="var(--muted-foreground)" />
              <p className="text-[13px] font-medium text-[var(--foreground)]">Thả .crx hoặc .xpi vào đây</p>
              <p className="text-xs text-[var(--muted-foreground)]">hoặc click để chọn file</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-t border-[var(--border)]">
          <button onClick={onClose} className="rounded-lg px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] text-[13px] cursor-pointer">Huỷ</button>
          <button onClick={handleAdd} className="rounded-lg px-4 py-2 bg-[var(--primary)] border-none text-[var(--primary-foreground)] text-[13px] font-medium cursor-pointer">
            {installing ? "Đang cài đặt..." : tab === "catalog" ? (selected ? `Cài "${selected}"` : "Chọn tiện ích") : "Cài đặt"}
          </button>
        </div>
      </div>
    </>
  );
}

export function Extensions() {
  const extensions = useExtensionStore((s) => s.extensions);
  const setExtensions = useExtensionStore((s) => s.setExtensions);
  const removeExtFromStore = useExtensionStore((s) => s.removeExtension);
  const toggleExtInStore = useExtensionStore((s) => s.toggleExtension);
  const [filter, setFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [addDrawer, setAddDrawer] = useState(false);

  useEffect(() => {
    window.api.extensionList().then((res) => { if (res.success && res.data) setExtensions(res.data as AppExtension[]); }).catch((err) => console.error("Failed to load extensions:", err));
  }, []);

  const toggleExtension = async (id: string, current: boolean) => {
    const res = await window.api.extensionToggle(id, !current);
    if (res.success && res.data) {
      toggleExtInStore(id, !current);
      setExtensions(extensions.map((e) => (e.id === id ? (res.data as AppExtension) : e)));
    }
  };

  const removeExtension = async (id: string) => {
    const ext = extensions.find((e) => e.id === id);
    const res = await window.api.extensionRemove(id);
    if (res.success) {
      removeExtFromStore(id);
      toast.success(`Đã xoá "${ext?.name}"`);
    } else {
      toast.error(res.error || "Xoá thất bại");
    }
  };

  // 9.3.2: Load real file sizes for extensions
  const [sizeMap, setSizeMap] = useState<Record<string, string>>({});
  useEffect(() => {
    const loadSizes = async () => {
      const map: Record<string, string> = {};
      for (const ext of extensions) {
        if (ext.installPath) {
          try {
            const res = await window.api.extensionSize(ext.id);
            if (res.success && res.data) {
              map[ext.id] = (res.data as { formatted: string }).formatted;
            }
          } catch { /* ignore */ }
        }
      }
      setSizeMap(map);
    };
    loadSizes();
  }, [extensions]);

  const getExtensionSize = (ext: AppExtension): string => {
    if (sizeMap[ext.id]) return sizeMap[ext.id];
    return '—';
  };

  const filtered = extensions.filter((e) => { if (filter === "enabled") return e.enabled; if (filter === "disabled") return !e.enabled; return true; });
  const enabledCount = extensions.filter((e) => e.enabled).length;
  const updateCount = 0;

  return (
    <div className="flex flex-col h-full font-inter">
      <div className="px-6 pt-5 pb-4 shrink-0 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--foreground)]">Tiện ích</h1>
            <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">
              {extensions.length} đã cài · {enabledCount} đang bật{updateCount > 0 && <span className="text-[#F59E0B] ml-2">· {updateCount} bản cập nhật</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={async () => {
              const res = await window.api.extensionInstallFromFile();
              if (res.success) {
                toast.success("Đã import tiện ích");
                window.api.extensionList().then((r) => { if (r.success && r.data) setExtensions(r.data as AppExtension[]); });
              } else if (res.error !== "Cancelled") {
                toast.error(res.error || "Import thất bại");
              }
            }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] text-[13px] font-medium cursor-pointer">
              <Upload size={14} /> Import
            </button>
            <button onClick={() => setAddDrawer(true)} className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] border-none text-[13px] font-medium cursor-pointer">
              <Plus size={15} /> Thêm tiện ích
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {(["all", "enabled", "disabled"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="rounded-md px-3 py-1.5 capitalize text-xs border-none cursor-pointer"
              style={{ background: filter === f ? "rgba(79,124,255,0.15)" : "transparent", color: filter === f ? "var(--primary)" : "var(--muted-foreground)", fontWeight: filter === f ? 500 : 400 }}>
              {f === "all" ? "Tất cả" : f === "enabled" ? "Đang bật" : "Đã tắt"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {updateCount > 0 && (
          <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-4" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
            <AlertCircle size={16} color="#F59E0B" />
            <p className="text-[13px] text-[#F59E0B] flex-1">{updateCount} tiện ích có bản cập nhật</p>
            <button className="rounded-lg px-3 py-1 bg-[#F59E0B] text-black border-none text-xs font-semibold cursor-pointer">Cập nhật tất cả</button>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {filtered.map((ext) => (
            <div key={ext.id} className="flex items-center gap-4 rounded-xl px-4 py-3 bg-[var(--card)] border border-[var(--border)] transition-colors"
              style={{ opacity: ext.enabled ? 1 : 0.6 }}
              onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(79,124,255,0.3)"}
              onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"}>
              <div className="rounded-xl flex items-center justify-center shrink-0 w-11 h-11 bg-[var(--accent)] text-[22px]">{ext.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--foreground)]">{ext.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] text-[var(--muted-foreground)] font-inter" style={{ background: "var(--accent)" }}>v{ext.version}</span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{ext.description}</p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <p className="text-xs text-[var(--muted-foreground)] font-inter">{getExtensionSize(ext)}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)]/60">dung lượng</p>
                </div>
                <Toggle on={ext.enabled} onChange={() => toggleExtension(ext.id, ext.enabled)} />
                <div className="flex items-center gap-1">
                  <button className="rounded-lg p-1.5 bg-transparent border-none cursor-pointer"><ExternalLink size={13} color="var(--muted-foreground)" /></button>
                  <button className="rounded-lg p-1.5 bg-transparent border-none cursor-pointer" onClick={() => removeExtension(ext.id)}><Trash2 size={13} color="#EF4444" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {addDrawer && <AddExtensionDrawer onClose={() => setAddDrawer(false)} onInstalled={() => {
        window.api.extensionList().then((res) => { if (res.success && res.data) setExtensions(res.data as AppExtension[]); }).catch((err) => console.error("Failed to reload extensions:", err));
      }} />}
    </div>
  );
}
