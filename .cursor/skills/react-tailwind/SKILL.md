---
name: react-tailwind
description: >-
  Guides React 19 with Tailwind CSS v4, component patterns, and state management.
  Use when editing src/renderer/**/*.tsx, src/renderer/**/*.ts, components, UI styling,
  or lucide-react icons.
---

# React + Tailwind skill

## React 19
- Use functional components, hooks.
- Strict mode enabled.
- Use `interface` for props.

## Component structure
- One component per file, placed in `src/renderer/components/`.
- Named exports only (no default exports).
- Use `clsx` or `tailwind-merge` to merge classes:

```tsx
import { cn } from '@/lib/utils' // custom utility using clsx and tailwind-merge
```

## Tailwind CSS v4
- Use utility classes directly in JSX.
- No custom CSS files except for global styles in `src/renderer/assets/index.css`.
- Use design tokens from Tailwind (colors, spacing).
- Dark mode: `dark:` prefix supported by default with class strategy (if configured).

## Example component

```tsx
interface ProfileCardProps {
  name: string
  status: 'running' | 'stopped'
  onClick: () => void
}

export function ProfileCard({ name, status, onClick }: ProfileCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border p-4 cursor-pointer transition-colors',
        status === 'running' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
      )}
      onClick={onClick}
    >
      <h3 className="font-semibold text-lg">{name}</h3>
      <span className="text-sm text-gray-500">{status}</span>
    </div>
  )
}
```

## Icons
- Use `lucide-react` for icons (latest version).
