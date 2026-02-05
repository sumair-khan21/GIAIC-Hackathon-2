---
description: "Task list for Phase I Todo Application implementation"
---

# Tasks: Phase I Todo Application

**Input**: Design documents from `/specs/001-phase-i-todo-app/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), contracts/ (complete)

**Tests**: Not requested in Phase I specification - manual acceptance testing only

**Organization**: Tasks are grouped by user story (US1-US5) to enable independent implementation and testing of each story

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below use single project structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic Python structure

- [X] T001 Create `src/` directory structure with `__init__.py`
- [X] T002 [P] Create empty `src/models.py` file for Task data structures
- [X] T003 [P] Create empty `src/operations.py` file for CRUD operations
- [X] T004 [P] Create empty `src/cli.py` file for console interface
- [X] T005 [P] Create empty `src/main.py` file for application entry point
- [X] T006 Create `requirements.txt` with Python version requirement (python>=3.13)

**Checkpoint**: Project structure matches plan.md specification

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Implement Task data structure in `src/models.py` (id, title, description, status fields)
- [X] T008 Implement in-memory storage initialization in `src/operations.py` (tasks dict, next_id counter)
- [X] T009 Implement main menu display function in `src/cli.py` (menu options 1-7)
- [X] T010 Implement menu input handling and validation in `src/cli.py` (numeric choice 1-7)
- [X] T011 Implement main application loop in `src/main.py` (display menu, get choice, route to operations)
- [X] T012 Implement exit functionality in `src/cli.py` (option 7, goodbye message)

**Checkpoint**: Foundation ready - application starts, displays menu, accepts input, and exits gracefully

---

## Phase 3: User Story 1 - Add New Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable users to create new tasks with title and description

**Independent Test**: Launch app, select "Add Task", enter title "Buy groceries" and description "Milk, eggs, bread", confirm task added with ID 1, list tasks to verify task appears

**Spec Reference**: spec.md User Story 1, FR-002, FR-003, FR-004, FR-010

### Implementation for User Story 1

- [X] T013 [P] [US1] Implement `add_task()` function in `src/operations.py` (title required, description optional)
- [X] T014 [P] [US1] Implement title validation in `src/operations.py` (non-empty check per FR-010)
- [X] T015 [US1] Implement sequential ID generation in `src/operations.py` (auto-increment next_id)
- [X] T016 [US1] Implement task creation with default status "Incomplete" in `src/operations.py`
- [X] T017 [US1] Implement add task CLI flow in `src/cli.py` (prompts for title and description)
- [X] T018 [US1] Integrate add task operation with menu option 1 in `src/cli.py`
- [X] T019 [US1] Implement success confirmation message in `src/cli.py` ("Task added successfully (ID: X)")
- [X] T020 [US1] Implement error message for empty title in `src/cli.py` ("Error: Title is required")

**Checkpoint**: At this point, User Story 1 should be fully functional - users can add tasks with title/description and see confirmation

---

## Phase 4: User Story 2 - View All Tasks (Priority: P2)

**Goal**: Enable users to view all tasks in a clear, formatted list

**Independent Test**: Add 2-3 tasks using User Story 1, select "List Tasks", verify all tasks display with ID, title, description, status

**Spec Reference**: spec.md User Story 2, FR-005, FR-016

### Implementation for User Story 2

- [X] T021 [P] [US2] Implement `list_tasks()` function in `src/operations.py` (return all tasks sorted by ID)
- [X] T022 [P] [US2] Implement task list formatting in `src/cli.py` (display ID, title, description, status)
- [X] T023 [US2] Implement empty list handling in `src/cli.py` ("No tasks found" message)
- [X] T024 [US2] Implement list tasks CLI flow in `src/cli.py` (section header, formatted output, task count)
- [X] T025 [US2] Integrate list tasks operation with menu option 2 in `src/cli.py`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - users can add tasks and view complete list

---

## Phase 5: User Story 3 - Mark Tasks Complete/Incomplete (Priority: P3)

**Goal**: Enable users to toggle task status between "Complete" and "Incomplete"

**Independent Test**: Add a task, list to verify status "Incomplete", mark complete with task ID, list to verify status "Complete", mark incomplete, list to verify status "Incomplete"

**Spec Reference**: spec.md User Story 3, FR-008, FR-009, FR-011

### Implementation for User Story 3

- [X] T026 [P] [US3] Implement `mark_complete()` function in `src/operations.py` (set status to "Complete")
- [X] T027 [P] [US3] Implement `mark_incomplete()` function in `src/operations.py` (set status to "Incomplete")
- [X] T028 [P] [US3] Implement task ID validation in `src/operations.py` (numeric check, existence check per FR-011)
- [X] T029 [US3] Implement mark complete CLI flow in `src/cli.py` (prompt for ID, validate, update status)
- [X] T030 [US3] Implement mark incomplete CLI flow in `src/cli.py` (prompt for ID, validate, update status)
- [X] T031 [US3] Integrate mark complete operation with menu option 5 in `src/cli.py`
- [X] T032 [US3] Integrate mark incomplete operation with menu option 6 in `src/cli.py`
- [X] T033 [US3] Implement success messages in `src/cli.py` ("Task marked as complete"/"Task marked as incomplete")
- [X] T034 [US3] Implement error messages in `src/cli.py` ("Task not found", "Task ID must be a number")

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - users can add, list, and toggle task status

---

## Phase 6: User Story 4 - Update Task Details (Priority: P4)

**Goal**: Enable users to modify task title and/or description without deletion

**Independent Test**: Add a task, update title only, list to verify title changed and description unchanged, update description only, list to verify description changed

**Spec Reference**: spec.md User Story 4, FR-006, FR-010, FR-011

### Implementation for User Story 4

- [X] T035 [P] [US4] Implement `update_task()` function in `src/operations.py` (update title and/or description)
- [X] T036 [P] [US4] Implement partial update logic in `src/operations.py` (update only provided fields)
- [X] T037 [US4] Implement update task CLI flow in `src/cli.py` (prompt for ID, new title, new description)
- [X] T038 [US4] Implement "keep current" functionality in `src/cli.py` (empty input preserves existing value)
- [X] T039 [US4] Integrate update task operation with menu option 3 in `src/cli.py`
- [X] T040 [US4] Implement success message in `src/cli.py` ("Task updated successfully")
- [X] T041 [US4] Implement validation for empty title on update in `src/cli.py` ("Error: Title cannot be empty")

**Checkpoint**: At this point, User Stories 1-4 should all work independently - users can add, list, mark complete, and update tasks

---

## Phase 7: User Story 5 - Delete Tasks (Priority: P5)

**Goal**: Enable users to remove tasks they no longer need

**Independent Test**: Add 3 tasks, delete task ID 2, list to verify task 2 gone and tasks 1 and 3 remain with original IDs

**Spec Reference**: spec.md User Story 5, FR-007, FR-011, FR-018

### Implementation for User Story 5

- [X] T042 [P] [US5] Implement `delete_task()` function in `src/operations.py` (remove from tasks dict)
- [X] T043 [P] [US5] Verify ID preservation after deletion in `src/operations.py` (next_id not decremented per FR-018)
- [X] T044 [US5] Implement delete task CLI flow in `src/cli.py` (prompt for ID, validate, delete)
- [X] T045 [US5] Integrate delete task operation with menu option 4 in `src/cli.py`
- [X] T046 [US5] Implement success message in `src/cli.py` ("Task deleted successfully")

**Checkpoint**: All five user stories should now be independently functional and testable

---

## Phase 8: Edge Cases & Error Handling

**Purpose**: Implement comprehensive validation and error handling per spec edge cases

**Spec Reference**: spec.md Edge Cases section, FR-012, SC-006, SC-007

- [X] T047 [P] Implement empty task ID handling in `src/cli.py` ("Error: Task ID is required")
- [X] T048 [P] Implement non-numeric task ID handling in `src/cli.py` (validation before conversion)
- [X] T049 [P] Implement special character handling in `src/operations.py` (store as-is per FR-017)
- [X] T050 [P] Implement whitespace stripping for title input in `src/cli.py` (leading/trailing only)
- [X] T051 Verify error messages match exact spec text in `src/cli.py` (per contracts/cli-menu.md)
- [X] T052 Verify 100% feedback requirement in `src/cli.py` (no silent failures per SC-007)
- [X] T053 Test long title handling (500 characters) in `src/cli.py` (display without truncation)
- [X] T054 Test task ID gap handling after deletion in `src/operations.py` (IDs 1, 2, 4, 5 after deleting 3)

**Checkpoint**: All edge cases from spec.md handled correctly and defensively

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and compliance validation

**Spec Reference**: Constitution Phase I constraints, spec.md Success Criteria

- [X] T055 [P] Verify no prohibited imports in all `src/` files (no sqlite3, flask, openai, json for persistence)
- [X] T056 [P] Verify PEP 8 compliance in all `src/` files (formatting, naming conventions)
- [X] T057 [P] Add module-level docstrings to `src/models.py`, `src/operations.py`, `src/cli.py`
- [X] T058 Verify in-memory data loss on exit in `src/main.py` (expected behavior confirmed)
- [X] T059 Test with 1000 tasks in `src/operations.py` (performance validation per SC-005)
- [X] T060 Verify all success criteria SC-001 through SC-008 from spec.md
- [X] T061 Create project README.md with quickstart instructions (reference quickstart.md)
- [X] T062 Final manual acceptance test of all 5 operations (add, list, update, delete, mark complete)

**Checkpoint**: Application is demo-ready and fully compliant with Phase I Constitution

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational (Phase 2) completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5)
- **Edge Cases (Phase 8)**: Depends on all user stories (Phase 3-7) being complete
- **Polish (Phase 9)**: Depends on Edge Cases (Phase 8) completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independently testable)

**Key Insight**: All user stories are independent! Once Foundational phase is complete, all 5 stories can be developed in parallel by different team members.

### Within Each User Story

- Implementation tasks within a story can be parallelized if marked [P] (different files)
- Tasks without [P] marker have dependencies on prior tasks in same story
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 Setup**: T002, T003, T004, T005 can run in parallel (different files)
- **Phase 2 Foundational**: Most tasks are sequential (shared files)
- **Phase 3 (US1)**: T013 and T014 can run in parallel (no dependencies)
- **Phase 4 (US2)**: T021 and T022 can run in parallel (different files)
- **Phase 5 (US3)**: T026, T027, T028 can run in parallel (independent functions)
- **Phase 6 (US4)**: T035 and T036 can run in parallel (related but independent)
- **Phase 7 (US5)**: T042 and T043 can run in parallel (verification vs implementation)
- **Phase 8 Edge Cases**: T047, T048, T049, T050 can all run in parallel (different validations)
- **Phase 9 Polish**: T055, T056, T057 can run in parallel (different concerns)
- **User Stories 1-5**: ALL can run in parallel once Foundational phase completes

---

## Parallel Example: User Story 1

```bash
# Launch parallelizable tasks for User Story 1 together:
T013: "Implement add_task() function in src/operations.py"
T014: "Implement title validation in src/operations.py"

# Then launch sequential tasks:
T015: "Implement sequential ID generation" (depends on T013)
T016: "Implement task creation with default status" (depends on T013, T015)
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T012) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T013-T020) - Add tasks
4. Complete Phase 4: User Story 2 (T021-T025) - List tasks
5. **STOP and VALIDATE**: Test adding and listing tasks independently
6. Deploy/demo if ready (MVP delivers core value: capture and review tasks)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Add tasks)
3. Add User Story 2 → Test independently → Deploy/Demo (MVP: Add + List!)
4. Add User Story 3 → Test independently → Deploy/Demo (Mark Complete)
5. Add User Story 4 → Test independently → Deploy/Demo (Update tasks)
6. Add User Story 5 → Test independently → Deploy/Demo (Delete tasks)
7. Add Edge Cases → Test comprehensively → Deploy/Demo (Production-ready)
8. Add Polish → Final validation → Deploy/Demo (Hackathon-ready)

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T012)
2. Once Foundational is done:
   - Developer A: User Story 1 (T013-T020)
   - Developer B: User Story 2 (T021-T025)
   - Developer C: User Story 3 (T026-T034)
   - Developer D: User Story 4 (T035-T041)
   - Developer E: User Story 5 (T042-T046)
3. Stories complete and integrate independently
4. Team reconvenes for Edge Cases (T047-T054) and Polish (T055-T062)

---

## Task Summary

**Total Tasks**: 62
**Setup Phase**: 6 tasks
**Foundational Phase**: 6 tasks (BLOCKS all user stories)
**User Story 1 (P1)**: 8 tasks
**User Story 2 (P2)**: 5 tasks
**User Story 3 (P3)**: 9 tasks
**User Story 4 (P4)**: 7 tasks
**User Story 5 (P5)**: 5 tasks
**Edge Cases**: 8 tasks
**Polish**: 8 tasks

**Parallel Opportunities**: 24 tasks marked [P] can run concurrently
**Independent Stories**: All 5 user stories can be developed in parallel after Foundational phase

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Manual acceptance testing only (no automated tests in Phase I)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Constitution compliance: All tasks verified against Phase I scope boundaries
