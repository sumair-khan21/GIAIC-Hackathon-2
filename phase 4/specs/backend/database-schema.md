# Database Schema

## Requirements

- Single table: tasks
- User isolation via user_id foreign key
- Automatic timestamps for created_at/updated_at
- Indexed for common query patterns

## Tasks Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| user_id | VARCHAR(255) | NOT NULL, INDEXED |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NULLABLE, MAX 1000 |
| completed | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW(), ON UPDATE |

## Indexes

```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_completed ON tasks(user_id, completed);
CREATE INDEX idx_tasks_user_created ON tasks(user_id, created_at DESC);
```

## Constraints

- user_id: Required, links to Better Auth user
- title: 1-200 characters, not empty
- description: Optional, max 1000 characters
- completed: Boolean, defaults to false

## Data Isolation Rules

- ALL queries MUST include `WHERE user_id = :authenticated_user_id`
- No endpoint exposes data across users
- Task ownership verified before any operation

## Security

- No cascading deletes (user deletion handled separately)
- user_id comes from verified JWT, never from request body
- Queries parameterized to prevent SQL injection

## Acceptance Criteria

- [ ] Tasks table created with all columns
- [ ] Indexes created for user_id queries
- [ ] Timestamps auto-populate on insert/update
- [ ] Boolean default works for completed field
