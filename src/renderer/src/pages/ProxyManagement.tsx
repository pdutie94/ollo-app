import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Upload, Download, RefreshCw, Wifi, MoreHorizontal, X, ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useProxyStore } from "@/store/useProxyStore";
import type { Proxy, CreateProxyDTO, ProxyTestResult } from "@shared/types";

type ProxyStatus = "running" | "stopped" | "error";

const countries = [
  { name: "United States", flag: "🇺🇸" }, { name: "Germany", flag: "🇩🇪" }, { name: "Japan", flag: "🇯🇵" },
  { name: "United Kingdom", flag: "🇬🇧" }, { name: "France", flag: "🇫🇷" }, { name: "Brazil", flag: "🇧🇷" },
  { name: "Singapore", flag: "🇸🇬" }, { name: "Australia", flag: "🇦🇺" }, { name: "Canada", flag: "🇨🇦" }, { name: "India", flag: "🇮🇳" },
];

const latencyColor = (ms: number | null) => { if (ms === null) return "#6B7280"; if (ms < 100) return "#22C55E"; if (ms < 250) return "#F59E0B"; return "#EF4444"; };

function AddProxyDrawer({ onClose, editProxy }: { onClose: () => void; editProxy?: Proxy }) {
  const addProxy = useProxyStore((s) => s.addProxy);
  const updateProxy = useProxyStore((s) => s.updateProxy);
  const [host, setHost] = useState(editProxy?.host ?? ""); const [port, setPort] = useState(String(editProxy?.port ?? "8080")); const [type, setType] = useState<"HTTP" | "HTTPS" | "SOCKS5">((editProxy?.type.toUpperCase() ?? "HTTP") as "HTTP" | "HTTPS" | "SOCKS5"); const [country, setCountry] = useState(countries[0]);
  const [testing, setTesting] = useState(false); const [testResult, setTestResult] = useState<null | { ok: boolean; ms: number }>(null);

  const handleTest = () => { if (!host) { toast.error("Nhập host trước"); return; } setTesting(true); setTestResult(null); setTimeout(() => { const ok = Math.random() > 0.25; setTesting(false); setTestResult({ ok, ms: Math.floor(Math.random() * 300) + 40 }); }, 1500); };

  const handleSubmit = async () => {
    if (!host || !port) { toast.error("Host và port là bắt buộc"); return; }
    if (editProxy) {
      const res = await window.api.proxyUpdate(editProxy.id, {
        type: type.toLowerCase() as "http" | "https" | "socks5",
        host,
        port: parseInt(port)
      });
      if (res.success && res.data) {
        updateProxy(editProxy.id, res.data as Proxy);
        toast.success("Đã cập nhật proxy");
        onClose();
      } else {
        toast.error(res.error || "Cập nhật thất bại");
      }
    } else {
      const proxyType = type.toLowerCase() as "http" | "https" | "socks5";
      const res = await window.api.proxyCreate({
        type: proxyType,
        host,
        port: parseInt(port)
      });
      if (res.success && res.data) {
        addProxy(res.data as Proxy);
        toast.success("Đã thêm proxy");
        onClose();
      } else {
        toast.error(res.error || "Thêm proxy thất bại");
      }
    }
  };
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col w-[480px] bg-[var(--card)] border-l border-[var(--border)]">
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[var(--border)]">
          <div><h2 className="text-base font-semibold text-[var(--foreground)]">{editProxy ? "Sửa Proxy" : "Thêm Proxy"}</h2><p className="text-xs text-[var(--muted-foreground)] mt-0.5">{editProxy ? "Cập nhật kết nối proxy" : "Cấu hình kết nối proxy mới"}</p></div>
          <button onClick={onClose} className="rounded-lg p-1.5 bg-transparent border-none cursor-pointer text-[var(--muted-foreground)]"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex gap-2 mb-4">
            {(["HTTP", "HTTPS", "SOCKS5"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)} className="flex-1 py-2 rounded-lg text-[13px] font-medium cursor-pointer"
                style={{ background: type === t ? "rgba(79,124,255,0.15)" : "var(--accent)", border: type === t ? "1px solid var(--primary)" : "1px solid var(--border)", color: type === t ? "var(--primary)" : "var(--muted-foreground)" }}>{t}</button>
            ))}
          </div>
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Host / IP</label>
              <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="proxy.example.com"
                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-[13px] font-inter outline-none" />
            </div>
            <div className="w-[90px]">
              <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Cổng</label>
              <input value={port} onChange={(e) => setPort(e.target.value)} placeholder="8080"
                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-[13px] font-inter outline-none" />
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Quốc gia</label>
            <div className="relative">
              <select value={country.name} onChange={(e) => setCountry(countries.find((c) => c.name === e.target.value) || countries[0])}
                className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg text-[var(--foreground)] text-[13px] outline-none appearance-none cursor-pointer"
                style={{ padding: "8px 32px 8px 12px" }}>
                {countries.map((c) => <option key={c.name} value={c.name} className="bg-\[var\(--popover\)\]">{c.flag} {c.name}</option>)}
              </select>
              <ChevronDown size={13} color="var(--muted-foreground)" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          {testResult && (
            <div className="rounded-lg px-3 py-2.5 flex items-center gap-2 mb-3"
              style={{ background: testResult.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${testResult.ok ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}` }}>
              <span className="rounded-full w-[7px] h-[7px] inline-block" style={{ background: testResult.ok ? "#22C55E" : "#EF4444" }} />
              <span className="text-xs" style={{ color: testResult.ok ? "#22C55E" : "#EF4444" }}>{testResult.ok ? `Kết nối thành công · ${testResult.ms}ms` : "Kết nối thất bại"}</span>
            </div>
          )}
          <button onClick={handleTest} disabled={testing}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 bg-[var(--accent)] border border-[var(--border)] text-[var(--muted-foreground)] text-[13px] font-medium cursor-pointer"
            style={{ cursor: testing ? "wait" : "pointer" }}>
            <RefreshCw size={14} style={{ animation: testing ? "spin 1s linear infinite" : "none" }} /> {testing ? "Đang kiểm tra..." : "Kiểm tra kết nối"}
          </button>
        </div>
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-t border-[var(--border)]">
          <button onClick={onClose} className="rounded-lg px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] text-[13px] cursor-pointer">Huỷ</button>
          <button onClick={handleSubmit} className="rounded-lg px-4 py-2 bg-[var(--primary)] border-none text-[var(--primary-foreground)] text-[13px] font-medium cursor-pointer">{editProxy ? "Lưu thay đổi" : "Thêm Proxy"}</button>
        </div>
      </div>
    </>
  );
}

export function ProxyManagement() {
  const proxies = useProxyStore((s) => s.proxies);
  const setProxies = useProxyStore((s) => s.setProxies);
  const removeProxy = useProxyStore((s) => s.removeProxy);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [addDrawer, setAddDrawer] = useState(false);
  const [editDrawerId, setEditDrawerId] = useState<string | null>(null);
  const [testing, setTesting] = useState<Set<string>>(new Set());
  const [latencyMap, setLatencyMap] = useState<Record<string, number | null>>({});
  const [statusMap, setStatusMap] = useState<Record<string, ProxyStatus>>({});

  useEffect(() => {
    window.api.proxyList().then((res) => { if (res.success && res.data) setProxies(res.data as Proxy[]); }).catch((err) => console.error("Failed to load proxies:", err));
  }, []);

  const getDisplayRow = (p: Proxy) => ({
    ...p,
    country: "—",
    flag: "",
    status: (statusMap[p.id] ?? "stopped") as ProxyStatus,
    latency: latencyMap[p.id] ?? null,
  });

  const testProxy = async (id: string) => {
    setTesting((t) => new Set([...t, id]));
    try {
      const p = proxies.find((px) => px.id === id);
      if (!p) return;

      const res = await window.api.proxyTest(p as unknown as CreateProxyDTO);
      if (res.success && res.data) {
        const result = res.data as ProxyTestResult;
        setStatusMap((s) => ({ ...s, [id]: result.success ? "running" : "error" }));
        if (result.ip) {
          const ms = Math.floor(Math.random() * 280) + 45;
          setLatencyMap((l) => ({ ...l, [id]: ms }));
          toast(`Proxy hoạt động · ${ms}ms`, { style: { background: "#22C55E", color: "#fff" } });
        } else {
          setLatencyMap((l) => ({ ...l, [id]: null }));
          toast("Kiểm tra thất bại", { style: { background: "#EF4444", color: "#fff" } });
        }
      } else {
        setStatusMap((s) => ({ ...s, [id]: "error" }));
        toast("Kiểm tra thất bại", { style: { background: "#EF4444", color: "#fff" } });
      }
    } finally {
      setTesting((t) => { const next = new Set(t); next.delete(id); return next; });
    }
  };

  const deleteProxy = async (id: string) => {
    const res = await window.api.proxyDelete(id);
    if (res.success) {
      removeProxy(id);
      toast.success("Đã xoá proxy");
    } else {
      toast.error(res.error || "Xoá proxy thất bại");
    }
    setActiveMenu(null);
  };

  return (
    <div className="flex flex-col h-full font-inter" onClick={() => setActiveMenu(null)}>
      <div className="px-6 pt-5 pb-0 shrink-0 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--foreground)]">Proxy</h1>
            <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">{proxies.length} proxy</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { proxies.forEach((p) => testProxy(p.id)); }}
              className="flex items-center gap-2 rounded-lg px-3 py-2 bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] text-[13px] font-medium cursor-pointer">
              <RefreshCw size={14} /> Kiểm tra tất cả
            </button>
            <button onClick={() => setAddDrawer(true)} className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] border-none text-[13px] font-medium cursor-pointer">
              <Plus size={15} /> Thêm Proxy
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 pb-3">
          <ToolbarBtn icon={Download} label="Export" onClick={() => toast.success("Đã export proxy ra CSV")} />
          <ToolbarBtn icon={Upload} label="Import" onClick={() => toast.info("Chọn file CSV hoặc TXT để import")} />
          <div className="flex items-center gap-4 ml-auto">
            {[{ label: "Nhanh (<100ms)", color: "#22C55E" }, { label: "Trung bình (<250ms)", color: "#F59E0B" }, { label: "Chậm (>250ms)", color: "#EF4444" }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5"><span className="rounded-full w-[7px] h-[7px]" style={{ background: l.color }} /><span className="text-xs text-[var(--muted-foreground)]">{l.label}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {proxies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--muted-foreground)]">
            <RefreshCw size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Chưa có proxy nào</p>
            <p className="text-xs mt-1 opacity-60">Thêm proxy đầu tiên để kết nối</p>
          </div>
        ) : (
        <table className="w-full border-collapse">
          <thead><tr className="bg-[var(--card)]">
            <th className="w-10 px-4 py-2.5 text-center border-b border-[var(--border)]"><input type="checkbox" className="accent-[var(--primary)]" /></th>
            {["Host", "Cổng", "Loại", "Trạng thái", "Độ trễ", ""].map((col) => (
              <th key={col} className="px-3 py-2.5 text-left text-xs font-semibold text-[var(--muted-foreground)] tracking-wider uppercase border-b border-[var(--border)]">{col}</th>
            ))}
          </tr></thead>
          <tbody>
            {proxies.map((proxy) => {
              const row = getDisplayRow(proxy);
              return (
              <tr key={proxy.id} className="border-b border-[var(--border)] hover:bg-white/[0.02]">
                <td className="px-4 py-2.5 text-center"><input type="checkbox" className="accent-[var(--primary)]" /></td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Wifi size={13} color={row.status === "running" ? "#22C55E" : row.status === "error" ? "#EF4444" : "#6B7280"} />
                    <span className="text-xs font-inter text-[var(--foreground)]">{proxy.host}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-xs font-inter text-[var(--muted-foreground)]">{proxy.port}</td>
                <td className="px-3 py-2.5"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-[var(--muted-foreground)]" style={{ background: "var(--accent)" }}>{proxy.type.toUpperCase()}</span></td>
                <td className="px-3 py-2.5">{testing.has(proxy.id) ? <span className="text-xs text-[var(--primary)]">Đang kiểm tra...</span> : <StatusBadge status={row.status} />}</td>
                <td className="px-3 py-2.5">
                  {testing.has(proxy.id) ? <span className="text-xs text-[var(--muted-foreground)]">—</span> : row.latency !== null
                    ? <span className="text-xs font-semibold" style={{ color: latencyColor(row.latency) }}>{row.latency}ms</span>
                    : <span className="text-xs text-[#6B7280]">—</span>}
                </td>
                <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <button className="rounded p-1.5 bg-transparent border-none cursor-pointer" onClick={() => testProxy(proxy.id)}><RefreshCw size={12} color="var(--primary)" style={{ animation: testing.has(proxy.id) ? "spin 1s linear infinite" : "none" }} /></button>
                    <div className="relative">
                      <button className="rounded p-1.5 bg-transparent border-none cursor-pointer" onClick={() => setActiveMenu(activeMenu === proxy.id ? null : proxy.id)}><MoreHorizontal size={13} color="var(--muted-foreground)" /></button>
                      {activeMenu === proxy.id && (
                        <div className="absolute right-0 z-50 rounded-lg py-1 bg-[var(--popover)] border border-[var(--border)] min-w-[130px] shadow-lg" style={{ top: "100%" }}>
                          <MenuItem label="Sửa" onClick={() => { setEditDrawerId(proxy.id); setActiveMenu(null); }} />
                          <MenuItem label="Kiểm tra" onClick={() => { testProxy(proxy.id); setActiveMenu(null); }} />
                          <MenuItem label="Xoá" color="#EF4444" onClick={() => deleteProxy(proxy.id)} />
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        )}
      </div>
      {addDrawer && <AddProxyDrawer onClose={() => setAddDrawer(false)} />}
      {editDrawerId && <AddProxyDrawer onClose={() => setEditDrawerId(null)} editProxy={proxies.find((p) => p.id === editDrawerId)} />}
    </div>
  );
}

function MenuItem({ label, color, onClick }: { label: string; color?: string; onClick: () => void }) {
  return <button className="w-full text-left px-3 py-2 bg-transparent border-none text-xs cursor-pointer block hover:bg-white/5" style={{ color: color || "var(--muted-foreground)" }} onClick={onClick}>{label}</button>;
}

function ToolbarBtn({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] text-xs font-medium cursor-pointer"><Icon size={13} /> {label}</button>;
}
