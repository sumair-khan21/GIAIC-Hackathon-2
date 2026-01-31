# Intent and Entity Extraction Skill

Extract intent and entities from user messages for the Todo chatbot.

## Intent Classification

Detect user intent based on keywords:

### CREATE_TASK
Keywords: add, create, new, remind
- "Add buy groceries" → intent = CREATE_TASK
- "Create a task to call mom" → intent = CREATE_TASK
- "Remind me to water plants" → intent = CREATE_TASK

### LIST_TASKS
Keywords: show, list, what, display, see
- "Show my tasks" → intent = LIST_TASKS
- "What do I have to do?" → intent = LIST_TASKS
- "List pending tasks" → intent = LIST_TASKS

### COMPLETE_TASK
Keywords: done, complete, finish, mark
- "Mark task 3 as done" → intent = COMPLETE_TASK
- "Complete the shopping task" → intent = COMPLETE_TASK
- "Finish the meeting task" → intent = COMPLETE_TASK

### DELETE_TASK
Keywords: delete, remove, cancel
- "Delete task 2" → intent = DELETE_TASK
- "Remove the appointment task" → intent = DELETE_TASK
- "Cancel the reminder" → intent = DELETE_TASK

### UPDATE_TASK
Keywords: change, update, edit, modify
- "Change task 1 to call dad" → intent = UPDATE_TASK
- "Update the grocery list" → intent = UPDATE_TASK
- "Edit the meeting time" → intent = UPDATE_TASK

### USER_INFO
Keywords: who, me, my info, account
- "Who am I?" → intent = USER_INFO
- "Show my account info" → intent = USER_INFO
- "What's my user info?" → intent = USER_INFO

## Entity Extraction

### Task Title
Main noun phrase after intent keyword:
- "Add buy groceries" → title = "buy groceries"
- "Remind me to call mom" → title = "call mom"
- "Create task wash car" → title = "wash car"

### Task Description
Additional context, time, details:
- "Call mom tomorrow at 5pm" → description = "tomorrow at 5pm"
- "Buy milk, eggs, and bread" → description = "milk, eggs, and bread"
- "Meeting with John about project deadline" → description = "about project deadline"

### Task ID
Numbers or ordinal references:
- "task 3" → task_id = 3
- "the first one" → task_id = 1 (from last list)
- "the grocery task" → search list for matching title
- "second task" → task_id = 2

### Status Filter
State keywords:
- "pending", "todo", "incomplete" → status = "pending"
- "done", "completed", "finished" → status = "completed"
- No keyword or "all" → status = "all"

## Multi-Intent Detection

Handle multiple intents in one message:
- "Add X and show tasks" → [CREATE_TASK, LIST_TASKS]
- "Mark task 2 done and delete task 3" → [COMPLETE_TASK, DELETE_TASK]
- "Create a reminder and list all tasks" → [CREATE_TASK, LIST_TASKS]
- "Show pending tasks and mark first one complete" → [LIST_TASKS, COMPLETE_TASK]

### Processing Order
1. Parse entire message for all possible intents
2. Identify associated entities for each intent
3. Process intents in logical sequence:
   - USER_INFO (if present) → CREATE_TASK/UPDATE_TASK → COMPLETE_TASK/DELETE_TASK → LIST_TASKS
4. Combine responses in a natural, coherent way

### Handling
- Process intents sequentially in the correct order
- Combine responses naturally
- Prioritize CREATE_TASK and UPDATE_TASK before LIST_TASKS when combined
- Maintain context between intents (e.g., if creating a task then listing, show the updated list)
- For conflicting intents (e.g., delete all and show all), handle based on order of appearance in user message

### Sequence Examples
- "Add groceries and show my list" → Create task, then show updated list
- "Mark first task done and list remaining" → Complete task, then show updated list
- "Show my tasks and delete the second one" → Show tasks first, then delete specified task

## Extraction Priority
1. Intent classification first
2. Task ID (when present with action)
3. Task title and description
4. Status filters (for LIST_TASKS)

## Edge Cases
- "Add task to show me reminders" → CREATE_TASK: title="show me reminders"
- "Show tasks and add new one" → LIST_TASKS, CREATE_TASK
- "Mark 1st task done" → COMPLETE_TASK: task_id=1
- "List all my completed tasks" → LIST_TASKS: status="completed"