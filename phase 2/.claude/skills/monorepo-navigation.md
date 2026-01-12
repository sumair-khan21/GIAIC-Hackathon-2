# Monorepo Navigation Skill

Navigate monorepo structure efficiently.

## Reference Specs

| Spec Type | Path |
|-----------|------|
| Feature specs | `@specs/features/task-crud.md` |
| API specs | `@specs/api/rest-endpoints.md` |
| Database specs | `@specs/database/schema.md` |
| UI specs | `@specs/ui/components.md` |

## Context Files

| File | Purpose |
|------|---------|
| `@CLAUDE.md` | Root level project conventions |
| `@frontend/CLAUDE.md` | Frontend-specific guidelines |
| `@backend/CLAUDE.md` | Backend-specific guidelines |

## File Organization

```
/
├── specs/                    # Specifications
│   ├── features/            # Feature specs
│   ├── api/                 # API endpoint specs
│   ├── database/            # Schema definitions
│   └── ui/                  # Component specs
├── frontend/                 # Next.js app
│   └── CLAUDE.md            # Frontend conventions
├── backend/                  # FastAPI app
│   └── CLAUDE.md            # Backend conventions
├── .spec-kit/
│   └── config.yaml          # Project config
└── CLAUDE.md                 # Root conventions
```

## Implementation Workflow

1. **Read relevant spec first**
   - Understand requirements before coding
   - Check acceptance criteria

2. **Check CLAUDE.md for conventions**
   - Root level for global rules
   - Folder-specific for local rules

3. **Implement in appropriate folder**
   - Frontend code → `/frontend/`
   - Backend code → `/backend/`
   - Specs → `/specs/`

4. **Reference other specs if needed**
   - Cross-reference related features
   - Check API contracts match UI needs

## Quick Reference Commands

```bash
# Find all specs
ls specs/**/*.md

# Find frontend components
ls frontend/src/components/

# Find backend routes
ls backend/app/routes/

# Check conventions
cat CLAUDE.md
```

## Best Practices

- [ ] Always read spec before implementing
- [ ] Check conventions in relevant CLAUDE.md
- [ ] Keep code in correct folder structure
- [ ] Cross-reference specs for dependencies
- [ ] Update specs if implementation differs
