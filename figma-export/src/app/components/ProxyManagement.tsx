import { useState } from "react";
import { toast } from "sonner";
import { Plus, Upload, Download, RefreshCw, Wifi, MoreHorizontal, X, ChevronDown } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

type ProxyStatus = "running" | "stopped" | "error";

interface Proxy {
  id: string;
  host: string;
  port: number;
  type: string;
  country: string;
  flag: string;
  status: ProxyStatus;
  latency: number | null;
  assignedProfiles: number;
}

const initialProxies: Proxy[] = [
  { id: "1", host: "proxy1.residential.net", port: 8080, type: "HTTP", country: "United States", flag: "🇺🇸", status: "running", latency: 124, assignedProfiles: 47 },
  { id: "2", host: "45.86.201.12", port: 1080, type: "SOCKS5", country: "Germany", flag: "🇩🇪", status: "running", latency: 89, assignedProfiles: 23 },
  { id: "3", host: "gate.smartproxy.com", port: 7000, type: "HTTP", country: "Japan", flag: "🇯🇵", status: "running", latency: 245, assignedProfiles: 12 },
  { id: "4", host: "194.233.77.44", port: 3128, type: "HTTP", country: "Singapore", flag: "🇸🇬", status: "error", latency: null, assignedProfiles: 8 },
  { id: "5", host: "proxy.brightdata.com", port: 22225, type: "HTTP", country: "United Kingdom", flag: "🇬🇧", status: "running", latency: 67, assignedProfiles: 31 },
  { id: "6", host: "82.147.118.33", port: 1080, type: "SOCKS5", country: "France", flag: "🇫🇷", status: "stopped", latency: null, assignedProfiles: 0 },
  { id: "7", host: "203.24.108.14", port: 8080, type: "HTTP", country: "Australia", flag: "🇦🇺", status: "running", latency: 312, assignedProfiles: 5 },
  { id: "8", host: "proxy.oxylabs.io", port: 7777, type: "HTTP", country: "Brazil", flag: "🇧🇷", status: "running", latency: 198, assignedProfiles: 18 },
];

const latencyColor = (ms: number | null) => {
  if (ms === null) return "#6B7280";
  if (ms < 100) return "#22C55E";
  if (ms < 250) return "#F59E0B";
  return "#EF4444";
};

const countries = [
  { name: "United States", flag: "🇺🇸" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "France", flag: "🇫🇷" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "India", flag: "🇮🇳" },
];

function AddProxyModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: Proxy) => void }) {
  const [host, setHost] = useState("");
  const [port, setPort] = useState("8080");
  const [type, setType] = useState("HTTP");
  const [country, setCountry] = useState(countries[0]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; ms: number }>(null);

  const handleTest = () => {
    if (!host) { toast.error("Enter a host first"); return; }
    setTesting(true);
    setTestResult(null);
    setTimeout(() => {
      const ok = Math.random() > 0.25;
      const ms = Math.floor(Math.random() * 300) + 40;
      setTesting(false);
      setTestResult({ ok, ms });
    }, 1500);
  };

  const handleAdd = () => {
    if (!host || !port) { toast.error("Host and port are required"); return; }
    const newProxy: Proxy = {
      id: `proxy-${Date.now()}`,
      host,
      port: parseInt(port) || 8080,
      type,
      country: country.name,
      flag: country.flag,
      status: "stopped",
      latency: null,
      assignedProfiles: 0,
    };
    onAdd(newProxy);
    toast.success("Proxy added successfully");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)", width: 460, boxShadow: "0 20px 48px rgba(0,0,0,0.6)", fontFamily: "Inter, sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>Add Proxy</h2>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>Configure a new proxy connection</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={16} color="var(--muted-foreground)" />
          </button>
        </div>

        {/* Proxy type tabs */}
        <div className="flex gap-2 mb-4">
          {["HTTP", "HTTPS", "SOCKS5"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className="flex-1 py-2 rounded-lg transition-all"
              style={{
                background: type === t ? "rgba(79,124,255,0.15)" : "var(--accent)",
                border: type === t ? "1px solid var(--primary)" : "1px solid var(--border)",
                color: type === t ? "var(--primary)" : "var(--muted-foreground)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {/* Host + Port */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 5, fontFamily: "Inter, sans-serif" }}>Host / IP</label>
              <input
                value={host}
                onChange={(e) => setHost(e.target.value)}
                placeholder="proxy.example.com"
                style={{ width: "100%", background: "var(--accent)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "JetBrains Mono, monospace", outline: "none", boxSizing: "border-box" }}
              />
            </div>
            <div style={{ width: 90 }}>
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 5, fontFamily: "Inter, sans-serif" }}>Port</label>
              <input
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="8080"
                style={{ width: "100%", background: "var(--accent)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "JetBrains Mono, monospace", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 5, fontFamily: "Inter, sans-serif" }}>Country</label>
            <div className="relative">
              <select
                value={country.name}
                onChange={(e) => setCountry(countries.find((c) => c.name === e.target.value) || countries[0])}
                style={{ width: "100%", background: "var(--accent)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 32px 8px 12px", color: "#fff", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none", appearance: "none", cursor: "pointer", boxSizing: "border-box" }}
              >
                {countries.map((c) => (
                  <option key={c.name} value={c.name} style={{ background: "#1C2130" }}>{c.flag} {c.name}</option>
                ))}
              </select>
              <ChevronDown size={13} color="var(--muted-foreground)" style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
          </div>

          {/* Auth */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 5, fontFamily: "Inter, sans-serif" }}>Username <span style={{ opacity: 0.5 }}>(optional)</span></label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="proxy_user" style={{ width: "100%", background: "var(--accent)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div className="flex-1">
              <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 5, fontFamily: "Inter, sans-serif" }}>Password <span style={{ opacity: 0.5 }}>(optional)</span></label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", background: "var(--accent)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>

          {/* Test result */}
          {testResult && (
            <div
              className="rounded-lg px-3 py-2.5 flex items-center gap-2"
              style={{
                background: testResult.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${testResult.ok ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}
            >
              <span className="rounded-full" style={{ width: 7, height: 7, background: testResult.ok ? "#22C55E" : "#EF4444", display: "inline-block", flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: testResult.ok ? "#22C55E" : "#EF4444", fontFamily: "Inter, sans-serif" }}>
                {testResult.ok ? `Connected · ${testResult.ms}ms` : "Connection failed — check host and credentials"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-5">
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: "var(--accent)", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 13, fontWeight: 500, cursor: testing ? "wait" : "pointer", fontFamily: "Inter, sans-serif" }}
          >
            <RefreshCw size={14} style={{ animation: testing ? "spin 1s linear infinite" : "none" }} />
            {testing ? "Testing..." : "Test Connection"}
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg px-4 py-2" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Cancel
            </button>
            <button onClick={handleAdd} className="rounded-lg px-4 py-2" style={{ background: "var(--primary)", border: "none", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
              Add Proxy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProxyManagement() {
  const [proxies, setProxies] = useState<Proxy[]>(initialProxies);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [testing, setTesting] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const testProxy = (id: string) => {
    setTesting((t) => new Set([...t, id]));
    const delay = Math.floor(Math.random() * 1500) + 500;
    setTimeout(() => {
      const ok = Math.random() > 0.2;
      const ms = Math.floor(Math.random() * 280) + 45;
      setProxies((ps) =>
        ps.map((p) => p.id === id ? { ...p, status: ok ? "running" : "error", latency: ok ? ms : null } : p)
      );
      setTesting((t) => { const next = new Set(t); next.delete(id); return next; });
      toast[ok ? "success" : "error"](ok ? `Proxy responsive · ${ms}ms` : "Proxy test failed");
    }, delay);
  };

  const testAll = () => {
    const ids = proxies.map((p) => p.id);
    setTesting(new Set(ids));
    ids.forEach((id, i) => {
      setTimeout(() => {
        const ok = Math.random() > 0.15;
        const ms = Math.floor(Math.random() * 280) + 45;
        setProxies((ps) =>
          ps.map((p) => p.id === id ? { ...p, status: ok ? "running" : "error", latency: ok ? ms : null } : p)
        );
        setTesting((t) => { const next = new Set(t); next.delete(id); return next; });
        if (i === ids.length - 1) toast.success("All proxies tested");
      }, 400 + i * 300);
    });
  };

  const deleteProxy = (id: string) => {
    setProxies((ps) => ps.filter((p) => p.id !== id));
    toast.success("Proxy removed");
    setActiveMenu(null);
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "Inter, sans-serif" }} onClick={() => setActiveMenu(null)}>
      <div className="px-6 pt-5 pb-0 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff" }}>Proxies</h1>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
              {proxies.length} proxies · {proxies.filter((p) => p.status === "running").length} active
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={testAll}
              disabled={testing.size > 0}
              className="flex items-center gap-2 rounded-lg px-3 py-2"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: testing.size > 0 ? "var(--primary)" : "var(--muted-foreground)", fontSize: 13, fontWeight: 500, cursor: testing.size > 0 ? "wait" : "pointer" }}
            >
              <RefreshCw size={14} style={{ animation: testing.size > 0 ? "spin 1s linear infinite" : "none" }} />
              {testing.size > 0 ? `Testing ${testing.size}...` : "Test All"}
            </button>
            <button
              onClick={() => setAddModal(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2"
              style={{ background: "var(--primary)", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
            >
              <Plus size={15} />
              Add Proxy
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 pb-3">
          <button
            onClick={() => toast.success("Proxies exported to CSV")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
          >
            <Download size={13} /> Export
          </button>
          <button
            onClick={() => toast.info("Select a CSV or TXT file to import")}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
          >
            <Upload size={13} /> Import
          </button>

          <div className="flex items-center gap-4 ml-auto">
            {[
              { label: "Fast (<100ms)", color: "#22C55E" },
              { label: "Medium (<250ms)", color: "#F59E0B" },
              { label: "Slow (>250ms)", color: "#EF4444" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="rounded-full" style={{ width: 7, height: 7, background: l.color, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--card)" }}>
              <th style={{ width: 40, padding: "10px 16px", textAlign: "center" }}>
                <input type="checkbox" checked={selected.size === proxies.length && proxies.length > 0} onChange={() => { if (selected.size === proxies.length) setSelected(new Set()); else setSelected(new Set(proxies.map((p) => p.id))); }} style={{ accentColor: "var(--primary)", cursor: "pointer" }} />
              </th>
              {["Host", "Port", "Type", "Country", "Status", "Latency", "Assigned Profiles", ""].map((col, i) => (
                <th key={`col-${i}`} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "var(--muted-foreground)", fontFamily: "Inter, sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: "1px solid var(--border)" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {proxies.map((proxy) => {
              const isSelected = selected.has(proxy.id);
              const isTesting = testing.has(proxy.id);
              return (
                <tr
                  key={proxy.id}
                  style={{ background: isSelected ? "rgba(79,124,255,0.06)" : "transparent", borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.02)"; }}
                  onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                >
                  <td style={{ padding: "10px 16px", textAlign: "center" }}>
                    <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(proxy.id)} style={{ accentColor: "var(--primary)", cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div className="flex items-center gap-2">
                      <Wifi size={13} color={proxy.status === "running" ? "#22C55E" : proxy.status === "error" ? "#EF4444" : "#6B7280"} />
                      <span style={{ fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "#fff" }}>{proxy.host}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, fontFamily: "JetBrains Mono, monospace", color: "var(--muted-foreground)" }}>{proxy.port}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span className="inline-flex items-center px-2 py-0.5 rounded" style={{ background: "var(--accent)", fontSize: 11, color: "var(--muted-foreground)", fontFamily: "Inter, sans-serif" }}>{proxy.type}</span>
                  </td>
                  <td style={{ padding: "10px 12px", fontSize: 12, color: "#fff", fontFamily: "Inter, sans-serif" }}>{proxy.flag} {proxy.country}</td>
                  <td style={{ padding: "10px 12px" }}>
                    {isTesting
                      ? <span style={{ fontSize: 11, color: "var(--primary)", fontFamily: "Inter, sans-serif" }}>Testing...</span>
                      : <StatusBadge status={proxy.status} />}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {isTesting
                      ? <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "JetBrains Mono, monospace" }}>—</span>
                      : proxy.latency !== null
                        ? <span style={{ fontSize: 12, fontWeight: 600, color: latencyColor(proxy.latency), fontFamily: "JetBrains Mono, monospace" }}>{proxy.latency}ms</span>
                        : <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "Inter, sans-serif" }}>—</span>
                    }
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div className="flex items-center gap-2">
                      <div className="rounded-full overflow-hidden" style={{ width: 60, height: 4, background: "var(--accent)" }}>
                        <div className="rounded-full" style={{ width: `${Math.min((proxy.assignedProfiles / 50) * 100, 100)}%`, height: 4, background: "var(--primary)" }} />
                      </div>
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)", fontFamily: "JetBrains Mono, monospace" }}>{proxy.assignedProfiles}</span>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px" }} onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        className="rounded p-1.5 transition-all"
                        title="Test proxy"
                        style={{ background: "transparent", border: "none", cursor: "pointer" }}
                        onClick={() => testProxy(proxy.id)}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(79,124,255,0.1)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                      >
                        <RefreshCw size={12} color="var(--primary)" style={{ animation: isTesting ? "spin 1s linear infinite" : "none" }} />
                      </button>
                      <div className="relative">
                        <button
                          className="rounded p-1.5 transition-all"
                          style={{ background: "transparent", border: "none", cursor: "pointer" }}
                          onClick={() => setActiveMenu(activeMenu === proxy.id ? null : proxy.id)}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)")}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                        >
                          <MoreHorizontal size={13} color="var(--muted-foreground)" />
                        </button>
                        {activeMenu === proxy.id && (
                          <div className="absolute right-0 z-50 rounded-lg py-1" style={{ top: "100%", background: "var(--popover)", border: "1px solid var(--border)", minWidth: 130, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
                            {[
                              { label: "Edit", action: () => { toast.info("Edit proxy"); setActiveMenu(null); } },
                              { label: "Duplicate", action: () => { setProxies((ps) => [...ps, { ...proxy, id: `dup-${Date.now()}`, assignedProfiles: 0, status: "stopped" as ProxyStatus, latency: null }]); toast.success("Proxy duplicated"); setActiveMenu(null); } },
                              { label: "Test", action: () => { testProxy(proxy.id); setActiveMenu(null); } },
                              { label: "Delete", color: "#EF4444", action: () => deleteProxy(proxy.id) },
                            ].map((item) => (
                              <button key={item.label} className="w-full text-left px-3 py-2 transition-all" style={{ background: "transparent", border: "none", color: item.color || "var(--muted-foreground)", fontSize: 12, fontFamily: "Inter, sans-serif", cursor: "pointer", display: "block" }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)")}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                                onClick={item.action}
                              >{item.label}</button>
                            ))}
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
      </div>

      {addModal && (
        <AddProxyModal
          onClose={() => setAddModal(false)}
          onAdd={(p) => setProxies((ps) => [p, ...ps])}
        />
      )}
    </div>
  );
}
