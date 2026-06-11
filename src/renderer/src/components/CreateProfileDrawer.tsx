import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useProfileStore } from "@/store/useProfileStore";
import { useGroupStore } from "@/store/useGroupStore";
import { slideInRight, backdrop } from "@/lib/animations";
import type { Profile, Group, ProfileFingerprint } from "@shared/types";

interface CreateProfileDrawerProps { open: boolean; onClose: () => void }

const sections = ["Thông tin", "Trình duyệt", "Vân tay", "Proxy", "Khởi động"];

function FormField({ label, value, onChange, placeholder, textarea, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean; type?: string }) {
  const Comp = textarea ? "textarea" : "input";
  return (
    <div>
      <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">{label}</label>
      <Comp value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={textarea ? 3 : undefined} type={type}
        className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-[13px] outline-none resize-none" />
    </div>
  );
}

function FormSelect({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">{label}</label>
      <div className="relative">
        <select value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-[13px] outline-none appearance-none cursor-pointer"
          style={{ paddingRight: 32 }}>
          {options.map((o) => <option key={o} value={o} className="bg-\[var\(--popover\)\]">{o}</option>)}
        </select>
        <ChevronDown size={13} color="var(--muted-foreground)" className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}

interface ToggleSwitchProps { defaultOn?: boolean; onChange?: (on: boolean) => void }
function ToggleSwitch({ defaultOn = false, onChange }: ToggleSwitchProps) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => { const next = !on; setOn(next); onChange?.(next); }} className="rounded-full border-none cursor-pointer relative shrink-0"
      style={{ width: 32, height: 18, background: on ? "var(--primary)" : "var(--border)" }}>
      <span className="rounded-full absolute top-[3px] w-3 h-3 bg-white transition-all" style={{ left: on ? 17 : 3 }} />
    </button>
  );
}

export function CreateProfileDrawer({ open, onClose }: CreateProfileDrawerProps) {
  const addProfile = useProfileStore((s) => s.addProfile);
  const groups = useGroupStore((s) => s.groups);
  const groupOptions = groups.length > 0 ? groups.map((g) => g.name) : ["Chưa phân loại"];
  const [activeSection, setActiveSection] = useState("Thông tin");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [group, setGroup] = useState(groupOptions[0]);
  const [os, setOs] = useState("Windows");
  const [browser, setBrowser] = useState("Chromium");
  const [proxyType, setProxyType] = useState("HTTP");

  const [browserVersion, setBrowserVersion] = useState("Mới nhất (ổn định)");
  const [timezone, setTimezone] = useState("America/New_York");
  const [language, setLanguage] = useState("vi-VN");
  const [resolution, setResolution] = useState("1920×1080");
  const [proxyHost, setProxyHost] = useState("");
  const [proxyPort, setProxyPort] = useState("");
  const [proxyUser, setProxyUser] = useState("");
  const [proxyPass, setProxyPass] = useState("");
  const [startupUrl, setStartupUrl] = useState("");
  const [ext, setExt] = useState("Không");

  // 8.3.1: Fingerprint spoofing toggle states
  const [fpCanvas, setFpCanvas] = useState(true)
  const [fpWebgl, setFpWebgl] = useState(true)
  const [fpAudio, setFpAudio] = useState(true)
  const [fpWebrtc, setFpWebrtc] = useState(true)
  const [fpFont, setFpFont] = useState(false)

  if (!open) return null;

  const buildFingerprint = (): ProfileFingerprint | undefined => {
    // Only include if at least one spoofing option is enabled or OS/timezone/lang/resolution set
    if (!fpCanvas && !fpWebgl && !fpAudio && !fpWebrtc && !fpFont && os === 'Windows' && timezone === 'America/New_York' && language === 'vi-VN' && resolution === '1920×1080') {
      return undefined
    }
    return {
      os: os as 'Windows' | 'macOS' | 'Linux',
      timezone,
      language,
      resolution,
      canvasSpoofing: fpCanvas,
      webglSpoofing: fpWebgl,
      audioSpoofing: fpAudio,
      webrtcProtection: fpWebrtc,
      fontFingerprintGuard: fpFont
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Vui lòng nhập tên profile"); return; }
    const groupId = group !== "Chưa phân loại" ? groups.find((g: Group) => g.name === group)?.id : undefined;
    const fingerprint = buildFingerprint()
    const res = await window.api.profileCreate({ name: name.trim(), notes: notes.trim() || undefined, groupId, fingerprint });
    if (res.success && res.data) { addProfile(res.data as Profile); toast.success("Đã tạo profile"); onClose(); }
    else { toast.error(res.error ?? "Tạo profile thất bại"); }
  };

  return (
    <AnimatePresence>
      <motion.div key="backdrop" variants={backdrop} initial="initial" animate="animate" exit="exit" className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <motion.div key="drawer" variants={slideInRight} initial="initial" animate="animate" exit="exit" className="fixed top-0 right-0 h-full z-50 flex flex-col w-[480px] bg-[var(--card)] border-l border-[var(--border)] font-inter">
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-semibold text-[var(--foreground)]">Tạo Profile</h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Cấu hình profile trình duyệt mới</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 bg-transparent border-none cursor-pointer text-[var(--muted-foreground)]"><X size={18} /></button>
        </div>

        <div className="flex gap-1 mx-6 mt-3 mb-2 p-1 rounded-lg bg-[var(--accent)]">
          {sections.map((s) => (
            <button key={s} onClick={() => setActiveSection(s)} className="flex-1 py-1.5 rounded-md text-xs border-none cursor-pointer"
              style={{ background: activeSection === s ? "var(--card)" : "transparent", color: activeSection === s ? "var(--primary)" : "var(--muted-foreground)", fontWeight: activeSection === s ? 500 : 400 }}>
              {s}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {activeSection === "Thông tin" && (
            <>
              <FormField label="Tên Profile" value={name} onChange={setName} placeholder="VD: US-Chrome-Marketing-001" />
              <FormSelect label="Nhóm" value={group} onChange={setGroup} options={groupOptions} />
              <FormField label="Ghi chú" value={notes} onChange={setNotes} placeholder="Mô tả (không bắt buộc)" textarea />
            </>
          )}

          {activeSection === "Trình duyệt" && (
            <>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-2">Engine trình duyệt</label>
                <div className="flex gap-2">
                  {["Chromium", "Chrome", "Edge"].map((b) => (
                    <button key={b} onClick={() => setBrowser(b)} className="flex-1 py-2 rounded-lg text-[13px] font-medium cursor-pointer"
                      style={{ background: browser === b ? "rgba(79,124,255,0.15)" : "var(--accent)", border: browser === b ? "1px solid var(--primary)" : "1px solid var(--border)", color: browser === b ? "var(--primary)" : "var(--muted-foreground)" }}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <FormSelect label="Phiên bản" value={browserVersion} onChange={setBrowserVersion} options={["Mới nhất (ổn định)", "120.0", "119.0", "118.0"]} />
            </>
          )}

          {activeSection === "Vân tay" && (
            <>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-2">Hệ điều hành</label>
                <div className="flex gap-2">
                  {["Windows", "macOS", "Linux"].map((o) => (
                    <button key={o} onClick={() => setOs(o)} className="flex-1 py-2 rounded-lg text-[13px] font-medium cursor-pointer"
                      style={{ background: os === o ? "rgba(79,124,255,0.15)" : "var(--accent)", border: os === o ? "1px solid var(--primary)" : "1px solid var(--border)", color: os === o ? "var(--primary)" : "var(--muted-foreground)" }}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <FormSelect label="Múi giờ" value={timezone} onChange={setTimezone} options={["America/New_York", "Europe/London", "Asia/Tokyo", "Asia/Singapore"]} />
              <FormSelect label="Ngôn ngữ" value={language} onChange={setLanguage} options={["vi-VN", "en-US", "en-GB", "ja-JP"]} />
              <FormSelect label="Độ phân giải" value={resolution} onChange={setResolution} options={["1920×1080", "2560×1440", "1366×768", "1280×800"]} />
              <div className="rounded-lg p-4 bg-[var(--accent)] border border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--foreground)] mb-3">Spoofing</p>
                <div className="flex items-center justify-between py-2 border-b border-[rgba(36,43,56,0.8)]">
                  <span className="text-xs text-[var(--muted-foreground)]">Canvas Fingerprint</span>
                  <ToggleSwitch defaultOn={fpCanvas} onChange={setFpCanvas} />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[rgba(36,43,56,0.8)]">
                  <span className="text-xs text-[var(--muted-foreground)]">WebGL Fingerprint</span>
                  <ToggleSwitch defaultOn={fpWebgl} onChange={setFpWebgl} />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[rgba(36,43,56,0.8)]">
                  <span className="text-xs text-[var(--muted-foreground)]">Audio Context</span>
                  <ToggleSwitch defaultOn={fpAudio} onChange={setFpAudio} />
                </div>
                <div className="flex items-center justify-between py-2 border-b border-[rgba(36,43,56,0.8)]">
                  <span className="text-xs text-[var(--muted-foreground)]">WebRTC Leak</span>
                  <ToggleSwitch defaultOn={fpWebrtc} onChange={setFpWebrtc} />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-[var(--muted-foreground)]">Font Fingerprint Guard</span>
                  <ToggleSwitch defaultOn={fpFont} onChange={setFpFont} />
                </div>
              </div>
            </>
          )}

          {activeSection === "Proxy" && (
            <>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-2">Loại Proxy</label>
                <div className="flex gap-2">
                  {["HTTP", "SOCKS5", "Không"].map((p) => (
                    <button key={p} onClick={() => setProxyType(p)} className="flex-1 py-2 rounded-lg text-[13px] font-medium cursor-pointer"
                      style={{ background: proxyType === p ? "rgba(79,124,255,0.15)" : "var(--accent)", border: proxyType === p ? "1px solid var(--primary)" : "1px solid var(--border)", color: proxyType === p ? "var(--primary)" : "var(--muted-foreground)" }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              {proxyType !== "Không" && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2"><FormField label="Host" value={proxyHost} onChange={setProxyHost} placeholder="192.168.1.1" /></div>
                    <FormField label="Cổng" value={proxyPort} onChange={setProxyPort} placeholder="8080" />
                  </div>
                  <FormField label="Tên đăng nhập" value={proxyUser} onChange={setProxyUser} placeholder="proxy_user" />
                  <FormField label="Mật khẩu" value={proxyPass} onChange={setProxyPass} placeholder="••••••••" type="password" />
                </>
              )}
            </>
          )}

          {activeSection === "Khởi động" && (
            <>
              <FormField label="URL khởi động" value={startupUrl} onChange={setStartupUrl} placeholder="https://example.com" textarea />
              <FormSelect label="Tiện ích" value={ext} onChange={setExt} options={["Không", "Cookie Manager", "User-Agent Switcher", "Canvas Blocker"]} />
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-2">Tuỳ chọn khởi chạy</label>
                <div className="flex flex-col gap-2">
                  {["Mở DevTools khi khởi động", "Chế độ ẩn danh", "Tắt thông báo", "Chặn hình ảnh"].map((opt) => (
                    <div key={opt} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[var(--accent)]">
                      <span className="text-xs text-[var(--muted-foreground)]">{opt}</span>
                      <ToggleSwitch />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-t border-[var(--border)]">
          <button onClick={onClose} className="rounded-lg px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] text-[13px] font-medium cursor-pointer">Huỷ</button>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              localStorage.setItem('ollo-draft-profile', JSON.stringify({ name, notes, groupId: groups.find((g) => g.name === group)?.id }));
              toast.success('Đã lưu nháp');
            }} className="rounded-lg px-4 py-2 bg-[var(--accent)] border border-[var(--border)] text-[var(--foreground)] text-[13px] font-medium cursor-pointer">Lưu nháp</button>
            <button onClick={handleCreate} className="rounded-lg px-4 py-2 bg-[var(--primary)] border-none text-[var(--primary-foreground)] text-[13px] font-medium cursor-pointer">Tạo Profile</button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
