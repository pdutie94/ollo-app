import { useState } from "react";
import { toast } from "sonner";
import { ChevronRight, ChevronDown } from "lucide-react";

type Category = "General" | "Browser Engine" | "Fingerprint" | "Security" | "API";

const categories: Category[] = ["General", "Browser Engine", "Fingerprint", "Security", "API"];

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
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
        style={{ width: 14, height: 14, background: "#fff", top: 3, left: on ? 19 : 3 }}
      />
    </button>
  );
}

function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center justify-between py-3"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="flex-1 pr-8">
        <p style={{ fontSize: 13, fontWeight: 500, color: "#fff", fontFamily: "Inter, sans-serif" }}>
          {label}
        </p>
        {description && (
          <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2, fontFamily: "Inter, sans-serif" }}>
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingInput({ placeholder, defaultValue, mono }: { placeholder?: string; defaultValue?: string; mono?: boolean }) {
  return (
    <input
      placeholder={placeholder}
      defaultValue={defaultValue}
      style={{
        background: "var(--accent)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "6px 12px",
        color: "#fff",
        fontSize: mono ? 12 : 13,
        fontFamily: mono ? "JetBrains Mono, monospace" : "Inter, sans-serif",
        outline: "none",
        width: 200,
      }}
    />
  );
}

function SettingSelect({ options, defaultValue }: { options: string[]; defaultValue?: string }) {
  return (
    <div className="relative">
      <select
        defaultValue={defaultValue}
        style={{
          background: "var(--accent)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "6px 28px 6px 12px",
          color: "#fff",
          fontSize: 13,
          fontFamily: "Inter, sans-serif",
          outline: "none",
          appearance: "none",
          cursor: "pointer",
          width: 200,
        }}
      >
        {options.map((o) => (
          <option key={o} style={{ background: "#1C2130" }}>{o}</option>
        ))}
      </select>
      <ChevronDown size={13} color="var(--muted-foreground)" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
    </div>
  );
}

function GeneralSettings() {
  return (
    <div>
      <SettingRow label="Default Workspace" description="The workspace loaded on startup">
        <SettingSelect options={["Workspace Alpha", "Workspace Beta", "Personal"]} defaultValue="Workspace Alpha" />
      </SettingRow>
      <SettingRow label="Language" description="Application interface language">
        <SettingSelect options={["English (US)", "Chinese (Simplified)", "German", "Japanese"]} />
      </SettingRow>
      <SettingRow label="Auto-save profiles" description="Save changes automatically when editing">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="Start with system" description="Launch application when OS starts">
        <Toggle />
      </SettingRow>
      <SettingRow label="Minimize to tray" description="Keep running in system tray on close">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="Check for updates" description="Automatically check for app updates">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="Telemetry" description="Help improve the product by sending anonymous usage data">
        <Toggle />
      </SettingRow>
    </div>
  );
}

function BrowserEngineSettings() {
  return (
    <div>
      <SettingRow label="Default Browser" description="Browser engine used when creating new profiles">
        <SettingSelect options={["Chromium (Latest)", "Chrome 120", "Chrome 119", "Edge 120"]} />
      </SettingRow>
      <SettingRow label="Concurrent Profiles" description="Maximum profiles running simultaneously">
        <SettingInput defaultValue="50" />
      </SettingRow>
      <SettingRow label="Browser Cache" description="Persist browser cache between sessions">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="GPU Acceleration" description="Enable hardware-accelerated rendering">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="Sandbox Mode" description="Run browsers in isolated sandbox environment">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="Debug Port Start" description="Base port for remote debugging protocol">
        <SettingInput defaultValue="9222" mono />
      </SettingRow>
    </div>
  );
}

function FingerprintSettings() {
  return (
    <div>
      <SettingRow label="Default OS" description="Operating system used for new profiles">
        <SettingSelect options={["Windows 11", "Windows 10", "macOS 14", "Ubuntu 22"]} />
      </SettingRow>
      <SettingRow label="Canvas Spoofing" description="Randomize canvas fingerprint by default">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="WebGL Spoofing" description="Randomize WebGL fingerprint by default">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="Audio Spoofing" description="Mask audio context fingerprint">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="WebRTC Protection" description="Block WebRTC IP leaks globally">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="Font Masking" description="Restrict installed font enumeration">
        <Toggle />
      </SettingRow>
      <SettingRow label="Randomize Timezone" description="Auto-set timezone based on proxy location">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="Screen Resolution" description="Default resolution for new profiles">
        <SettingSelect options={["1920×1080", "2560×1440", "1366×768", "Random"]} />
      </SettingRow>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div>
      <SettingRow label="Profile Encryption" description="Encrypt profile data at rest">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="Master Password" description="Require password to launch the app">
        <Toggle />
      </SettingRow>
      <SettingRow label="Auto-lock Timeout" description="Lock app after inactivity period">
        <SettingSelect options={["Never", "5 minutes", "15 minutes", "1 hour"]} />
      </SettingRow>
      <SettingRow label="Audit Logging" description="Log all profile and proxy actions">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="Two-factor Auth" description="Require 2FA for sensitive operations">
        <Toggle />
      </SettingRow>
    </div>
  );
}

function APISettings() {
  return (
    <div>
      <SettingRow label="API Key" description="Your personal API key for remote access">
        <div className="flex items-center gap-2">
          <SettingInput defaultValue="sk-••••••••••••••••4f7c" mono />
          <button
            className="rounded-lg px-3 py-1.5"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 12, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
          >
            Regenerate
          </button>
        </div>
      </SettingRow>
      <SettingRow label="API Access" description="Enable REST API for external integrations">
        <Toggle defaultOn />
      </SettingRow>
      <SettingRow label="Webhook URL" description="Receive profile events via webhook">
        <SettingInput placeholder="https://your-server.com/webhook" />
      </SettingRow>
      <SettingRow label="Rate Limit" description="Maximum API requests per minute">
        <SettingInput defaultValue="300" />
      </SettingRow>
      <SettingRow label="IP Allowlist" description="Restrict API access to specific IPs">
        <Toggle />
      </SettingRow>
      <div className="mt-6 rounded-xl p-4" style={{ background: "var(--accent)", border: "1px solid var(--border)" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 8, fontFamily: "Inter, sans-serif" }}>
          API Endpoint
        </p>
        <code style={{ fontSize: 12, color: "var(--primary)", fontFamily: "JetBrains Mono, monospace" }}>
          https://api.stealthbrowser.io/v1
        </code>
        <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 6, fontFamily: "Inter, sans-serif" }}>
          View full API documentation →
        </p>
      </div>
    </div>
  );
}

const settingsMap: Record<Category, React.ComponentType> = {
  "General": GeneralSettings,
  "Browser Engine": BrowserEngineSettings,
  "Fingerprint": FingerprintSettings,
  "Security": SecuritySettings,
  "API": APISettings,
};

export function Settings() {
  const [activeCategory, setActiveCategory] = useState<Category>("General");
  const [saving, setSaving] = useState(false);
  const ActiveSettings = settingsMap[activeCategory];

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success(`${activeCategory} settings saved`);
    }, 700);
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "Inter, sans-serif" }}>
      <div
        className="px-6 pt-5 pb-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff" }}>Settings</h1>
        <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
          Application preferences and configuration
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left category nav */}
        <div
          className="flex flex-col py-4 shrink-0"
          style={{
            width: 200,
            borderRight: "1px solid var(--border)",
            background: "var(--card)",
          }}
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex items-center justify-between px-4 py-2.5 transition-all"
                style={{
                  background: isActive ? "rgba(79,124,255,0.1)" : "transparent",
                  border: "none",
                  color: isActive ? "#fff" : "var(--muted-foreground)",
                  fontSize: 13,
                  fontWeight: isActive ? 500 : 400,
                  cursor: "pointer",
                  fontFamily: "Inter, sans-serif",
                  textAlign: "left",
                  borderLeft: isActive ? "2px solid var(--primary)" : "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                {cat}
                {isActive && <ChevronRight size={13} color="var(--primary)" />}
              </button>
            );
          })}
        </div>

        {/* Right settings panel */}
        <div className="flex-1 overflow-auto px-8 py-6">
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
            {activeCategory}
          </h2>
          <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginBottom: 20 }}>
            Configure {activeCategory.toLowerCase()} settings
          </p>
          <ActiveSettings />

          {/* Save bar */}
          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              onClick={() => toast.info(`${activeCategory} settings reset to defaults`)}
              className="rounded-lg px-4 py-2"
              style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}
            >
              Reset to defaults
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg px-4 py-2"
              style={{ background: saving ? "rgba(79,124,255,0.7)" : "var(--primary)", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: saving ? "wait" : "pointer", fontFamily: "Inter, sans-serif", minWidth: 120 }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
