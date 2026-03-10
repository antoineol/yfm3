# Design System

Tokens live in `src/ui/index.css` (`@theme` block). Reusable components live in `src/ui/components/`.

This doc covers **conventions not obvious from reading the code** — things an agent or developer needs to know to make consistent choices.

## Color Semantics

Four background layers, from darkest to lightest: `bg-deep` → `bg-panel` → `bg-surface` → `bg-hover`.

Gold is the primary accent. `stat-atk` doubles as the error color (input validation, error messages).

## Spacing Conventions

Uses Tailwind's default 4px-based scale — no custom tokens.

| Context | Classes |
|---|---|
| Panel padding | `p-3` |
| Dialog padding | `p-5` |
| Page-level padding | `px-3` |
| Input padding | `px-3 py-2` (compact inline inputs may use `py-1.5`) |
| Empty/loading states | `py-16 gap-3` |

**Gap hierarchy** (largest to smallest):

| Level | Class | Usage |
|---|---|---|
| Major | `gap-6` | Between tabs, sign-in sections |
| Section | `gap-3` | Between panels, form fields |
| Item | `gap-2` | Between inline items |
| Tight | `gap-1.5` | Label-to-value, label-to-input |

## Patterns

**Label style:** `text-xs text-text-secondary uppercase tracking-wide`

**Focus ring:** `focus:ring-1 focus:ring-gold focus:border-gold`

**Border radius:** `rounded-xl` (panels), `rounded-lg` (inputs, buttons, dropdowns), `rounded-md` (small elements)
