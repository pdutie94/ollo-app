import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

interface CreateProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const sections = [
  "Basic Info",
  "Browser",
  "Fingerprint",
  "Proxy",
  "Startup",
];

export function CreateProfileDrawer({ open, onClose }: CreateProfileDrawerProps) {
  const [activeSection, setActiveSection] = useState("Basic Info");
  const [os, setOs] = useState("Windows");
  const [browser, setBrowser] = useState("Chromium");
  const [proxyType, setProxyType] = useState("HTTP");

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 480,
          background: "var(--card)",
          borderLeft: "1px solid var(--border)",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>
              Create Profile
            </h2>
            <p style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 2 }}>
              Configure a new browser profile
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-all"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--muted-foreground)",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background =
                "rgba(255,255,255,0.06)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
            }
          >
            <X size={18} />
          </button>
        </div>

        {/* Section tabs */}
        <div
          className="flex items-center gap-1 px-6 py-2 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className="rounded-md px-3 py-1.5 transition-all"
              style={{
                background:
                  activeSection === s ? "rgba(79,124,255,0.15)" : "transparent",
                color: activeSection === s ? "var(--primary)" : "var(--muted-foreground)",
                border: "none",
                fontSize: 12,
                fontWeight: activeSection === s ? 500 : 400,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {activeSection === "Basic Info" && (
            <div className="flex flex-col gap-4">
              <FormField label="Profile Name" placeholder="e.g. US-Chrome-Marketing-001" />
              <FormSelect label="Group" options={["Marketing", "Testing", "Scraping", "Personal"]} />
              <FormField label="Notes" placeholder="Optional description..." textarea />
            </div>
          )}

          {activeSection === "Browser" && (
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 8 }}>
                  Browser Engine
                </label>
                <div className="flex gap-2">
                  {["Chromium", "Chrome", "Edge"].map((b) => (
                    <button
                      key={b}
                      onClick={() => setBrowser(b)}
                      className="flex-1 py-2 rounded-lg transition-all"
                      style={{
                        background: browser === b ? "rgba(79,124,255,0.15)" : "var(--accent)",
                        border: browser === b ? "1px solid var(--primary)" : "1px solid var(--border)",
                        color: browser === b ? "var(--primary)" : "var(--muted-foreground)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              <FormSelect label="Browser Version" options={["Latest (stable)", "120.0", "119.0", "118.0"]} />
            </div>
          )}

          {activeSection === "Fingerprint" && (
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 8 }}>
                  Operating System
                </label>
                <div className="flex gap-2">
                  {["Windows", "macOS", "Linux"].map((o) => (
                    <button
                      key={o}
                      onClick={() => setOs(o)}
                      className="flex-1 py-2 rounded-lg transition-all"
                      style={{
                        background: os === o ? "rgba(79,124,255,0.15)" : "var(--accent)",
                        border: os === o ? "1px solid var(--primary)" : "1px solid var(--border)",
                        color: os === o ? "var(--primary)" : "var(--muted-foreground)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <FormSelect label="Timezone" options={["America/New_York", "Europe/London", "Asia/Tokyo", "Asia/Singapore", "America/Los_Angeles"]} />
              <FormSelect label="Language" options={["en-US", "en-GB", "zh-CN", "ja-JP", "de-DE"]} />
              <FormSelect label="Screen Resolution" options={["1920×1080", "2560×1440", "1366×768", "1280×800"]} />
              <div
                className="rounded-lg p-4"
                style={{ background: "var(--accent)", border: "1px solid var(--border)" }}
              >
                <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", marginBottom: 12 }}>
                  Spoofing
                </p>
                {["Canvas Fingerprint", "WebGL Fingerprint", "Audio Context", "WebRTC Leak"].map((item) => (
                  <div key={item} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid rgba(36,43,56,0.8)" }}>
                    <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{item}</span>
                    <ToggleSwitch defaultOn />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "Proxy" && (
            <div className="flex flex-col gap-4">
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 8 }}>
                  Proxy Type
                </label>
                <div className="flex gap-2">
                  {["HTTP", "SOCKS5", "None"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setProxyType(p)}
                      className="flex-1 py-2 rounded-lg transition-all"
                      style={{
                        background: proxyType === p ? "rgba(79,124,255,0.15)" : "var(--accent)",
                        border: proxyType === p ? "1px solid var(--primary)" : "1px solid var(--border)",
                        color: proxyType === p ? "var(--primary)" : "var(--muted-foreground)",
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              {proxyType !== "None" && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <FormField label="Host" placeholder="192.168.1.1" />
                    </div>
                    <FormField label="Port" placeholder="8080" />
                  </div>
                  <FormField label="Username" placeholder="proxy_user" />
                  <FormField label="Password" placeholder="••••••••" type="password" />
                </>
              )}
            </div>
          )}

          {activeSection === "Startup" && (
            <div className="flex flex-col gap-4">
              <FormField label="Startup URLs" placeholder="https://example.com" textarea />
              <FormSelect label="Extensions" options={["None", "Cookie Manager", "User-Agent Switcher", "Canvas Blocker"]} />
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 8 }}>
                  Launch Options
                </label>
                <div className="flex flex-col gap-2">
                  {["Open DevTools on start", "Incognito mode", "Disable notifications", "Block images"].map((opt) => (
                    <div key={opt} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: "var(--accent)" }}>
                      <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{opt}</span>
                      <ToggleSwitch />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 transition-all"
            style={{
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--muted-foreground)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg px-4 py-2 transition-all"
              style={{
                background: "var(--accent)",
                border: "1px solid var(--border)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Save Draft
            </button>
            <button
              className="rounded-lg px-4 py-2 transition-all"
              style={{
                background: "var(--primary)",
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Create Profile
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function FormField({
  label,
  placeholder,
  textarea,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  textarea?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--muted-foreground)",
          display: "block",
          marginBottom: 6,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          placeholder={placeholder}
          rows={3}
          style={{
            width: "100%",
            background: "var(--accent)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 12px",
            color: "#fff",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            outline: "none",
            resize: "none",
            boxSizing: "border-box",
          }}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          style={{
            width: "100%",
            background: "var(--accent)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 12px",
            color: "#fff",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      )}
    </div>
  );
}

function FormSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: "var(--muted-foreground)",
          display: "block",
          marginBottom: 6,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {label}
      </label>
      <div className="relative">
        <select
          style={{
            width: "100%",
            background: "var(--accent)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 32px 8px 12px",
            color: "#fff",
            fontSize: 13,
            fontFamily: "Inter, sans-serif",
            outline: "none",
            appearance: "none",
            cursor: "pointer",
          }}
        >
          {options.map((o) => (
            <option key={o} value={o} style={{ background: "#1C2130" }}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          color="var(--muted-foreground)"
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        />
      </div>
    </div>
  );
}

function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className="rounded-full transition-all"
      style={{
        width: 32,
        height: 18,
        background: on ? "var(--primary)" : "var(--border)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <span
        className="rounded-full absolute transition-all"
        style={{
          width: 12,
          height: 12,
          background: "#fff",
          top: 3,
          left: on ? 17 : 3,
        }}
      />
    </button>
  );
}
