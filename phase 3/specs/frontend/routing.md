# Routing Specification

## Overview

Next.js 16+ App Router structure with file-based routing, protected routes via middleware, and loading/error states.

## Requirements

- Define all application routes
- Implement route protection middleware
- Create loading states for async pages
- Add error boundaries for failures
- Handle redirects for auth state

## Route Definitions

| Path | File | Type | Description |
|------|------|------|-------------|
| `/` | `app/page.tsx` | Redirect | → `/dashboard` or `/auth/signin` |
| `/auth/signin` | `app/auth/signin/page.tsx` | Public | Login form |
| `/auth/signup` | `app/auth/signup/page.tsx` | Public | Registration form |
| `/dashboard` | `app/dashboard/page.tsx` | Protected | Task list interface |
| `/tasks/[id]` | `app/tasks/[id]/page.tsx` | Protected | Task detail/edit |

## File Structure

```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Home redirect
├── loading.tsx             # Global loading
├── error.tsx               # Global error
├── not-found.tsx           # 404 page
├── auth/
│   ├── signin/
│   │   └── page.tsx
│   └── signup/
│       └── page.tsx
├── dashboard/
│   ├── page.tsx
│   └── loading.tsx
└── tasks/
    └── [id]/
        ├── page.tsx
        ├── loading.tsx
        └── error.tsx
```

## Middleware (Route Protection)

```typescript
// middleware.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/auth/signin", "/auth/signup"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isPublicRoute = publicRoutes.includes(pathname);

  // Redirect unauthenticated users to signin
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

## Loading States

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-4" />
      <div className="space-y-3">
        <div className="h-20 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-200 rounded" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
```

## Error Boundaries

```typescript
// app/tasks/[id]/error.tsx
"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="text-center py-10">
      <h2 className="text-xl font-semibold text-error">
        Something went wrong
      </h2>
      <p className="text-gray-600 mt-2">{error.message}</p>
      <button onClick={reset} className="btn-primary mt-4">
        Try again
      </button>
    </div>
  );
}
```

## Not Found Page

```typescript
// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-600 mt-2">Page not found</p>
      <Link href="/dashboard" className="btn-primary mt-4">
        Back to Dashboard
      </Link>
    </div>
  );
}
```

## Acceptance Criteria

- [ ] All routes defined and accessible
- [ ] Middleware protects authenticated routes
- [ ] Loading states display during async operations
- [ ] Error boundaries catch and display errors
- [ ] 404 page handles unknown routes

## Dependencies

- `specs/frontend/authentication.md` - Auth state
- `next/navigation` - Router utilities
