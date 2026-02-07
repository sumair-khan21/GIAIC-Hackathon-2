# Header Component Specification

## Overview

Application header displaying logo, user information, and logout button. Client Component for logout interactivity. Present on all authenticated pages.

## Requirements

- Display application name/logo
- Show current user's email
- Provide logout button
- Responsive layout for mobile
- Sticky positioning at top

## Technical Details

```typescript
// components/Header.tsx
"use client"

interface HeaderProps {
  user: {
    email: string;
  };
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| user | { email: string } | Yes | Current user data |

## Visual Design

**Desktop**:
```
┌─────────────────────────────────────────────────┐
│ Todo App                    user@email.com [↪] │
└─────────────────────────────────────────────────┘
```

**Mobile**:
```
┌─────────────────────────────────────┐
│ Todo App                        [↪] │
└─────────────────────────────────────┘
```

## Styling

```css
/* Tailwind classes */
.header: "sticky top-0 z-50 bg-white border-b px-4 py-3"
.logo: "font-bold text-xl text-primary"
.user-email: "text-sm text-gray-600 hidden md:block"
.logout-btn: "text-gray-500 hover:text-gray-700"
```

## Behaviors

**Logo click**: Navigate to `/dashboard`
**Logout click**: Sign out via Better Auth → Redirect to `/auth/signin`

## Logout Flow

1. User clicks logout button
2. Call Better Auth signOut method
3. Clear any local state
4. Redirect to signin page
5. Show success message (optional)

## Acceptance Criteria

- [ ] Logo displays application name
- [ ] User email visible on desktop
- [ ] Logout button functional
- [ ] Redirects to signin after logout
- [ ] Responsive layout works on mobile
- [ ] Header stays fixed on scroll

## Dependencies

- `specs/frontend/authentication.md` - signOut method
- `specs/frontend/styling.md` - Colors and spacing

## Examples

```tsx
// In layout or page
<Header user={{ email: session.user.email }} />

// Logout handler
const handleLogout = async () => {
  await authClient.signOut();
  router.push("/auth/signin");
};
```
