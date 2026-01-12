# Authentication Specification

## Overview

Better Auth integration for user authentication with JWT tokens. Handles signup, signin, session management, and protected routes.

## Requirements

- Configure Better Auth client
- Enable JWT plugin for token generation
- Store tokens in httpOnly cookies
- Protect routes requiring authentication
- Provide logout functionality

## Technical Details

```typescript
// lib/auth.ts
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});
```

## Configuration

| Variable | Value | Description |
|----------|-------|-------------|
| NEXT_PUBLIC_BETTER_AUTH_URL | http://localhost:3000 | Auth server URL |
| BETTER_AUTH_SECRET | [random-32-chars] | JWT signing secret |

## Auth Flows

### Signup Flow

1. User submits email + password
2. Call `authClient.signUp({ email, password })`
3. Better Auth creates user + generates JWT
4. Token stored in httpOnly cookie
5. Redirect to `/dashboard`

### Signin Flow

1. User submits email + password
2. Call `authClient.signIn({ email, password })`
3. Better Auth validates credentials
4. Token stored in httpOnly cookie
5. Redirect to `/dashboard`

### Logout Flow

1. User clicks logout
2. Call `authClient.signOut()`
3. Cookie cleared
4. Redirect to `/auth/signin`

## Session Management

```typescript
// Get current session (Server Component)
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return <Dashboard user={session.user} />;
}

// Get session (Client Component)
const { data: session } = authClient.useSession();
```

## Protected Routes

### Middleware Pattern

```typescript
// middleware.ts
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth");

  if (!isLoggedIn && !isAuthPage) {
    return Response.redirect(new URL("/auth/signin", req.url));
  }

  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|favicon.ico).*)"],
};
```

## Token Handling

- Tokens stored as httpOnly cookies (not localStorage)
- Token included automatically via cookies
- For API calls, extract token from session
- Token expiry: 7 days (per constitution)

## Acceptance Criteria

- [ ] Better Auth client configured
- [ ] Signup creates account and signs in
- [ ] Signin validates and sets token
- [ ] Protected routes redirect unauthenticated users
- [ ] Logout clears session and redirects
- [ ] Token attached to API requests

## Dependencies

- `.specify/memory/constitution.md` - Auth requirements

## Examples

```typescript
// Signin handler
const handleSignin = async (email: string, password: string) => {
  const { error } = await authClient.signIn({ email, password });
  if (error) throw new Error(error.message);
  router.push("/dashboard");
};

// Check auth in Server Component
const session = await auth();
const userId = session?.user?.id;
```
