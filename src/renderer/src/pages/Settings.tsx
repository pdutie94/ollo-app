import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronRight } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Select } from "@/components/ui/Select";
import type { UserSettings, Settings } from "@shared/types";

type Category = "General" | "Browser Engine" | "Fingerprint" | "Security" | "API";
const categories: Category[] = ["General", "Browser Engine", "Fingerprint", "Security", "API"];

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!on)} className="rounded-full border-none cursor-pointer relative shrink-0"
      style={{ width: 36, height: 20, background: on ? "var(--primary)" : "var(--border)" }}>
      <span className="absolute rounded-full top-[3px] w-3.5 h-3.5 bg-white" style={{ left: on ? 19 : 3 }} />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
      <div className="flex-1 pr-8">
        <p className="text-sm font-medium text-[var(--foreground)]">{label}</p>
        {description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingInput({ value, onChange, placeholder, mono }: { value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="bg-[var(--accent)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-[var(--foreground)] outline-none w-[200px]"
      style={{ fontSize: mono ? 12 : 13, fontFamily: mono ? "JetBrains Mono, monospace" : "'Geist', sans-serif" }} />
  );
}

function GeneralSettings() {
  const s = useSettingsStore((st) => st.settings);
  const update = useSettingsStore((st) => st.updateSetting);
  return (
    <div>
      <SettingRow label="Ngôn ngữ" description="Ngôn ngữ giao diện"><Select options={["Tiếng Việt", "English (US)", "Chinese"]} value={s.language ?? "Tiếng Việt"} onChange={(v) => update("language", v)} className="bg-[var(--accent)] px-3 py-2 text-sm w-[200px]" /></SettingRow>
      <SettingRow label="Tự động lưu" description="Tự động lưu khi chỉnh sửa"><Toggle on={s.autoSave ?? false} onChange={(v) => update("autoSave", v)} /></SettingRow>
      <SettingRow label="Khởi động cùng hệ thống" description="Tự động chạy khi OS khởi động"><Toggle on={s.startWithSystem ?? false} onChange={(v) => update("startWithSystem", v)} /></SettingRow>
      <SettingRow label="Thu nhỏ xuống khay" description="Giữ chạy ở khay hệ thống khi đóng"><Toggle on={s.minimizeToTray ?? false} onChange={(v) => update("minimizeToTray", v)} /></SettingRow>
      <SettingRow label="Kiểm tra cập nhật" description="Tự động kiểm tra bản cập nhật"><Toggle on={s.checkUpdates ?? false} onChange={(v) => update("checkUpdates", v)} /></SettingRow>
      <SettingRow label="Telemetry" description="Gửi dữ liệu ẩn danh để cải thiện sản phẩm"><Toggle on={s.telemetry ?? false} onChange={(v) => update("telemetry", v)} /></SettingRow>
    </div>
  );
}

function BrowserEngineSettings() {
  const s = useSettingsStore((st) => st.settings);
  const update = useSettingsStore((st) => st.updateSetting);
  return (
    <div>
      <SettingRow label="Trình duyệt mặc định" description="Engine dùng khi tạo profile mới"><Select options={["Chromium (Mới nhất)", "Chrome 120", "Edge 120"]} value={s.defaultBrowser ?? "Chromium (Mới nhất)"} onChange={(v) => update("defaultBrowser", v)} className="bg-[var(--accent)] px-3 py-2 text-sm w-[200px]" /></SettingRow>
      <SettingRow label="Số profile đồng thời" description="Tối đa chạy cùng lúc"><SettingInput value={String(s.maxConcurrentProfiles ?? 50)} onChange={(v) => update("maxConcurrentProfiles", Number(v) || 1)} mono /></SettingRow>
      <SettingRow label="Cache trình duyệt" description="Giữ cache giữa các phiên"><Toggle on={s.browserCache ?? false} onChange={(v) => update("browserCache", v)} /></SettingRow>
      <SettingRow label="GPU Acceleration" description="Bật tăng tốc phần cứng"><Toggle on={s.gpuAcceleration ?? false} onChange={(v) => update("gpuAcceleration", v)} /></SettingRow>
      <SettingRow label="Chế độ sandbox" description="Chạy trong môi trường cách ly"><Toggle on={s.sandboxMode ?? false} onChange={(v) => update("sandboxMode", v)} /></SettingRow>
      <SettingRow label="Cổng debug" description="Cổng cơ sở cho remote debugging"><SettingInput value={String(s.debugPort ?? 9222)} onChange={(v) => update("debugPort", Number(v) || 9222)} mono /></SettingRow>
    </div>
  );
}

function FingerprintSettings() {
  const s = useSettingsStore((st) => st.settings);
  const update = useSettingsStore((st) => st.updateSetting);
  return (
    <div>
      <SettingRow label="HĐH mặc định" description="Hệ điều hành cho profile mới"><Select options={["Windows 11", "Windows 10", "macOS 14", "Ubuntu 22"]} value={s.defaultOS ?? "Windows 11"} onChange={(v) => update("defaultOS", v)} className="bg-[var(--accent)] px-3 py-2 text-sm w-[200px]" /></SettingRow>
      <SettingRow label="Canvas Spoofing" description="Ngẫu nhiên hoá dấu vân tay canvas"><Toggle on={s.canvasSpoofing ?? false} onChange={(v) => update("canvasSpoofing", v)} /></SettingRow>
      <SettingRow label="WebGL Spoofing" description="Ngẫu nhiên hoá WebGL"><Toggle on={s.webglSpoofing ?? false} onChange={(v) => update("webglSpoofing", v)} /></SettingRow>
      <SettingRow label="Audio Spoofing" description="Che dấu vân tay âm thanh"><Toggle on={s.audioSpoofing ?? false} onChange={(v) => update("audioSpoofing", v)} /></SettingRow>
      <SettingRow label="Bảo vệ WebRTC" description="Chặn rò rỉ IP qua WebRTC"><Toggle on={s.webrtcProtection ?? false} onChange={(v) => update("webrtcProtection", v)} /></SettingRow>
      <SettingRow label="Che font chữ" description="Giới hạn liệt kê font đã cài"><Toggle on={s.fontFingerprintGuard ?? false} onChange={(v) => update("fontFingerprintGuard", v)} /></SettingRow>
      <SettingRow label="Tự động múi giờ" description="Đặt múi giờ theo vị trí proxy"><Toggle on={s.autoTimezone ?? false} onChange={(v) => update("autoTimezone", v)} /></SettingRow>
      <SettingRow label="Độ phân giải" description="Độ phân giải mặc định"><Select options={["1920×1080", "2560×1440", "1366×768", "Ngẫu nhiên"]} value={s.defaultResolution ?? "1920×1080"} onChange={(v) => update("defaultResolution", v)} className="bg-[var(--accent)] px-3 py-2 text-sm w-[200px]" /></SettingRow>
    </div>
  );
}

function SecuritySettings() {
  const s = useSettingsStore((st) => st.settings);
  const update = useSettingsStore((st) => st.updateSetting);
  return (
    <div>
      <SettingRow label="Mã hoá Profile" description="Mã hoá dữ liệu profile khi lưu"><Toggle on={s.profileEncryption ?? false} onChange={(v) => update("profileEncryption", v)} /></SettingRow>
      <SettingRow label="Mật khẩu chính" description="Yêu cầu mật khẩu để mở ứng dụng"><Toggle on={s.masterPassword ?? false} onChange={(v) => update("masterPassword", v)} /></SettingRow>
      <SettingRow label="Tự động khóa" description="Khoá sau thời gian không hoạt động"><Select options={["Không", "5 phút", "15 phút", "1 giờ"]} value={s.autoLockTimeout ?? "Không"} onChange={(v) => update("autoLockTimeout", v)} className="bg-[var(--accent)] px-3 py-2 text-sm w-[200px]" /></SettingRow>
      <SettingRow label="Ghi nhật ký" description="Ghi lại hành động profile và proxy"><Toggle on={s.auditLogging ?? false} onChange={(v) => update("auditLogging", v)} /></SettingRow>
      <SettingRow label="Xác thực 2 yếu tố" description="Yêu cầu 2FA cho thao tác nhạy cảm"><Toggle on={s.twoFactorAuth ?? false} onChange={(v) => update("twoFactorAuth", v)} /></SettingRow>
    </div>
  );
}

function APISettings() {
  const s = useSettingsStore((st) => st.settings);
  const update = useSettingsStore((st) => st.updateSetting);
  return (
    <div>
      <SettingRow label="API Key" description="Khoá API cá nhân">
        <div className="flex items-center gap-2">
          <SettingInput value={s.apiKey ?? ""} onChange={(v) => update("apiKey", v)} mono />
          <button onClick={() => update("apiKey", "sk-" + Math.random().toString(36).slice(2, 8))} className="rounded-lg px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] text-xs cursor-pointer">Tạo lại</button>
        </div>
      </SettingRow>
      <SettingRow label="API Access" description="Bật REST API cho tích hợp"><Toggle on={s.apiAccess ?? false} onChange={(v) => update("apiAccess", v)} /></SettingRow>
      <SettingRow label="Webhook URL" description="Nhận sự kiện profile qua webhook"><SettingInput value={s.webhookUrl ?? ""} onChange={(v) => update("webhookUrl", v)} placeholder="https://your-server.com/webhook" /></SettingRow>
      <SettingRow label="Giới hạn" description="Số request API tối đa mỗi phút"><SettingInput value={String(s.rateLimit ?? 300)} onChange={(v) => update("rateLimit", Number(v) || 1)} mono /></SettingRow>
      <SettingRow label="IP Allowlist" description="Giới hạn API theo IP"><Toggle on={s.ipAllowlist ?? false} onChange={(v) => update("ipAllowlist", v)} /></SettingRow>
      <div className="mt-6 rounded-xl p-4 bg-[var(--accent)] border border-[var(--border)]">
        <p className="text-xs font-medium text-[var(--foreground)] mb-2">API Endpoint</p>
        <code className="text-xs text-[var(--primary)]">https://api.ollo.app/v1</code>
        <p className="text-xs text-[var(--muted-foreground)] mt-1.5">Xem tài liệu API →</p>
      </div>
    </div>
  );
}

const settingsMap: Record<Category, React.ComponentType> = {
  "General": GeneralSettings, "Browser Engine": BrowserEngineSettings,
  "Fingerprint": FingerprintSettings, "Security": SecuritySettings, "API": APISettings,
};

export function Settings() {
  const [activeCategory, setActiveCategory] = useState<Category>("General");
  const [saving, setSaving] = useState(false);
  const settings = useSettingsStore((st) => st.settings);
  const setSettings = useSettingsStore((st) => st.setSettings);
  const setLoading = useSettingsStore((st) => st.setLoading);
  const ActiveSettings = settingsMap[activeCategory];

  useEffect(() => {
    window.api.settingsGet().then((res) => {
      if (res.success && res.data) {
        const s = res.data as Settings;
        setSettings(s.data || {});
      } else {
        setLoading(false);
      }
    }).catch((err) => { console.error("Failed to load settings:", err); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res = await window.api.settingsUpdate(settings as UserSettings);
    setSaving(false);
    if (res.success) {
      toast.success("Đã lưu cài đặt");
    } else {
      toast.error(res.error || "Lưu cài đặt thất bại");
    }
  };

  const handleReset = async () => {
    setSaving(true);
    const defaults: UserSettings = {
      defaultWorkspace: 'Workspace Alpha', language: 'Tiếng Việt', autoSave: true,
      startWithSystem: false, minimizeToTray: true, checkUpdates: true, telemetry: false,
      defaultBrowser: 'Chromium (Mới nhất)', maxConcurrentProfiles: 50, browserCache: true,
      gpuAcceleration: true, sandboxMode: true, debugPort: 9222, defaultOS: 'Windows 11',
      canvasSpoofing: true, webglSpoofing: true, audioSpoofing: true, webrtcProtection: true,
      fontFingerprintGuard: false, autoTimezone: true, defaultResolution: '1920×1080',
      profileEncryption: true, masterPassword: false, autoLockTimeout: 'Không',
      auditLogging: true, twoFactorAuth: false, apiKey: '', apiAccess: true,
      webhookUrl: '', rateLimit: 300, ipAllowlist: false
    };
    const res = await window.api.settingsUpdate(defaults);
    if (res.success && res.data) {
      const s = res.data as Settings;
      setSettings(s.data || {});
      toast.info("Đã đặt lại mặc định");
    }
    setSaving(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-5 pb-4 shrink-0 border-b border-[var(--border)]">
        <h1 className="text-[22px] font-medium text-[var(--foreground)]">Cài đặt</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Tuỳ chỉnh và cấu hình ứng dụng</p>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col shrink-0 w-[200px] bg-[var(--card)] border-r border-[var(--border)]">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className="flex items-center justify-between px-4 py-2.5 text-sm border-none cursor-pointer text-left"
                style={{ background: isActive ? "rgba(79,124,255,0.1)" : "transparent", color: isActive ? "var(--foreground)" : "var(--muted-foreground)", fontWeight: isActive ? 500 : 400, borderLeft: isActive ? "2px solid var(--primary)" : "2px solid transparent" }}>
                {cat === "General" ? "Chung" : cat === "Browser Engine" ? "Trình duyệt" : cat === "Fingerprint" ? "Vân tay" : cat === "Security" ? "Bảo mật" : "API"}
                {isActive && <ChevronRight size={13} color="var(--primary)" />}
              </button>
            );
          })}
        </div>
        <div className="flex-1 overflow-auto px-8 py-6">
          <h2 className="text-base font-medium text-[var(--foreground)] mb-1">
            {activeCategory === "General" ? "Chung" : activeCategory === "Browser Engine" ? "Trình duyệt" : activeCategory === "Fingerprint" ? "Vân tay" : activeCategory === "Security" ? "Bảo mật" : "API"}
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mb-5">Cấu hình {activeCategory.toLowerCase()}</p>
          <ActiveSettings />
          <div className="flex items-center justify-end gap-3 mt-8">
            <button onClick={handleReset} className="rounded-lg px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] text-sm cursor-pointer">Đặt lại</button>
            <button onClick={handleSave} disabled={saving}
              className="rounded-lg px-4 py-2 border-none text-[var(--primary-foreground)] text-sm font-medium cursor-pointer min-w-[120px]"
              style={{ background: saving ? "rgba(79,124,255,0.7)" : "var(--primary)" }}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
