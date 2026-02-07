# Styling Specification

## Overview

Tailwind CSS configuration and design system for consistent styling across the application. Mobile-first responsive design.

## Requirements

- Configure Tailwind with custom theme
- Define color palette
- Establish typography scale
- Set spacing system
- Create component patterns

## Color Palette

| Name | Value | Usage |
|------|-------|-------|
| primary | #3B82F6 (blue-500) | Buttons, links, active states |
| primary-dark | #2563EB (blue-600) | Hover states |
| secondary | #6B7280 (gray-500) | Secondary text, icons |
| success | #10B981 (green-500) | Success messages, completed |
| error | #EF4444 (red-500) | Errors, delete actions |
| warning | #F59E0B (amber-500) | Warnings |
| neutral-50 | #F9FAFB | Backgrounds |
| neutral-100 | #F3F4F6 | Card backgrounds |
| neutral-200 | #E5E7EB | Borders |
| neutral-900 | #111827 | Primary text |

## Typography

| Element | Class | Size |
|---------|-------|------|
| H1 | text-3xl font-bold | 30px |
| H2 | text-2xl font-semibold | 24px |
| H3 | text-xl font-semibold | 20px |
| Body | text-base | 16px |
| Small | text-sm | 14px |
| Caption | text-xs | 12px |

## Spacing System

Use Tailwind's default spacing scale:
- 1 = 4px
- 2 = 8px
- 4 = 16px
- 6 = 24px
- 8 = 32px

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| (default) | 0-639px | Mobile |
| sm | 640px+ | Large mobile |
| md | 768px+ | Tablet |
| lg | 1024px+ | Desktop |
| xl | 1280px+ | Large desktop |

## Component Patterns

### Buttons

```css
/* Primary button */
.btn-primary: "bg-primary text-white px-4 py-2 rounded-lg
               hover:bg-primary-dark disabled:opacity-50"

/* Secondary button */
.btn-secondary: "bg-gray-100 text-gray-700 px-4 py-2 rounded-lg
                 hover:bg-gray-200"

/* Danger button */
.btn-danger: "bg-error text-white px-4 py-2 rounded-lg
              hover:bg-red-600"
```

### Form Inputs

```css
.input: "w-full px-3 py-2 border border-gray-200 rounded-lg
         focus:ring-2 focus:ring-primary focus:border-transparent"

.input-error: "border-error focus:ring-error"

.label: "block text-sm font-medium text-gray-700 mb-1"
```

### Cards

```css
.card: "bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
.card-hover: "hover:shadow-md transition-shadow"
```

## Layout Patterns

```css
/* Container */
.container: "max-w-4xl mx-auto px-4"

/* Page wrapper */
.page: "min-h-screen bg-neutral-50"
```

## Acceptance Criteria

- [ ] Tailwind configured with custom colors
- [ ] Typography scale applied consistently
- [ ] Buttons follow defined patterns
- [ ] Inputs have consistent styling
- [ ] Responsive design works on all breakpoints

## Dependencies

- None (base configuration file)

## Configuration

```typescript
// tailwind.config.ts
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        "primary-dark": "#2563EB",
      },
    },
  },
};
```
