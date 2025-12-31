# Phase I Todo Application

A simple, console-based task management application built with Python 3.13+. This is Phase I of "The Evolution of Todo" hackathon project, demonstrating strict Spec-Driven Development practices and AI-generated code quality.

## Features

- ✅ Add tasks with title and description
- ✅ View all tasks in a formatted list
- ✅ Mark tasks as complete or incomplete
- ✅ Update task details
- ✅ Delete tasks

## Requirements

- Python 3.13 or higher
- No external dependencies (standard library only)

## Installation

No installation required! Just run the application directly.

1. Ensure you have Python 3.13+ installed:
   ```bash
   python --version
   ```
   or
   ```bash
   python3 --version
   ```

2. Clone or download this repository

## Running the Application

From the project root directory:

```bash
python src/main.py
```

or

```bash
python3 src/main.py
```

## Quick Start

1. **Add a task**: Select option 1, enter title and description
2. **View tasks**: Select option 2 to see all your tasks
3. **Mark complete**: Select option 5, enter task ID
4. **Update task**: Select option 3, enter task ID and new details
5. **Delete task**: Select option 4, enter task ID
6. **Exit**: Select option 7

For detailed usage examples and workflows, see [quickstart.md](specs/001-phase-i-todo-app/quickstart.md)

## Important Notes

### In-Memory Storage
All data is stored in memory only. When you exit the application, **all tasks are lost**. This is by design for Phase I.

### Phase I Constraints
This version intentionally excludes:
- File or database persistence
- Web interface
- AI features
- Network connectivity

These features will be added in future phases (Phase II, III, IV).

## Project Structure

```
src/
├── __init__.py       # Package initialization
├── models.py         # Task data structure
├── operations.py     # CRUD operations
├── cli.py            # Console interface
└── main.py           # Application entry point

specs/
└── 001-phase-i-todo-app/
    ├── spec.md           # Feature specification
    ├── plan.md           # Implementation plan
    ├── tasks.md          # Task breakdown
    ├── data-model.md     # Data model specification
    ├── quickstart.md     # User guide
    └── contracts/
        └── cli-menu.md   # CLI contract
```

## Development Approach

This project follows **Spec-Driven Development (SDD)**:
1. Constitution - Project governance and constraints
2. Specification - Feature requirements and acceptance criteria
3. Execution Plan - Architecture and implementation approach
4. Task Breakdown - Granular, testable tasks
5. Implementation - AI-generated code (Claude Code)

## Success Criteria

✅ All 5 core operations work correctly
✅ Menu-driven interface with clear prompts
✅ Explicit error messages for invalid input
✅ Tasks persist during session
✅ Data lost on exit (expected behavior)
✅ No prohibited technologies used
✅ PEP 8 compliant code
✅ Beginner-friendly and readable

## License

Generated as part of "The Evolution of Todo" hackathon project.

## Credits

- **AI Code Generation**: Claude Code (Anthropic)
- **Development Model**: Spec-Driven Development (SDD)
- **Project Type**: Hackathon demonstration
