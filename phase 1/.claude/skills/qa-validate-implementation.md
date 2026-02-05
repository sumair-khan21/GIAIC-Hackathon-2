# QA Skill: Validate Implementation

**Owner**: `qa-agent`
**Project**: Todo App (Phase 1 - In-memory, Console-based)

## Purpose

Validate that implemented code matches specification requirements, acceptance criteria, and Phase 1 constraints. Execute test cases and report discrepancies between expected and actual behavior.

## When to Use

- After `/sp.implement` completes
- Before creating pull requests
- When validating bug fixes
- During code review to verify spec compliance

## Inputs

**Required**:
- `spec_path`: Path to specification file (e.g., `specs/add-task/spec.md`)
- `implementation_path`: Path to implementation directory or main file (e.g., `src/todo.py`)

**Optional**:
- `test_cases_path`: Path to test cases file (default: `specs/<feature>/test-cases.md`)
- `validation_mode`: `"automated"` (run tests) or `"manual"` (checklist only)
- `strict`: `true` (fail on warnings) or `false` (warnings only)

## Step-by-Step Process

1. **Load Artifacts**
   - Read `spec.md` for acceptance criteria and requirements
   - Read `test-cases.md` (or generate if missing)
   - Read implementation files

2. **Static Validation**
   - **Acceptance Criteria Check**: For each criterion in spec, find corresponding code implementation
   - **Phase 1 Compliance**: Scan for prohibited patterns:
     - Database imports (`sqlite3`, `psycopg2`, `sqlalchemy`)
     - Web frameworks (`flask`, `django`, `fastapi`)
     - AI/ML libraries (`openai`, `anthropic`, `transformers`)
     - File persistence (`.json`, `.csv`, `.txt` writes)
   - **Code Structure**: Verify functions/classes match architectural plan

3. **Execute Test Cases** (if `validation_mode="automated"`)
   - For each test case in `test-cases.md`:
     - Set up test environment (clear in-memory state)
     - Execute test input
     - Capture actual output
     - Compare with expected output
     - Mark test as PASS/FAIL
     - Record error details if FAIL

4. **Manual Validation Checklist** (if `validation_mode="manual"`)
   - Generate interactive checklist from acceptance criteria
   - Include test case references
   - Prompt for manual verification

5. **Analyze Results**
   - Count PASS/FAIL/SKIP
   - Identify patterns in failures
   - Flag critical vs. minor issues
   - Check Phase 1 constraint violations

6. **Generate Validation Report**
   - Summary statistics
   - Detailed failure descriptions
   - Recommendations for fixes
   - Phase 1 compliance status

## Output

**Success Output** (All Tests Pass):
```markdown
✓ Implementation validation PASSED

📊 Test Results:
  - Total: 24 tests
  - Passed: 24 (100%)
  - Failed: 0
  - Skipped: 0

✓ Phase 1 Compliance: PASS
  - No database usage detected
  - No web framework usage detected
  - No AI/ML library usage detected
  - No file persistence detected

✓ All acceptance criteria met

📄 Detailed report: specs/<feature>/validation-report.md
```

**Failure Output** (Some Tests Fail):
```markdown
❌ Implementation validation FAILED

📊 Test Results:
  - Total: 24 tests
  - Passed: 20 (83%)
  - Failed: 4 (17%)
  - Skipped: 0

❌ Failed Tests:
  1. TC-005: Update task with invalid ID
     - Expected: Error "Task not found"
     - Actual: Application crash with KeyError
     - File: src/todo.py:142

  2. TC-013: Add task with empty title
     - Expected: Error "Title is required"
     - Actual: Task created with empty title
     - File: src/todo.py:67

  [... more failures ...]

⚠️  Phase 1 Compliance: WARNING
  - Found prohibited import: `import json` (src/todo.py:3)
  - Recommendation: Remove JSON persistence; use in-memory only

📄 Detailed report: specs/<feature>/validation-report.md

🔧 Next Steps:
  1. Fix error handling in update_task() (src/todo.py:142)
  2. Add title validation in add_task() (src/todo.py:67)
  3. Remove JSON import and file persistence
```

**Validation Report File** (`validation-report.md`):
```markdown
# Validation Report: <Feature Name>

**Date**: YYYY-MM-DD HH:MM
**Spec**: specs/<feature>/spec.md
**Implementation**: src/todo.py
**Validator**: qa-agent

## Summary

- **Overall Status**: FAILED
- **Pass Rate**: 83% (20/24)
- **Phase 1 Compliance**: WARNING

## Test Results

| ID | Description | Status | Notes |
|----|-------------|--------|-------|
| TC-001 | Add task with valid title | ✓ PASS | - |
| TC-002 | List all tasks | ✓ PASS | - |
| TC-005 | Update invalid ID | ✗ FAIL | KeyError not handled |
| ... | ... | ... | ... |

## Acceptance Criteria Coverage

- [x] AC-1: User can add tasks with title and description
- [x] AC-2: User can list all tasks
- [ ] AC-3: User can update task status (partial: error handling missing)
- [x] AC-4: User can delete tasks

## Phase 1 Compliance Issues

1. **Prohibited Import Detected**
   - File: src/todo.py:3
   - Code: `import json`
   - Issue: Phase 1 requires in-memory only (no persistence)
   - Fix: Remove JSON import and save_to_file() function

## Recommendations

1. **Critical**: Fix error handling in update_task() (src/todo.py:142)
2. **High**: Add input validation for empty titles (src/todo.py:67)
3. **Medium**: Remove JSON persistence for Phase 1 compliance

## Code References

- src/todo.py:67 - Missing title validation
- src/todo.py:142 - Unhandled KeyError
- src/todo.py:3 - Prohibited import
```

## Failure Handling

**Error Conditions**:

1. **Spec file not found**
   - Message: `❌ Error: Specification not found at {spec_path}`
   - Action: Abort validation, request correct path

2. **Implementation files not found**
   - Message: `❌ Error: Implementation not found at {implementation_path}`
   - Action: Search for Python files in project root, suggest alternatives

3. **Test execution crashes**
   - Message: `❌ Error: Test execution failed with exception: {error}`
   - Action: Mark test as FAIL, capture stack trace, continue with remaining tests

4. **No test cases available**
   - Message: `⚠️  Warning: No test cases found. Run /qa-generate-test-cases first.`
   - Action: Offer to generate test cases, or proceed with acceptance criteria only

5. **Ambiguous acceptance criteria**
   - Message: `⚠️  Warning: Acceptance criteria unclear for AC-{n}. Manual verification required.`
   - Action: Flag for manual review, continue validation

**Validation Checks**:
- At least 1 test case executed (else abort)
- All test results have PASS/FAIL/SKIP status (no undefined)
- Phase 1 compliance scan completed
- Report file written successfully

## Notes

- Validation is deterministic: same implementation + same spec → same results
- False positives possible (manual review may be needed)
- Focus on executable verification over subjective code quality
- Phase 1 compliance is non-negotiable (strict check)
