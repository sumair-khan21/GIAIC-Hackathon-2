# QA Skill: Create Bug Report

**Owner**: `qa-agent`
**Project**: Todo App (Phase 1 - In-memory, Console-based)

## Purpose

Create detailed, actionable bug reports when implementation defects are discovered during validation or testing. Reports include reproduction steps, expected vs. actual behavior, code references, and severity classification.

## When to Use

- When validation tests fail (from `qa-validate-implementation`)
- When manual testing reveals defects
- When acceptance criteria are not met
- When Phase 1 constraints are violated

## Inputs

**Required**:
- `bug_description`: Brief summary of the bug (e.g., "App crashes when updating non-existent task")
- `spec_path`: Path to related specification (e.g., `specs/update-task/spec.md`)

**Optional**:
- `test_case_id`: Related test case ID (e.g., `"TC-005"`)
- `severity`: `"critical"`, `"high"`, `"medium"`, `"low"` (auto-detected if not provided)
- `affected_file`: File where bug exists (e.g., `src/todo.py`)
- `line_number`: Specific line number where bug occurs
- `error_output`: Stack trace or error message

## Step-by-Step Process

1. **Gather Context**
   - Read specification to understand expected behavior
   - Load test case details if `test_case_id` provided
   - Review acceptance criteria related to bug

2. **Classify Severity** (if not provided)
   - **Critical**: App crash, data loss, complete feature failure, Phase 1 violation
   - **High**: Major functionality broken, incorrect results, security issue
   - **Medium**: Minor functionality issue, poor UX, recoverable error
   - **Low**: Cosmetic issue, typo, minor inconsistency

3. **Identify Root Cause** (best effort)
   - Read `affected_file` if provided
   - Locate relevant code section
   - Identify probable cause (e.g., missing validation, unhandled exception)

4. **Generate Reproduction Steps**
   - Create minimal, deterministic steps to reproduce
   - Include exact input values
   - Specify starting state (e.g., "Start with empty task list")

5. **Document Expected vs. Actual**
   - **Expected**: Reference spec or acceptance criteria
   - **Actual**: Describe observed behavior with exact output

6. **Create Bug Report**
   - Assign unique bug ID (format: `BUG-YYYYMMDD-NNN`)
   - Include all required sections
   - Add code references where applicable
   - Tag with labels (e.g., `validation`, `edge-case`, `phase1-violation`)

7. **Save Bug Report**
   - Write to `specs/<feature>/bugs/BUG-{id}.md`
   - Update bug tracker index if exists

## Output

**Success Output**:
```markdown
🐛 Bug report created: BUG-20250131-001

**Severity**: High
**Feature**: Update Task
**Status**: Open

📄 Report saved to: specs/update-task/bugs/BUG-20250131-001.md

Summary: Application crashes when updating non-existent task ID
```

**Bug Report File** (`BUG-20250131-001.md`):
```markdown
# Bug Report: BUG-20250131-001

**Title**: Application crashes when updating non-existent task ID
**Created**: 2025-01-31 14:23:45
**Reporter**: qa-agent
**Severity**: High
**Status**: Open
**Feature**: Update Task
**Spec**: specs/update-task/spec.md
**Test Case**: TC-005

## Summary

The application crashes with an unhandled `KeyError` when attempting to update a task that does not exist in the in-memory store.

## Expected Behavior

According to acceptance criteria AC-3 in `specs/update-task/spec.md`:
- When user attempts to update a task with an invalid ID
- System should return error message: "Task not found"
- Application should remain stable

## Actual Behavior

- Application crashes with `KeyError: 999`
- Stack trace printed to console
- Application exits (user loses session)

## Reproduction Steps

1. Start application with empty task list
2. Add one task (ID will be 1)
3. Attempt to update task with ID=999:
   ```
   Input: update_task(id=999, status="completed")
   ```
4. Observe crash

## Environment

- **Python Version**: 3.11
- **OS**: Linux
- **Branch**: feature/update-task
- **Phase**: 1 (In-memory, Console)

## Error Output

```
Traceback (most recent call last):
  File "src/todo.py", line 156, in main
    update_task(task_id=999, status="completed")
  File "src/todo.py", line 142, in update_task
    task = tasks[task_id]
KeyError: 999
```

## Root Cause Analysis

**File**: `src/todo.py:142`

```python
def update_task(task_id, status=None, title=None, description=None):
    task = tasks[task_id]  # <-- No validation; KeyError if ID doesn't exist
    if status:
        task['status'] = status
    # ...
```

**Issue**: Missing validation to check if `task_id` exists before accessing dictionary.

## Suggested Fix

Add validation before dictionary access:

```python
def update_task(task_id, status=None, title=None, description=None):
    if task_id not in tasks:
        return {"error": "Task not found"}

    task = tasks[task_id]
    if status:
        task['status'] = status
    # ...
```

## Labels

- `validation`
- `error-handling`
- `high-severity`
- `update-task`

## Related

- Test Case: TC-005 (Update task with invalid ID)
- Acceptance Criteria: AC-3 (Error handling for invalid IDs)
- Spec: specs/update-task/spec.md

## Checklist

- [ ] Fix implemented
- [ ] Test case TC-005 passes
- [ ] Manual testing completed
- [ ] Code reviewed
- [ ] Bug verified as resolved
```

**Index Update** (if `bugs/index.md` exists):
```markdown
# Bug Tracker: Update Task Feature

| Bug ID | Severity | Status | Title | Created |
|--------|----------|--------|-------|---------|
| BUG-20250131-001 | High | Open | App crashes on invalid task ID | 2025-01-31 |
```

## Failure Handling

**Error Conditions**:

1. **Spec file not found**
   - Message: `⚠️  Warning: Spec not found at {spec_path}. Bug report created without spec reference.`
   - Action: Continue without spec context, mark as "spec-missing" label

2. **Duplicate bug (same description exists)**
   - Message: `⚠️  Warning: Similar bug already reported (BUG-{existing_id}). Creating new report anyway.`
   - Action: Increment bug ID, add "duplicate-candidate" label, create report

3. **Cannot create bugs directory**
   - Message: `❌ Error: Cannot create specs/<feature>/bugs/. Check permissions.`
   - Action: Write bug report to project root as `BUG-{id}.md`, notify user

4. **Missing required context** (no `bug_description`)
   - Message: `❌ Error: bug_description is required.`
   - Action: Abort, request description

5. **Test case ID invalid** (test case not found)
   - Message: `⚠️  Warning: Test case {test_case_id} not found. Report created without test reference.`
   - Action: Continue, omit test case section

**Validation Checks**:
- Bug ID is unique (no file collision)
- Severity is one of: critical, high, medium, low
- All required sections present (Summary, Expected, Actual, Reproduction Steps)
- Markdown formatting valid
- File written successfully

## Notes

- Bug IDs use date prefix for chronological sorting
- Reports are immutable once created (status updated via separate mechanism)
- Focus on actionable information: exact steps, exact errors, exact fixes
- Include code references with line numbers for rapid fixing
- One bug per report (decompose complex issues into multiple bugs)
