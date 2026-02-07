# Cohere API Integration Specification

**Component**: cohere-integration
**Parent Feature**: 003-cohere-chatbot

## Overview

Integration with Cohere's `command-r-plus` model for AI-powered task management with tool calling.

## Cohere Client Setup

```python
import cohere
import os

co = cohere.Client(api_key=os.getenv("COHERE_API_KEY"))
```

## Chat Request Structure

```python
response = co.chat(
    model="command-r-plus",
    preamble=SYSTEM_PROMPT,
    message=user_message,
    chat_history=[
        {"role": "USER", "message": "Add buy milk"},
        {"role": "CHATBOT", "message": "Added 'Buy milk' to your tasks!"}
    ],
    tools=MCP_TOOLS,
    temperature=0.7
)
```

## System Prompt (Preamble)

```python
SYSTEM_PROMPT = """You are a helpful todo assistant. Help users manage tasks through natural language.

TOOLS AVAILABLE:
- add_task: Create a new task
- list_tasks: View all tasks or filter by status
- complete_task: Mark a task as done
- delete_task: Remove a task permanently
- update_task: Change task title or description

BEHAVIOR:
- Be friendly and concise
- Use emojis for confirmations (✅⏳🎉✏️🗑️)
- Confirm all actions clearly
- Ask for clarification if the request is unclear
- Format task lists with numbers
- Reference previous conversation context

CONSTRAINTS:
- Only access the authenticated user's tasks
- Never fabricate task information
- Handle errors gracefully with helpful messages
"""
```

## Tool Format (Cohere Style)

```python
MCP_TOOLS = [
    {
        "name": "add_task",
        "description": "Create a new task for the user",
        "parameter_definitions": {
            "title": {"type": "str", "required": True, "description": "Task title"},
            "description": {"type": "str", "required": False, "description": "Task details"}
        }
    }
    # ... other tools defined in mcp-tools.md
]
```

## Tool Execution Flow

```python
# Step 1: Initial chat call
response = co.chat(
    model="command-r-plus",
    preamble=SYSTEM_PROMPT,
    message=user_message,
    chat_history=chat_history,
    tools=MCP_TOOLS
)

# Step 2: Check for tool calls
if response.tool_calls:
    tool_results = []
    for tool_call in response.tool_calls:
        result = execute_tool(
            tool_name=tool_call.name,
            parameters=tool_call.parameters,
            user_id=authenticated_user_id  # ALWAYS from JWT
        )
        tool_results.append({
            "call": tool_call,
            "outputs": [{"result": json.dumps(result)}]
        })

    # Step 3: Get final response with tool results
    final_response = co.chat(
        model="command-r-plus",
        preamble=SYSTEM_PROMPT,
        message=user_message,
        chat_history=chat_history,
        tools=MCP_TOOLS,
        tool_results=tool_results
    )
    return final_response.text
else:
    return response.text
```

## Response Handling

```python
# Access response text
assistant_message = response.text

# Check for tool calls
has_tools = bool(response.tool_calls)

# Extract tool call details
if response.tool_calls:
    for tc in response.tool_calls:
        tool_name = tc.name           # "add_task"
        tool_params = tc.parameters   # {"title": "Buy milk"}
```

## Error Handling

```python
try:
    response = co.chat(...)
except cohere.CohereAPIError as e:
    # API errors (rate limit, auth, etc.)
    return {"error": "AI service temporarily unavailable"}
except cohere.CohereConnectionError as e:
    # Network errors
    return {"error": "Unable to connect to AI service"}
```

## Security Requirements

- `COHERE_API_KEY` MUST be in environment variables only
- Never log or expose API key in responses
- user_id for tools MUST come from JWT token, not request body
- Rate limit chat requests per user
