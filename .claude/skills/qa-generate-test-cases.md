# QA Skill: Generate Test Cases

**Owner**: `qa-agent`
**Project**: Todo App (Phase 1 - In-memory, Console-based)

## Purpose

Generate comprehensive, actionable test cases from feature specifications that cover functional requirements, edge cases, and Phase 1 constraints (in-memory storage, console interface, basic CRUD).

## When to Use

- After `/sp.specify` completes and `spec.md` is created
- Before `/sp.implement` begins
- When acceptance criteria need test case expansion
- When updating existing features that need test coverage validation

## Inputs

**Required**:
- `spec_path`: Absolute path to `spec.md` file (e.g., `specs/add-task/spec.md`)

**Optional**:
- `focus_area`: Specific section to test (`"CRUD"`, `"validation"`, `"edge-cases"`, `"all"`)
- `format`: Output format (`"checklist"`, `"table"`, `"markdown"`)

## Step-by-Step Process

1. **Read Specification**
   - Load `spec.md` from provided path
   - Extract acceptance criteria, inputs, outputs, constraints
   - Identify Phase 1 boundaries (no DB, no web, no AI)

2. **Generate Functional Test Cases**
   - For each CRUD operation (Create, Read, Update, Delete):
     - Happy path scenarios
     - Required field validation
     - Data type validation
     - Constraint validation (e.g., title max length)

3. **Generate Edge Case Tests**
   - Empty input handling
   - Boundary values (min/max lengths, counts)
   - Duplicate handling
   - Non-existent ID operations
   - Special characters in text fields

4. **Generate Phase 1 Constraint Tests**
   - In-memory persistence (data lost on exit)
   - Console-only interaction (no GUI elements)
   - No database operations
   - No network/API calls

5. **Format Output**
   - Organize by category (Functional, Edge Cases, Constraints)
   - Number each test case sequentially
   - Include: Test ID, Description, Input, Expected Output, Pass/Fail status placeholder

6. **Write Test Cases File**
   - Save to `specs/<feature>/test-cases.md`
   - Use consistent markdown format
   - Include summary statistics (total tests, coverage areas)

## Output

**Success Output**:
```markdown
✓ Generated 24 test cases for <feature-name>
  - 12 functional tests (CRUD operations)
  - 8 edge case tests
  - 4 Phase 1 constraint tests

📄 Test cases saved to: specs/<feature>/test-cases.md
```

**File Structure** (`test-cases.md`):
```markdown
# Test Cases: <Feature Name>

**Generated**: YYYY-MM-DD
**Spec Version**: 1.0
**Phase**: 1 (In-memory, Console)

## Summary
- Total Tests: 24
- Functional: 12
- Edge Cases: 8
- Constraints: 4

## Functional Tests

### TC-001: Add task with valid title
- **Input**: `title="Buy groceries", description="Milk and eggs"`
- **Expected**: Task created with ID, status="pending", timestamps set
- **Status**: [ ]

[... more test cases ...]

## Edge Case Tests

### TC-013: Add task with empty title
- **Input**: `title="", description="Test"`
- **Expected**: Error message "Title is required"
- **Status**: [ ]

[... more test cases ...]

## Phase 1 Constraint Tests

### TC-021: Verify in-memory storage
- **Input**: Add task, exit app, restart app
- **Expected**: Previous task is not persisted (memory-only)
- **Status**: [ ]
```

## Failure Handling

**Error Conditions**:

1. **Spec file not found**
   - Message: `❌ Error: Specification not found at {spec_path}`
   - Action: Verify path and retry

2. **Incomplete spec (missing acceptance criteria)**
   - Message: `⚠️  Warning: Acceptance criteria incomplete. Generated {n} basic tests only.`
   - Action: Continue with available information, flag for spec review

3. **Invalid focus_area**
   - Message: `❌ Error: Invalid focus_area "{value}". Use: CRUD, validation, edge-cases, or all`
   - Action: Default to `"all"` and proceed

4. **Write permission denied**
   - Message: `❌ Error: Cannot write to specs/<feature>/. Check permissions.`
   - Action: Output test cases to stdout instead

**Validation Checks**:
- Minimum 10 test cases generated (else flag as incomplete coverage)
- All acceptance criteria have at least 1 corresponding test
- No duplicate test case IDs
- All tests follow Phase 1 constraints (no DB/web/AI tests)

## Notes

- Test cases are deterministic: same spec → same test cases
- Prioritize coverage over quantity
- Each test case must be independently executable
- Use task IDs consistently (e.g., ID=1 for first task in examples)
