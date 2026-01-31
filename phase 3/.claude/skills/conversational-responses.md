# Create User-Friendly, Conversational Responses Skill

Generate natural, engaging responses with appropriate feedback for user actions.

## Confirmation Messages

### Task Created
- Primary: "✅ Added '{title}' to your list!"
- Alternative: "📝 Created task '{title}' successfully!"
- Alternative: "🚀 '{title}' is now on your to-do list!"

### Task Completed
- Primary: "🎉 Great job! Marked '{title}' as complete!"
- Alternative: "💪 Well done! '{title}' is marked complete!"
- Alternative: "✅ Nice! '{title}' has been completed!"

### Task Deleted
- Primary: "🗑️ Removed '{title}' from your tasks"
- Alternative: "❌ '{title}' has been deleted from your list"
- Alternative: "✨ '{title}' is gone from your tasks!"

### Task Updated
- Primary: "✏️ Updated '{title}' successfully!"
- Alternative: "🔧 '{title}' has been updated!"
- Alternative: "✨ '{title}' has been changed!"

## List Formatting

### Empty List Response
"You have no {status} tasks yet! 🚀 Add one to get started."

### Single Task Response
"You have 1 {status} task:\n1. {icon} {title}"

### Multiple Tasks Response
"Here are your {count} {status} tasks:\n{task_list}"

Where {task_list} is formatted as:
```
1. {icon} {title}
2. {icon} {title}
...
```

## Icon Mapping

### Status Icons
- **Pending tasks**: ⏳ (hourglass)
- **Completed tasks**: ✅ (checkmark)
- **All tasks**: Mixed icons based on individual task status
- **Mixed list**: Combine both pending and completed icons appropriately

## User Information Responses

### User Profile
- "You're logged in as {name} ({email}) 👤"
- "👤 Welcome back, {name}!"
- "Hello {name}! You're signed in with {email}"

### Progress Statistics
- "You've completed {completed}/{total} tasks! 🎉 That's {percentage}%!"
- "📊 Progress: {completed}/{total} tasks done ({percentage}%)"
- "🎉 Amazing! You've finished {percentage}% of your {total} tasks!"

## Error Messages

### General Approach
- Use friendly, non-technical language
- Suggest next actions
- Include helpful hints
- Maintain positive tone

### Common Error Patterns

#### Task Not Found
- "I couldn't find that task. Try 'show all tasks' to see your list."
- "Hmm, I can't seem to find that task. Maybe check your list with 'show tasks'?"
- "That task doesn't seem to exist. Want to see your current tasks?"

#### Invalid Input
- "I'm not sure what you mean. Try saying 'add task' or 'show tasks'."
- "Could you rephrase that? I understand commands like 'complete task 3'."
- "I didn't catch that. Say something like 'delete task 1'?"

#### Authentication Issues
- "It looks like you need to sign in first. Please log in to continue."
- "I can't do that without signing in. Want to log in now?"

#### System Errors
- "Oops! Something went wrong. Can you try that again?"
- "I'm having trouble right now. Please try again in a moment."

## Multi-Action Responses

### Combining Multiple Results
When multiple actions occur in sequence, combine them naturally:

#### Create + List Example
"✅ Added 'Buy milk' to your list!\n\nHere are your tasks:\n1. ⏳ Buy milk\n2. ✅ Call mom"

#### Complete + List Example
"🎉 Great job! Marked 'Do laundry' as complete!\n\nHere are your remaining tasks:\n1. ⏳ Buy groceries\n2. ⏳ Call dentist"

#### List + Action Example
"Here are your tasks:\n1. ⏳ Buy groceries\n2. ⏳ Call dentist\n\n✅ Added 'Schedule appointment' to your list!"

### Natural Transitions
- Use transition phrases like "Also," "Plus," "And now," "Next,"
- Maintain conversational flow between actions
- Acknowledge the sequence of operations

## Conversational Flow Guidelines

### Natural Language
- Use contractions and casual tone
- Avoid robotic, repetitive phrasing
- Include personal pronouns ("you," "your," "let's")
- Vary sentence structure and length

### Personality Elements
- Add appropriate emojis to enhance mood
- Use encouraging language for completions
- Express empathy for errors
- Maintain consistent but varied vocabulary

### Response Variation
- Don't repeat the same confirmation messages
- Use alternatives to prevent monotony
- Match tone to the action (celebratory for completions, supportive for errors)

### Conciseness
- Keep responses informative but brief
- Focus on the most important information
- Avoid unnecessary details or explanations

## Special Cases

### Urgent/Low Priority Indicators
If task priority information is available:
- High priority: "🚨 URGENT: {title}"
- Low priority: "💤 {title} (low priority)"

### Due Date Reminders
If due date information is available:
- Upcoming: "⏰ Due soon: {title}"
- Overdue: "⚠️ Overdue: {title}"
- Distant: "{title} (due in X days)"

## Tone Consistency

### Positive Reinforcement
- Celebrate completions and achievements
- Encourage progress
- Acknowledge user effort

### Supportive Guidance
- Help users when confused
- Offer suggestions proactively
- Guide toward next steps

### Professional Friendliness
- Maintain helpful demeanor
- Balance friendliness with professionalism
- Respect user preferences and privacy