import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  indeterminate = false,
  disabled = false,
  className = ""
}: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`inline-flex items-center justify-center shrink-0 rounded border transition-colors
        outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${checked || indeterminate
          ? "bg-[var(--primary)] border-[var(--primary)]"
          : "bg-transparent border-[var(--border)]"
        }
        ${className}`}
      style={{ width: 16, height: 16, minWidth: 16 }}
    >
      {indeterminate ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-2 h-0.5 rounded-full bg-white"
        />
      ) : checked ? (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.12 }}
        >
          <Check size={11} color="white" strokeWidth={3} />
        </motion.span>
      ) : null}
    </button>
  );
}
