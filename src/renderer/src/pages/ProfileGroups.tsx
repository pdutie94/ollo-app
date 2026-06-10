import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Pencil, Trash2, FolderOpen, X, Check, Palette } from "lucide-react";
import { useGroupStore } from "@/store/useGroupStore";
import { useProfileStore } from "@/store/useProfileStore";
import type { Group } from "@shared/types";

const presetColors = ["#4F7CFF", "#22C55E", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#F97316", "#EC4899", "#14B8A6", "#E11D48"];

function GroupFormDrawer({ onClose, editGroup }: { onClose: () => void; editGroup?: Group }) {
  const initialColor = editGroup?.color ?? presetColors[0];
  const [name, setName] = useState(editGroup?.name ?? "");
  const [color, setColor] = useState(initialColor);
  const [customColor, setCustomColor] = useState(presetColors.includes(initialColor) ? "#4F7CFF" : initialColor);
  const customInputRef = useRef<HTMLInputElement>(null);
  const addGroup = useGroupStore((s) => s.addGroup);
  const updateGroupInStore = useGroupStore((s) => s.updateGroup);

  const isPreset = presetColors.includes(color);
  const activeColor = isPreset ? color : customColor;

  const handleSubmit = async () => {
    if (!name.trim()) { toast.error("Vui lòng nhập tên nhóm"); return; }
    const finalColor = isPreset ? color : customColor;
    if (editGroup) {
      const res = await window.api.groupUpdate(editGroup.id, { name: name.trim(), color: finalColor });
      if (res.success && res.data) { updateGroupInStore(editGroup.id, res.data as Group); toast.success("Đã cập nhật nhóm"); onClose(); }
      else { toast.error(res.error || "Cập nhật thất bại"); }
    } else {
      const res = await window.api.groupCreate({ name: name.trim(), color: finalColor });
      if (res.success && res.data) { addGroup(res.data as Group); toast.success(`Đã tạo nhóm "${name.trim()}"`); onClose(); }
      else { toast.error(res.error || "Tạo nhóm thất bại"); }
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col w-[420px] bg-[var(--card)] border-l border-[var(--border)]">
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-[var(--border)]">
          <div><h2 className="text-base font-semibold text-[var(--foreground)]">{editGroup ? "Sửa nhóm" : "Nhóm mới"}</h2></div>
          <button onClick={onClose} className="rounded-lg p-1.5 bg-transparent border-none cursor-pointer text-[var(--muted-foreground)]"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Tên nhóm</label>
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Marketing" onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full bg-[var(--accent)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--foreground)] text-[13px] outline-none" />
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-2.5">Màu sắc</label>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="relative rounded-lg cursor-pointer flex items-center justify-center h-9 transition-all duration-150 hover:scale-110"
                  style={{
                    background: c,
                    outline: color === c ? `2px solid ${c}` : "2px solid transparent",
                    outlineOffset: 2,
                  }}
                >
                  {color === c && <Check size={14} color="#fff" strokeWidth={2.5} />}
                </button>
              ))}
              <button
                onClick={() => { setColor("__custom__"); setTimeout(() => customInputRef.current?.click(), 50); }}
                className={`relative rounded-lg cursor-pointer flex items-center justify-center h-9 transition-all duration-150 hover:scale-110 border-2 border-dashed ${
                  !isPreset ? "border-[var(--primary)] bg-[var(--accent)]" : "border-[var(--border)] bg-transparent"
                }`}
              >
                {!isPreset ? (
                  <div className="rounded-md w-5 h-5" style={{ background: customColor }} />
                ) : (
                  <Palette size={16} className="text-[var(--muted-foreground)]" />
                )}
              </button>
              <input
                ref={customInputRef}
                type="color"
                value={customColor}
                onChange={(e) => { setCustomColor(e.target.value); setColor("__custom__"); }}
                className="absolute opacity-0 w-0 h-0 pointer-events-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)]">Xem trước:</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: activeColor + "20", color: activeColor, border: `1px solid ${activeColor}40` }}>
                <span className="rounded-full w-2 h-2" style={{ background: activeColor }} />
                {name || "Tên nhóm"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4 shrink-0 border-t border-[var(--border)]">
          <button onClick={onClose} className="rounded-lg px-4 py-2 bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] text-[13px] cursor-pointer">Huỷ</button>
          <button onClick={handleSubmit} className="rounded-lg px-4 py-2 bg-[var(--primary)] border-none text-[var(--primary-foreground)] text-[13px] font-medium cursor-pointer">
            {editGroup ? "Lưu thay đổi" : "Tạo nhóm"}
          </button>
        </div>
      </div>
    </>
  );
}

export function ProfileGroups() {
  const groups = useGroupStore((s) => s.groups);
  const profiles = useProfileStore((s) => s.profiles);
  const runningProfileIds = useProfileStore((s) => s.runningProfileIds);
  const setGroups = useGroupStore((s) => s.setGroups);
  const removeGroup = useGroupStore((s) => s.removeGroup);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | undefined>(undefined);

  useEffect(() => {
    window.api.groupList().then((res) => { if (res.success && res.data) setGroups(res.data as Group[]); });
  }, []);

  const getGroupStats = (groupId: string) => {
    const groupProfiles = profiles.filter((p) => p.groupId === groupId);
    return { count: groupProfiles.length, running: groupProfiles.filter((p) => runningProfileIds.includes(p.id)).length };
  };

  const handleDelete = async (id: string) => {
    const gr = groups.find((g) => g.id === id);
    const res = await window.api.groupDelete(id);
    if (res.success) { removeGroup(id); toast.success(`Đã xoá "${gr?.name}"`); }
    else { toast.error(res.error || "Xoá thất bại"); }
    setActiveMenu(null);
  };

  const totalProfiles = profiles.length;
  const runningProfiles = runningProfileIds.length;

  return (
    <div className="flex flex-col h-full font-inter">
      <div className="px-6 pt-5 pb-4 shrink-0 border-b border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[22px] font-semibold text-[var(--foreground)]">Nhóm Profile</h1>
            <p className="text-[13px] text-[var(--muted-foreground)] mt-0.5">{groups.length} nhóm · {totalProfiles} profile · {runningProfiles} đang chạy</p>
          </div>
          <button onClick={() => { setEditGroup(undefined); setDrawerOpen(true); }} className="flex items-center gap-2 rounded-lg px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] border-none text-[13px] font-medium cursor-pointer">
            <Plus size={15} /> Nhóm mới
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--muted-foreground)]">
            <FolderOpen size={40} className="mb-3 opacity-30" />
            <p className="text-sm">Chưa có nhóm nào</p>
            <p className="text-xs mt-1 opacity-60">Tạo nhóm đầu tiên để tổ chức profile</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {groups.map((group) => {
              const { count, running } = getGroupStats(group.id);
              const color = group.color || "#4F7CFF";
              return (
                <div key={group.id} className="group relative rounded-xl bg-[var(--card)] border border-[var(--border)] px-4 py-3.5 flex items-center gap-3.5">
                  <div className="rounded-xl flex items-center justify-center shrink-0 w-11 h-11" style={{ background: color + "15" }}>
                    <FolderOpen size={22} color={color} strokeWidth={1.8} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-semibold text-[var(--foreground)] truncate leading-tight">{group.name}</span>
                      <div className="relative shrink-0 ml-2">
                        <button className="bg-transparent border-none cursor-pointer p-0 leading-none" onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === group.id ? null : group.id); }}>
                          <MoreHorizontal size={14} color="var(--muted-foreground)" />
                        </button>
                        {activeMenu === group.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
                            <div className="absolute right-0 z-50 rounded-lg py-1 bg-[var(--popover)] border border-[var(--border)] min-w-[130px] shadow-xl" style={{ top: "calc(100% + 4px)" }}>
                              <button className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 bg-transparent border-none text-xs text-[var(--foreground)] cursor-pointer hover:bg-[var(--accent)]" onClick={() => { setEditGroup(group); setDrawerOpen(true); setActiveMenu(null); }}>
                                <Pencil size={12} /> Sửa
                              </button>
                              <button className="w-full text-left flex items-center gap-2.5 px-3.5 py-2 bg-transparent border-none text-xs text-[#EF4444] cursor-pointer hover:bg-[var(--accent)]" onClick={() => handleDelete(group.id)}>
                                <Trash2 size={12} /> Xoá
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs text-[var(--muted-foreground)]">{count} profile</span>
                      <span className="flex items-center gap-1">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          {running > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: color }} />}
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: running > 0 ? color : "var(--muted-foreground)", opacity: running > 0 ? 1 : 0.3 }} />
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)]">{running}</span>
                      </span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {drawerOpen && <GroupFormDrawer onClose={() => setDrawerOpen(false)} editGroup={editGroup} />}
    </div>
  );
}
