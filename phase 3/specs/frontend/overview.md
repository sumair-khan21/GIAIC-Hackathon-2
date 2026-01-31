# Frontend Overview

## Overview

Next.js 16+ frontend for the Todo Full-Stack application using App Router. Provides user authentication, task management interface, and responsive design following constitution.md principles.

## Architecture

```
frontend/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home redirect
│   │   ├── auth/
│   │   │   ├── signin/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   └── loading.tsx
│   │   └── tasks/
│   │       └── [id]/page.tsx
│   ├── components/             # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── TaskList.tsx
│   │   └── FilterBar.tsx
│   └── lib/                    # Utilities
│       ├── api.ts              # API client
│       ├── auth.ts             # Better Auth client
│       └── validations.ts      # Zod schemas
├── public/                     # Static assets
└── tailwind.config.ts          # Tailwind configuration
```

## Component Hierarchy

```
RootLayout
├── Header (Client Component)
│   ├── Logo
│   ├── UserInfo
│   └── LogoutButton
└── PageContent
    ├── AuthPages (Client Components)
    │   ├── SigninForm
    │   └── SignupForm
    └── ProtectedPages
        ├── Dashboard (Server Component)
        │   ├── TaskForm (Client Component)
        │   ├── FilterBar (Client Component)
        │   └── TaskList (Server Component)
        │       └── TaskCard (Client Component)
        └── TaskDetail (Server Component)
            ├── TaskForm (Client Component)
            └── DeleteButton (Client Component)
```

## Routing Strategy

| Route | Type | Purpose |
|-------|------|---------|
| `/` | Redirect | → `/dashboard` if auth, else `/auth/signin` |
| `/auth/signin` | Public | Login form |
| `/auth/signup` | Public | Registration form |
| `/dashboard` | Protected | Main task interface |
| `/tasks/[id]` | Protected | Task detail/edit |

## State Management

- **Server Components**: Initial data fetching, SEO
- **Client Components**: Forms, interactivity, local state
- **useState**: Form inputs, loading states, errors
- **No external library**: React built-ins only

## API Client Architecture

All API calls route through `/lib/api.ts`:
- Automatic JWT attachment from Better Auth
- Consistent error handling
- Response parsing with type safety

## Dependencies

- `specs/frontend/authentication.md` - Auth setup
- `specs/frontend/api-client.md` - API integration
- `specs/frontend/routing.md` - Route definitions
