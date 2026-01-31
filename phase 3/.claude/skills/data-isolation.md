# Data Isolation Skill

Always filter database queries by authenticated user.

## Pattern in FastAPI Routes

1. Extract user from JWT token
2. Get `user_id` from token
3. Add `WHERE user_id = {authenticated_user_id}` to all queries
4. Never trust `user_id` from URL alone

## Example SQLModel Query

```python
# Get authenticated user from token
current_user = get_current_user(token)

# Filter by authenticated user only
tasks = session.exec(
    select(Task).where(Task.user_id == current_user.id)
).all()
```

## Rules

| Rule | Description |
|------|-------------|
| Always filter | Filter by `user_id` from token on every query |
| No cross-access | Never allow access to other users' data |
| Validate match | Validate `user_id` match between token and URL |
| Return 403 | Return 403 if user tries to access others' resources |

## Common Patterns

### List Resources
```python
items = session.exec(
    select(Item).where(Item.user_id == current_user.id)
).all()
```

### Get Single Resource
```python
item = session.exec(
    select(Item).where(
        Item.id == item_id,
        Item.user_id == current_user.id
    )
).first()
if not item:
    raise HTTPException(status_code=404)
```

### Update Resource
```python
item = session.exec(
    select(Item).where(
        Item.id == item_id,
        Item.user_id == current_user.id
    )
).first()
if not item:
    raise HTTPException(status_code=403)
# proceed with update
```

### Delete Resource
```python
item = session.exec(
    select(Item).where(
        Item.id == item_id,
        Item.user_id == current_user.id
    )
).first()
if not item:
    raise HTTPException(status_code=403)
session.delete(item)
session.commit()
```

## Security Checklist

- [ ] All queries filter by authenticated user_id
- [ ] URL user_id validated against token user_id
- [ ] 403 returned for unauthorized access attempts
- [ ] No direct database access without user filter
