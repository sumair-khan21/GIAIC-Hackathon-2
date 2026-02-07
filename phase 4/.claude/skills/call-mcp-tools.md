# Call MCP Tools with Correct Parameters Skill

Define the structure and logic for calling MCP tools with validated parameters extracted from user intents.

## Tool Call Structure

Standard format for all tool calls:
```json
{
  "tool_name": "tool_name_here",
  "parameters": {
    "user_id": "authenticated_user_id",
    "other_param": "value_from_nlu"
  }
}
```

## Parameter Preparation

### 1. user_id Parameter
- ALWAYS extract from authenticated session (JWT token)
- Never accept user_id from user message
- If session invalid, return authentication error

### 2. Extract Other Parameters
- Use NLU results from intent-entity-extraction skill
- Map extracted entities to appropriate tool parameters
- Convert data types as needed (string to integer, etc.)

### 3. Validate Required Parameters
- Check all required parameters are present
- If missing, prepare follow-up question for user
- Validate parameter formats/values

### 4. Set Optional Parameters
- Include only if available in NLU results
- Omit optional parameters if not provided
- Apply default values as specified per tool

## Tool-Specific Logic

### add_task Tool
```json
{
  "tool_name": "add_task",
  "parameters": {
    "user_id": "authenticated_user_id",
    "title": "extracted_title",
    "description": "optional_description"
  }
}
```

**Required Parameters:**
- `user_id`: From authenticated session
- `title`: From extracted task_title entity

**Optional Parameters:**
- `description`: From extracted task_description entity

**Validation:**
- Title must not be empty (minimum 1 character)
- Title maximum length: 255 characters

### list_tasks Tool
```json
{
  "tool_name": "list_tasks",
  "parameters": {
    "user_id": "authenticated_user_id",
    "status": "optional_status_filter"
  }
}
```

**Required Parameters:**
- `user_id`: From authenticated session

**Optional Parameters:**
- `status`: From extracted status_filter entity (values: "all", "pending", "completed")

**Default Value:**
- `status`: "all" if not specified

**Mapping:**
- "pending", "todo", "incomplete" → "pending"
- "done", "completed", "finished" → "completed"
- "all" → "all"

### complete_task Tool
```json
{
  "tool_name": "complete_task",
  "parameters": {
    "user_id": "authenticated_user_id",
    "task_id": "extracted_task_id"
  }
}
```

**Required Parameters:**
- `user_id`: From authenticated session
- `task_id`: From extracted task_id entity

**Missing Parameter Handling:**
- If task_id not provided in message, ask user for specific task identification
- Suggest listing tasks first if user seems uncertain

### delete_task Tool
```json
{
  "tool_name": "delete_task",
  "parameters": {
    "user_id": "authenticated_user_id",
    "task_id": "extracted_task_id"
  }
}
```

**Required Parameters:**
- `user_id`: From authenticated session
- `task_id`: From extracted task_id entity

**Missing Parameter Handling:**
- If task_id not provided, but task name given, first call list_tasks to find matching ID
- Confirm deletion with user before proceeding

### update_task Tool
```json
{
  "tool_name": "update_task",
  "parameters": {
    "user_id": "authenticated_user_id",
    "task_id": "extracted_task_id",
    "title": "optional_new_title",
    "description": "optional_new_description"
  }
}
```

**Required Parameters:**
- `user_id`: From authenticated session
- `task_id`: From extracted task_id entity

**Optional Parameters:**
- `title`: New title if provided in message
- `description`: New description if provided in message

**Update Logic:**
- Update only the fields that are provided
- Leave other fields unchanged
- At least one optional parameter must be provided

## Error Handling

### Missing Required Parameter
- Identify which parameter is missing
- Formulate natural language question to ask user for the missing information
- Example: "Which task would you like to mark as complete?"

### Invalid Parameter Value
- Validate parameter formats and ranges
- Request user to provide corrected value
- Example: "I didn't understand that task status. Would you like to see pending tasks, completed tasks, or all tasks?"

### Tool Execution Error
- Parse the error response from the tool
- Extract meaningful information from error
- Explain to user in natural language
- Example: "I couldn't find a task with ID 5. Did you mean a different task number?"

## Response Processing

### Parse Tool Response
- Extract relevant data from successful tool responses
- Identify key fields: task_id, status, title, description
- Handle both success and error responses appropriately

### Format Natural Language Response
- Convert structured data into user-friendly message
- Use appropriate tone based on action performed
- Confirm successful actions
- Example responses:
  - Success: "I've added 'buy groceries' to your tasks."
  - Confirmation: "Task #3 has been marked as completed."
  - Error: "I couldn't find that task. Please check the task number."

## Validation Checklist

Before calling any tool:
1. Verify user_id is available from session
2. Check all required parameters are present
3. Validate parameter formats and values
4. Ensure optional parameters are properly formatted
5. Confirm tool name is valid and available

## Session Management

- Always verify JWT token validity before making tool calls
- Handle expired tokens gracefully with re-authentication request
- Maintain user context across multiple tool calls in a conversation