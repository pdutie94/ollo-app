import { useState } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Globe, Pencil, Trash2, FolderOpen, X } from "lucide-react";

interface Group {
  id: string;
  name: string;
  count: number;
  running: number;
  color: string;
  description: string;
  createdAt: string;
}

const initialGroups: Group[] = [
  { id: "1", name: "Marketing", count: 234, running: 89, color: "#4F7CFF", description: "Ad accounts and social media profiles", createdAt: "Jan 15, 2026" },
  { id: "2", name: "Scraping", count: 187, running: 142, color: "#22C55E", description: "Web data extraction profiles", createdAt: "Jan 28, 2026" },
  { id: "3", name: "Testing", count: 96, running: 23, color: "#F59E0B", description: "QA and automation testing", createdAt: "Feb 3, 2026" },
  { id: "4", name: "Research", count: 312, running: 67, color: "#8B5CF6", description: "Market research and competitive intelligence", createdAt: "Feb 12, 2026" },
  { id: "5", name: "E-Commerce", count: 145, running: 38, color: "#EF4444", description: "Shopping and pricing analysis", createdAt: "Mar 1, 2026" },
  { id: "6", name: "Social Media", count: 203, running: 54, color: "#06B6D4", description: "Social platform management", createdAt: "Mar 19, 2026" },
  { id: "7", name: "Personal", count: 42, running: 6, color: "#F97316", description: "Personal use profiles", createdAt: "Apr 2, 2026" },
  { id: "8", name: "Uncategorized", count: 65, running: 28, color: "#6B7280", description: "Profiles without a group", createdAt: "Jan 1, 2026" },
];

const groupColors = ["#4F7CFF", "#22C55E", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#F97316", "#EC4899"];

function NewGroupModal({ onClose, onAdd }: { onClose: () => void; onAdd: (g: Group) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(groupColors[0]);

  const handleAdd = () => {
    if (!name.trim()) { toast.error("Group name is required"); return; }
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: name.trim(),
      count: 0,
      running: 0,
      color,
      description: description.trim() || "New group",
      createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    onAdd(newGroup);
    toast.success(`Group "${name.trim()}" created`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div
        className="rounded-2xl p-6"
        style={{ background: "var(--card)", border: "1px solid var(--border)", width: 400, boxShadow: "0 20px 48px rgba(0,0,0,0.6)", fontFamily: "Inter, sans-serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>New Group</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={16} color="var(--muted-foreground)" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6, fontFamily: "Inter, sans-serif" }}>Group Name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. E-Commerce"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              style={{ width: "100%", background: "var(--accent)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 6, fontFamily: "Inter, sans-serif" }}>Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              style={{ width: "100%", background: "var(--accent)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: "var(--muted-foreground)", display: "block", marginBottom: 8, fontFamily: "Inter, sans-serif" }}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {groupColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="rounded-full transition-all"
                  style={{
                    width: 24,
                    height: 24,
                    background: c,
                    border: color === c ? `2px solid #fff` : "2px solid transparent",
                    cursor: "pointer",
                    outline: color === c ? `2px solid ${c}` : "none",
                    outlineOffset: 2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={onClose} className="rounded-lg px-4 py-2" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--muted-foreground)", fontSize: 13, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            Cancel
          </button>
          <button onClick={handleAdd} className="rounded-lg px-4 py-2" style={{ background: "var(--primary)", border: "none", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfileGroups() {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newGroupModal, setNewGroupModal] = useState(false);

  const startEdit = (group: Group) => {
    setEditingId(group.id);
    setEditName(group.name);
    setActiveMenu(null);
  };

  const saveEdit = (id: string) => {
    setGroups((g) => g.map((gr) => (gr.id === id ? { ...gr, name: editName } : gr)));
    setEditingId(null);
  };

  const deleteGroup = (id: string) => {
    const gr = groups.find((g) => g.id === id);
    setGroups((g) => g.filter((gr) => gr.id !== id));
    toast.success(`Group "${gr?.name}" deleted`);
    setActiveMenu(null);
  };

  const total = groups.reduce((a, g) => a + g.count, 0);
  const running = groups.reduce((a, g) => a + g.running, 0);

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "Inter, sans-serif" }}>
      <div
        className="px-6 pt-5 pb-4 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff" }}>Profile Groups</h1>
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", marginTop: 2 }}>
              {groups.length} groups · {total} total profiles · {running} running
            </p>
          </div>
          <button
            onClick={() => setNewGroupModal(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2"
            style={{ background: "var(--primary)", color: "#fff", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            <Plus size={15} />
            New Group
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-3 gap-4">
          {groups.map((group) => {
            const pct = Math.round((group.running / group.count) * 100);
            return (
              <div
                key={group.id}
                className="rounded-xl p-5 relative"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = group.color + "66")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")
                }
              >
                {/* Accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 rounded-t-xl"
                  style={{ height: 3, background: group.color }}
                />

                <div className="flex items-start justify-between mt-1">
                  <div className="flex items-center gap-3">
                    <div
                      className="rounded-lg flex items-center justify-center"
                      style={{ width: 36, height: 36, background: group.color + "18" }}
                    >
                      <FolderOpen size={18} color={group.color} />
                    </div>
                    <div>
                      {editingId === group.id ? (
                        <input
                          autoFocus
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onBlur={() => saveEdit(group.id)}
                          onKeyDown={(e) => e.key === "Enter" && saveEdit(group.id)}
                          style={{
                            background: "var(--accent)",
                            border: "1px solid var(--primary)",
                            borderRadius: 6,
                            padding: "2px 8px",
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: 600,
                            fontFamily: "Inter, sans-serif",
                            outline: "none",
                          }}
                        />
                      ) : (
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                          {group.name}
                        </h3>
                      )}
                      <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      className="rounded-lg p-1.5 transition-all"
                      style={{ background: "transparent", border: "none", cursor: "pointer" }}
                      onClick={() => setActiveMenu(activeMenu === group.id ? null : group.id)}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                    >
                      <MoreHorizontal size={14} color="var(--muted-foreground)" />
                    </button>
                    {activeMenu === group.id && (
                      <div
                        className="absolute right-0 z-50 rounded-lg py-1"
                        style={{ top: "100%", background: "var(--popover)", border: "1px solid var(--border)", minWidth: 140, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
                      >
                        {[
                          { label: "View Profiles", icon: Globe },
                          { label: "Rename", icon: Pencil, action: () => startEdit(group) },
                          { label: "Delete", icon: Trash2, danger: true, action: () => deleteGroup(group.id) },
                        ].map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <button
                              key={item.label}
                              className="w-full text-left flex items-center gap-2 px-3 py-2 transition-all"
                              style={{
                                background: "transparent",
                                border: "none",
                                color: item.danger ? "#EF4444" : "var(--muted-foreground)",
                                fontSize: 12,
                                fontFamily: "Inter, sans-serif",
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)")}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
                              onClick={() => {
                                item.action?.();
                                if (!item.action) setActiveMenu(null);
                              }}
                            >
                              <ItemIcon size={12} />
                              {item.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div
                    className="rounded-lg px-3 py-2"
                    style={{ background: "var(--accent)" }}
                  >
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
                      {group.count}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 1 }}>Total</p>
                  </div>
                  <div className="rounded-lg px-3 py-2" style={{ background: "rgba(34,197,94,0.08)" }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#22C55E", fontVariantNumeric: "tabular-nums" }}>
                      {group.running}
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(34,197,94,0.6)", marginTop: 1 }}>Running</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>Active rate</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: group.color }}>{pct}%</span>
                  </div>
                  <div className="rounded-full overflow-hidden" style={{ height: 4, background: "var(--accent)" }}>
                    <div className="rounded-full" style={{ width: `${pct}%`, height: 4, background: group.color }} />
                  </div>
                </div>

                <p style={{ fontSize: 10, color: "rgba(161,168,181,0.5)", marginTop: 12 }}>
                  Created {group.createdAt}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {newGroupModal && (
        <NewGroupModal
          onClose={() => setNewGroupModal(false)}
          onAdd={(g) => setGroups((gs) => [g, ...gs])}
        />
      )}
    </div>
  );
}
