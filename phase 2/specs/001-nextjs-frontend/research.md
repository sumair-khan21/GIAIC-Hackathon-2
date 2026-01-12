# Research: Next.js Frontend Implementation

**Feature**: 001-nextjs-frontend
**Date**: 2026-01-11
**Status**: Complete

## Technology Decisions

### 1. Next.js Version Selection

**Decision**: Next.js 16+ with App Router

**Rationale**:
- Constitution mandates Next.js 16+ (App Router only)
- Server Components for data fetching reduces client bundle
- Built-in routing eliminates need for react-router
- React 19 support with improved performance

**Alternatives Considered**:
- Pages Router: Rejected per constitution requirement
- Vite + React: Rejected - doesn't provide SSR/SSG out of box

### 2. Authentication Library

**Decision**: Better Auth with JWT plugin

**Rationale**:
- Constitution specifies Better Auth + JWT
- Modern, TypeScript-first auth library
- Built-in JWT support with httpOnly cookies
- Works well with Next.js App Router

**Alternatives Considered**:
- NextAuth.js: More mature but heavier, not specified in constitution
- Auth0: External service, adds complexity
- Custom JWT: Too much work for hackathon scope

### 3. Form Handling

**Decision**: React Hook Form + Zod

**Rationale**:
- Zod provides type-safe schema validation
- React Hook Form has minimal re-renders
- Both work well with TypeScript
- Industry standard combination

**Alternatives Considered**:
- Formik: Heavier bundle, more boilerplate
- Native HTML validation: Insufficient for complex rules

### 4. Styling Approach

**Decision**: Tailwind CSS (utility-first)

**Rationale**:
- Constitution mandates Tailwind CSS
- No custom CSS files needed
- Responsive design built-in
- Component extraction for reuse

**Alternatives Considered**:
- CSS Modules: Requires separate files
- Styled Components: Adds runtime overhead

### 5. State Management

**Decision**: React built-ins (useState, useReducer)

**Rationale**:
- Constitution specifies no external state library
- Server Components reduce need for client state
- URL params for filter persistence
- Simpler architecture for hackathon scope

**Alternatives Considered**:
- Redux: Overkill for this scope
- Zustand: Not needed with Server Components

### 6. API Client Pattern

**Decision**: Native fetch with typed wrapper

**Rationale**:
- Next.js has built-in fetch with caching
- Simpler than axios for this scope
- Easy JWT header attachment
- TypeScript types for responses

**Alternatives Considered**:
- Axios: Adds dependency, not needed
- React Query: Good but adds complexity

## Implementation Patterns

### Server vs Client Components

| Use Server Components For | Use Client Components For |
|--------------------------|--------------------------|
| Initial data fetching | Forms with onChange |
| Static content | Interactive buttons |
| SEO-critical pages | Local state management |
| Layout structures | Event handlers |

### Protected Routes Pattern

Using middleware.ts for route protection:
```typescript
// Intercept requests before they reach routes
// Check auth token in cookies
// Redirect to /auth/signin if missing
```

### Error Handling Strategy

1. API errors → Parse and display user-friendly message
2. Network errors → Show "Connection failed" state
3. 401 errors → Redirect to signin
4. Form validation → Inline error display
5. Unexpected errors → Error boundary with retry

### Data Fetching Pattern

```
Server Component: Fetch initial data
  ↓
Pass data as props to Client Components
  ↓
Mutations trigger router.refresh()
  ↓
Server Component re-fetches fresh data
```

## Dependencies List

### Production Dependencies

```json
{
  "better-auth": "^1.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x",
  "@hookform/resolvers": "^3.x"
}
```

### Dev Dependencies

```json
{
  "typescript": "^5.x",
  "@types/react": "^19.x",
  "@types/node": "^20.x"
}
```

## Performance Considerations

1. **Bundle Size**: Use Server Components to reduce client JS
2. **Initial Load**: Fetch data on server for faster TTFB
3. **Interactivity**: Only use Client Components where needed
4. **Images**: Use next/image for optimization (if images added)
5. **Caching**: Leverage Next.js built-in fetch caching

## Security Considerations

1. **JWT Storage**: httpOnly cookies (not localStorage)
2. **CORS**: Configure allowed origins
3. **Input Validation**: Validate all forms with Zod
4. **Error Messages**: Don't expose internal errors
5. **Environment Variables**: Use NEXT_PUBLIC_ prefix carefully

## Open Questions (Resolved)

| Question | Resolution |
|----------|------------|
| Which Next.js version? | 16+ per constitution |
| Auth library? | Better Auth per constitution |
| State management? | React built-ins per constitution |
| Styling? | Tailwind CSS per constitution |
| Backend URL? | http://localhost:8000 per spec |
