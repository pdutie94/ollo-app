import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Class cho dropdown items (mặc định text-sm) */
  listClassName?: string;
  /** Hiển thị checkmark bên cạnh item đang chọn */
  showCheckmark?: boolean;
  /** Hiển thị placeholder như 1 option disabled trong dropdown */
  showPlaceholder?: boolean;
}

export function Select({
  label,
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  disabled = false,
  className = "bg-[var(--accent)] px-3 py-2 text-sm w-full",
  listClassName = "text-sm",
  showCheckmark = true,
  showPlaceholder = false
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // All visible items (prepend placeholder if enabled)
  const displayOptions = showPlaceholder && placeholder
    ? [placeholder, ...options]
    : options
  const isPlaceholderItem = (idx: number) => showPlaceholder && idx === 0 && !!placeholder

  // Map display index → original options index (or -1 for placeholder)
  const toOriginalIndex = (displayIdx: number) =>
    showPlaceholder ? displayIdx - 1 : displayIdx

  // Reset highlighted index when opening
  useEffect(() => {
    if (open) {
      const idx = options.indexOf(value)
      // If value is set, highlight that item; otherwise highlight first real option
      setHighlighted(idx >= 0 ? (showPlaceholder ? idx + 1 : idx) : (showPlaceholder ? 1 : 0))
    } else {
      setHighlighted(-1)
    }
  }, [open, options, value, showPlaceholder])

  // Scroll highlighted item into view
  useEffect(() => {
    if (open && highlighted >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-index]")
      const el = items[highlighted] as HTMLElement | undefined
      el?.scrollIntoView({ block: "nearest" })
    }
  }, [highlighted, open])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true)
        }
        return
      }

      const maxIdx = displayOptions.length - 1

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setHighlighted((prev) => {
            let next = Math.min(prev + 1, maxIdx)
            // Skip placeholder if on it
            if (isPlaceholderItem(next)) next = Math.min(next + 1, maxIdx)
            return next
          })
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlighted((prev) => {
            let next = Math.max(prev - 1, 0)
            // Skip placeholder if on it
            if (isPlaceholderItem(next)) next = Math.max(next - 1, 0)
            return next
          })
          break
        case "Enter":
        case " ":
          e.preventDefault()
          if (highlighted >= 0 && !isPlaceholderItem(highlighted)) {
            const originalIdx = toOriginalIndex(highlighted)
            if (originalIdx >= 0 && originalIdx < options.length) {
              onChange(options[originalIdx])
              setOpen(false)
            }
          }
          break
        case "Escape":
          e.preventDefault()
          setOpen(false)
          break
        case "Tab":
          setOpen(false)
          break
      }
    },
    [open, highlighted, options, onChange, displayOptions.length]
  );

  const selectOption = (opt: string) => {
    onChange(opt)
    setOpen(false)
  }

  return (
    <div className={label ? "" : ""}>
      {label && (
        <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">
          {label}
        </label>
      )}
      <div
        ref={containerRef}
        className={`relative ${disabled ? "pointer-events-none opacity-50" : ""}`}
        onKeyDown={handleKeyDown}
      >
        {/* Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setOpen((prev) => !prev)}
          disabled={disabled}
          className={`flex items-center justify-between gap-2 cursor-pointer text-left
            border border-border rounded-lg
            outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary
            ${className}`}
          style={{ color: value ? 'var(--foreground)' : 'var(--muted-foreground)' }}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="truncate">{value || placeholder}</span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.15 }}
            className="shrink-0 flex items-center"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <ChevronDown size={14} />
          </motion.span>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              ref={listRef}
              initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-lg border shadow-lg"
              style={{
                background: "var(--card)",
                borderColor: "var(--border)",
                maxHeight: 200,
                transformOrigin: "top center"
              }}
              role="listbox"
            >
              <div className="overflow-y-auto" style={{ maxHeight: 200 }}>
                {displayOptions.length === 0 ? (
                  <div className={`px-3 py-2 ${listClassName}`} style={{ color: "var(--muted-foreground)" }}>
                    Không có lựa chọn
                  </div>
                ) : (
                  displayOptions.map((opt, i) => {
                    const isPlaceholder = isPlaceholderItem(i);
                    const selected = !isPlaceholder && options[toOriginalIndex(i)] === value;
                    const highlighted_ = i === highlighted;
                    return (
                      <button
                        key={opt}
                        type="button"
                        data-index={i}
                        role="option"
                        aria-selected={selected}
                        onClick={() => !isPlaceholder && selectOption(opt)}
                        onMouseEnter={() => setHighlighted(i)}
                        className={`flex items-center gap-2 w-full text-left px-3 py-2 ${listClassName} border-none transition-colors ${isPlaceholder ? "cursor-default" : "cursor-pointer"}`}
                        style={{
                          background: isPlaceholder ? "transparent" : highlighted_
                            ? "rgba(79,124,255,0.1)"
                            : "transparent",
                          color: isPlaceholder ? "var(--muted-foreground)" : "var(--foreground)"
                        }}
                      >
                        <span className="truncate flex-1">{opt}</span>
                        {showCheckmark && (
                          <span className="w-4 shrink-0 flex items-center justify-center">
                            {selected && <Check size={12} />}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
