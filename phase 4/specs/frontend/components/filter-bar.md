# FilterBar Component Specification

## Overview

Horizontal bar with filter buttons for task list. Client Component using URL params for filter state persistence.

## Requirements

- Three filter options: All, Pending, Completed
- Visual indication of active filter
- Update URL on filter change
- Persist filter across page refreshes

## Technical Details

```typescript
// components/FilterBar.tsx
"use client"

interface FilterBarProps {
  currentFilter: "all" | "pending" | "completed";
}

type FilterOption = {
  value: "all" | "pending" | "completed";
  label: string;
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| currentFilter | string | Yes | Currently active filter |

## Filter Options

| Value | Label | Description |
|-------|-------|-------------|
| all | All | Show all tasks |
| pending | Pending | Show incomplete tasks |
| completed | Completed | Show completed tasks |

## Visual Design

```
┌─────────────────────────────────────┐
│ [All]  [Pending]  [Completed]       │
└─────────────────────────────────────┘

Active state:
┌─────────────────────────────────────┐
│ [All]  [▣ Pending]  [Completed]     │
└─────────────────────────────────────┘
```

## Styling

```css
/* Tailwind classes */
.filter-bar: "flex gap-2 mb-4"
.filter-btn: "px-4 py-2 rounded-full text-sm"
.filter-inactive: "bg-gray-100 text-gray-600 hover:bg-gray-200"
.filter-active: "bg-primary text-white"
```

## Behaviors

**Click filter**: Update URL search params, trigger data refresh
**Active filter**: Highlighted with primary color

## URL Integration

```typescript
// Filter changes update URL
const handleFilter = (filter: string) => {
  router.push(`/dashboard?filter=${filter}`);
};

// Read from searchParams in page
const filter = searchParams.filter || "all";
```

## Acceptance Criteria

- [ ] Three filter buttons display correctly
- [ ] Active filter visually distinct
- [ ] Clicking filter updates URL
- [ ] Filter persists on page refresh
- [ ] Keyboard accessible (tab navigation)

## Dependencies

- `specs/frontend/pages/dashboard.md` - URL param handling
- `specs/frontend/styling.md` - Button styles

## Examples

```tsx
// In dashboard page
<FilterBar currentFilter={searchParams.filter || "all"} />

// Filter button implementation
<Link
  href={`/dashboard?filter=pending`}
  className={cn(
    "filter-btn",
    currentFilter === "pending" ? "filter-active" : "filter-inactive"
  )}
>
  Pending
</Link>
```
