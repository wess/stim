# Functions

Functions are built-in or custom operations that perform actions in the command.

## Built-in Functions

### User Interaction

#### ask(question)

Ask the user a question.

**Parameters:**
- `question` (string or variable): The question to ask

**Examples:**
```stim
ask("What is your name?")

prompt = "Do you agree?"
ask(prompt)

name = "Alice"
ask("Hello " + name + ", how are you?")
```

**Compiled output (string literal):**
```
Ask the user: "What is your name?"
```

**Compiled output (variable):**
```
Ask the user the question from variable: prompt
```

#### confirm(message)

Ask for yes/no confirmation from the user.

**Parameters:**
- `message` (string or variable): The confirmation message

**Examples:**
```stim
confirm("Are you ready to proceed?")

msg = "Delete this file?"
confirm(msg)
```

**Compiled output:**
```
Ask for confirmation: "Are you ready to proceed?"
```

#### wait_for_response()

Explicitly wait for user response before continuing. Useful after `ask()` when you want to ensure the user has responded.

**Parameters:** None

**Examples:**
```stim
ask("Please describe your requirements")
wait_for_response()
ask("Thank you for the details!")
```

**Compiled output:**
```
Wait for user response before continuing.
```

### File Operations

#### create_file(filename, content)

Create a file with specified content.

**Parameters:**
- `filename` (string): Path and name of the file to create
- `content` (string or variable): Content to write to the file

**Examples:**
```stim
create_file("README.md", "# My Project")

template = "Hello, world!"
create_file("output.txt", template)

filename = "config.json"
content = "{}"
create_file(filename, content)
```

**Compiled output:**
```
Create file "README.md" with content: # My Project
```

## Custom Function Calls

Functions not in the built-in list are passed through as custom function calls:

```stim
git_status()
deploy_service("production")
```

**Compiled output:**
```
Call function git_status
Call function deploy_service with arguments: production
```

Custom functions are documented elsewhere or provided by the runtime environment.

## Function Calls in Context

### In Conditionals

```stim
if (confirm("Proceed with deployment?")) {
  ask("Starting deployment...")
}
```

### In Loops

```stim
environments = ["dev", "staging", "prod"]
for env in environments {
  ask("Deploy to " + env + "?")
}
```

### In Variable Assignment

Functions cannot be assigned to variables. Use them as statements:

```stim
// Valid
ask("What is your name?")

// Invalid - functions are statements, not expressions
name = ask("What is your name?")
```

## See Also

- [Variables](variables.md) — Pass variables as function arguments
- [Operators](operators.md) — String concatenation in function arguments
- [Tasks](tasks.md) — Spawn subagent tasks for complex operations
