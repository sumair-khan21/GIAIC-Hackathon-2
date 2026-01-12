# Quickstart: Next.js Frontend

**Feature**: 001-nextjs-frontend
**Date**: 2026-01-11

## Prerequisites

- Node.js 18+
- npm or pnpm
- Backend API running at http://localhost:8000

## Setup Steps

### 1. Create Next.js Project

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

Options to select:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: @/*

### 2. Install Dependencies

```bash
npm install better-auth react-hook-form zod @hookform/resolvers
```

### 3. Environment Setup

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-32-character-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Folder Structure

After setup, create this structure:

```
frontend/
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   ├── auth/
    │   │   ├── signin/page.tsx
    │   │   └── signup/page.tsx
    │   ├── dashboard/
    │   │   ├── page.tsx
    │   │   └── loading.tsx
    │   └── tasks/
    │       └── [id]/page.tsx
    ├── components/
    │   ├── Header.tsx
    │   ├── TaskCard.tsx
    │   ├── TaskForm.tsx
    │   ├── TaskList.tsx
    │   └── FilterBar.tsx
    ├── lib/
    │   ├── api.ts
    │   ├── auth.ts
    │   └── validations.ts
    └── types/
        ├── auth.ts
        ├── task.ts
        └── api.ts
```

## Verification Checklist

- [ ] `npm run dev` starts without errors
- [ ] TypeScript compiles successfully
- [ ] Tailwind CSS classes work (test with `bg-blue-500`)
- [ ] Environment variables are loaded
- [ ] Can navigate to http://localhost:3000

## Common Issues

### Port Conflict
If port 3000 is in use:
```bash
npm run dev -- -p 3001
```

### TypeScript Errors
Ensure `tsconfig.json` has strict mode enabled and paths configured.

### Tailwind Not Working
Check `tailwind.config.ts` includes all content paths:
```typescript
content: [
  "./src/**/*.{js,ts,jsx,tsx,mdx}",
]
```

## Next Steps

1. Configure Better Auth in `lib/auth.ts`
2. Create TypeScript types in `types/`
3. Implement API client in `lib/api.ts`
4. Build components in `components/`
5. Create pages in `app/`
