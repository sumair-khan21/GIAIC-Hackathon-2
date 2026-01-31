# Auth Pages Specification

## Overview

Authentication pages for user signup and signin. Both are Client Components using Better Auth for form submission and JWT handling.

## Requirements

- Display email and password input fields
- Validate inputs before submission
- Show loading state during auth request
- Display error messages for failures
- Redirect to dashboard on success
- Link between signin and signup pages

## Signin Page (`/auth/signin`)

### Technical Details

```typescript
// app/auth/signin/page.tsx
"use client"

interface SigninFormData {
  email: string;
  password: string;
}
```

**Form Fields**:
| Field | Type | Validation |
|-------|------|------------|
| Email | email | Required, valid email format |
| Password | password | Required, min 8 characters |

**Actions**:
- Submit → Call Better Auth signIn → Redirect to `/dashboard`
- Link to signup page for new users

**Error States**:
- Invalid credentials → "Invalid email or password"
- Network error → "Unable to connect. Please try again."

## Signup Page (`/auth/signup`)

### Technical Details

```typescript
// app/auth/signup/page.tsx
"use client"

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}
```

**Form Fields**:
| Field | Type | Validation |
|-------|------|------------|
| Email | email | Required, valid email format |
| Password | password | Required, min 8 characters |
| Confirm Password | password | Must match password |

**Actions**:
- Submit → Call Better Auth signUp → Auto signin → Redirect to `/dashboard`
- Link to signin page for existing users

**Error States**:
- Email exists → "An account with this email already exists"
- Passwords mismatch → "Passwords do not match"
- Weak password → "Password must be at least 8 characters"

## Acceptance Criteria

- [ ] Signin form submits valid credentials and redirects
- [ ] Signup form creates account and auto-signs in
- [ ] Validation errors display before submission
- [ ] Server errors display after failed submission
- [ ] Loading spinner shows during submission
- [ ] Navigation links work between auth pages

## Dependencies

- `specs/frontend/authentication.md` - Better Auth setup
- `specs/frontend/validation.md` - Zod schemas
- `specs/frontend/styling.md` - Form styling

## Examples

```tsx
// Error display pattern
{error && (
  <div className="text-red-600 text-sm mt-2">
    {error}
  </div>
)}

// Loading state
<button disabled={isLoading}>
  {isLoading ? "Signing in..." : "Sign In"}
</button>
```
