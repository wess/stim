# Stim API Reference

Complete reference for Stim syntax, functions, and features.

## Table of Contents

1. [Command Structure](#command-structure)
2. [Variables](#variables)
3. [Control Flow](#control-flow)
4. [Built-in Functions](#built-in-functions)
5. [Tasks and Parallelism](#tasks-and-parallelism)
6. [Operators](#operators)
7. [Comments](#comments)
8. [Compilation Output](#compilation-output)

## Command Structure

### Command Declaration

Every Stim file must contain exactly one command declaration:

```stim
command command_name {
  // Command body
}
```

**Rules:**
- Command names must be valid identifiers (letters, numbers, underscore)
- Command names cannot start with numbers
- Command names are used as the Claude Code command (`/command_name`)

**Examples:**
```stim
command hello { }           // Valid: /hello
command deploy_app { }      // Valid: /deploy_app
command buildProject { }    // Valid: /buildProject
command 123invalid { }      // Invalid: starts with number
```

### Command Body

The command body contains zero or more statements:

```stim
command example {
  statement1()
  statement2()
  // ...
}
```

## Variables

### Variable Declaration

Variables are declared using assignment syntax:

```stim
variable_name = value
```

### Variable Types

#### Strings
```stim
name = "John Doe"
message = 'Hello world'
empty_string = ""
```

#### Numbers
Numbers are currently treated as strings:

```stim
port = "3000"
timeout = "30"
```

#### Booleans
```stim
is_active = true
is_complete = false
```

#### Arrays
```stim
items = ["item1", "item2", "item3"]
numbers = ["1", "2", "3"]
mixed = ["string", "123", "true"]
```

### Variable Usage

Variables can be used in:
- Function arguments: `ask(variable_name)`
- String concatenation: `"Hello " + name`
- Conditions: `if (is_active)`
- Array access: `for item in items`

### Variable Scoping

Variables are scoped to the command and persist throughout execution:

```stim
command scope_example {
  name = "initial"
  
  if (true) {
    name = "modified"     // Modifies the existing variable
    local_var = "temp"    // Creates new variable
  }
  
  ask(name)              // "modified"
  ask(local_var)         // "temp" - available here too
}
```

## Control Flow

### Conditional Statements

#### If Statements
```stim
if (condition) {
  // Statements executed if condition is true
}
```

#### If-Else Statements
```stim
if (condition) {
  // Statements for true condition
} else {
  // Statements for false condition
}
```

### Loops

#### For Loops
Iterate over array elements:

```stim
for variable_name in array_name {
  // Statements executed for each element
  // variable_name contains the current element
}
```

**Example:**
```stim
languages = ["JavaScript", "Python", "Rust"]
for lang in languages {
  ask("Do you use " + lang + "?")
}
```

#### While Loops
Execute while condition is true:

```stim
while (condition) {
  // Statements executed while condition is true
}
```

**Example:**
```stim
count = 0
while (count < 3) {
  ask("Iteration " + count)
  count = count + 1
}
```

### Loop Control

#### Break Statement
Exit the current loop:

```stim
for item in items {
  if (item == "stop") {
    break
  }
  ask(item)
}
```

## Built-in Functions

### User Interaction

#### ask(question)
Ask the user a question and display it in Claude Code.

**Parameters:**
- `question` (string | variable): The question to ask

**Examples:**
```stim
ask("What is your name?")
ask(stored_question)
ask("Hello " + user_name + ", how are you?")
```

**Compiled Output:**
- String literal: `Ask the user: "What is your name?"`
- Variable: `Ask the user the question from variable: stored_question`

#### confirm(message)
Ask for yes/no confirmation from the user.

**Parameters:**
- `message` (string | variable): The confirmation message

**Examples:**
```stim
if (confirm("Are you ready to proceed?")) {
  ask("Great! Let's continue.")
}
```

**Compiled Output:**
```
Ask for confirmation: "Are you ready to proceed?"
```

#### wait_for_response()
Explicitly wait for user response before continuing.

**Parameters:** None

**Example:**
```stim
ask("Please describe your requirements")
wait_for_response()
ask("Thank you for the details!")
```

**Compiled Output:**
```
Wait for user response before continuing.
```

### File Operations

#### create_file(filename, content)
Create a file with specified content.

**Parameters:**
- `filename` (string): The name of the file to create
- `content` (string | variable): The content to write to the file

**Examples:**
```stim
create_file("README.md", "project_readme")
create_file("config.json", config_template)
create_file("output.txt", "Hello, world!")
```

**Compiled Output:**
```
Create file "README.md" with content: project_readme
```

### System Functions

These are placeholders for functions that would be implemented by the runtime:

#### Git Operations
```stim
git_init()
git_commit("commit message")
git_push()
git_status()
```

#### GitHub Operations
```stim
github_create_repo()
github_create_pr()
github_create_issue("title", "body")
```

#### File System Operations
```stim
read_file("path/to/file")
append_file("path/to/file", "content")
delete_file("path/to/file")
```

## Tasks and Parallelism

Tasks spawn Claude Code subagents to handle subtasks autonomously. This is one of Stim's most powerful features, enabling complex multi-agent workflows.

### Agent Types

| Agent | Description |
|---|---|
| `general` | General-purpose agent (default). Maps to `general-purpose` in Claude Code. |
| `explore` | Fast codebase exploration agent. Use for searching files, reading code, answering questions about the codebase. |
| `bash` | Command execution specialist. Use for git operations, builds, terminal tasks. |
| `plan` | Software architect agent. Use for designing implementation plans. |

### Inline Task

Spawn a subagent with an inline body:

```stim
task "description" {
  // statements the agent will execute
}
```

With an explicit agent type:

```stim
task explore "find auth patterns" {
  ask("What authentication patterns exist in the codebase?")
  wait_for_response()
}
```

**Compiled Output:**
```markdown
Spawn a Explore subagent task: "find auth patterns"
Use the Task tool with:
- subagent_type: Explore
- description: find auth patterns
- prompt:
  - Ask the user the question from variable: What authentication patterns exist in the codebase?
  - Wait for user response before continuing.
```

### File Reference Task

Reference another `.stim` file. The file is read and parsed at compile time, and its body is inlined:

```stim
task("helpers/research.stim")
task("helpers/research.stim", explore)
```

**Parameters:**
- First argument (string): path to `.stim` file, relative to the current file
- Second argument (optional): agent type

The referenced file must contain a valid `command` declaration. The command name becomes the task description if none is provided.

### Parallel Block

Run multiple tasks concurrently:

```stim
parallel {
  task "analyze frontend" {
    ask("What frontend patterns exist?")
  }
  task explore "analyze backend" {
    ask("What backend patterns exist?")
  }
}
```

**Compiled Output:**
```markdown
Spawn 2 subagent tasks in parallel:

### Task 1
Spawn a general-purpose subagent task: "analyze frontend"
Use the Task tool with:
- subagent_type: general-purpose
- description: analyze frontend
- prompt:
  - Ask the user the question from variable: What frontend patterns exist?

### Task 2
Spawn a Explore subagent task: "analyze backend"
Use the Task tool with:
- subagent_type: Explore
- description: analyze backend
- prompt:
  - Ask the user the question from variable: What backend patterns exist?
```

**Rules:**
- A `parallel` block may only contain `task` statements
- Each task runs as an independent subagent
- Tasks within a parallel block execute concurrently

### Circular Reference Detection

When using file reference tasks, Stim detects circular references at compile time:

```stim
// a.stim
command a {
  task("b.stim")  // b.stim references a.stim -> Error!
}
```

This produces: `Error: Circular task file reference detected: b.stim`

## Operators

### Arithmetic Operators

#### Addition (+)
Used for string concatenation:

```stim
result = "Hello " + "World"        // "Hello World"
message = "Count: " + count        // "Count: 5"
```

### Comparison Operators

#### Equality (==)
```stim
if (status == "complete") {
  ask("Task is done!")
}
```

#### Inequality (!=)
```stim
if (status != "pending") {
  ask("Status has changed")
}
```

### Logical Operators

#### Logical NOT (!)
```stim
if (!is_complete) {
  ask("Still working...")
}
```

#### Logical AND (&&)
```stim
if (is_ready && has_permission) {
  ask("Starting process...")
}
```

#### Logical OR (||)
```stim
if (is_admin || is_owner) {
  ask("Access granted")
}
```

### Array Operations

#### join(separator)
Convert array to string with separator:

```stim
items = ["a", "b", "c"]
result = items.join(", ")    // "a, b, c"
```

## Comments

### Single-line Comments
```stim
// This is a comment
ask("Hello")  // Comment at end of line
```

### Multi-line Comments
Not currently supported. Use multiple single-line comments:

```stim
// This is a multi-line comment
// that spans several lines
// to document complex logic
```

## Compilation Output

Understanding how Stim compiles to Claude Code markdown helps debug issues.

### Variable Assignments
```stim
name = "John"
```

**Compiles to:**
```
Set name = John
```

### Control Flow
```stim
if (condition) {
  ask("Hello")
}
```

**Compiles to:**
```
If condition:
- Ask the user: "Hello"
```

### Loops
```stim
for item in items {
  ask(item)
}
```

**Compiles to:**
```
For each item in items:
- Ask the user the question from variable: item
```

### Functions
```stim
create_file("test.txt", "content")
```

**Compiles to:**
```
Create file "test.txt" with content: content
```

### Tasks
```stim
task explore "find bugs" {
  ask("What bugs exist?")
}
```

**Compiles to:**
```
Spawn a Explore subagent task: "find bugs"
Use the Task tool with:
- subagent_type: Explore
- description: find bugs
- prompt:
  - Ask the user the question from variable: What bugs exist?
```

### Parallel Tasks
```stim
parallel {
  task "task A" {
    ask("Do A")
  }
  task "task B" {
    ask("Do B")
  }
}
```

**Compiles to:**
```
Spawn 2 subagent tasks in parallel:

### Task 1
Spawn a general-purpose subagent task: "task A"
...

### Task 2
Spawn a general-purpose subagent task: "task B"
...
```

## Error Handling

### Common Compilation Errors

#### Syntax Errors
```
Error: Expected command declaration: command <name> {
Error: Invalid ask statement: ask(unclosed string"
Error: Invalid assignment: name =
```

#### Runtime Errors
```
Error: File not found: /path/to/file.stim
Error: No input file specified
Error: Input file must have .stim extension
```

### Debugging Tips

1. **Check syntax**: Ensure all strings are quoted and braces are balanced
2. **Verify file paths**: Use absolute paths for input files
3. **Test compilation**: Use `bun run dev compile --dry-run` to check syntax
4. **Read output**: Check the generated `.md` file for expected behavior

## Best Practices

### Variable Naming
- Use descriptive names: `deployment_environment` not `env`
- Use consistent casing: stick to `snake_case` or `camelCase`
- Avoid reserved words: don't use `if`, `for`, `while` as variable names

### Function Usage
- Always quote string literals: `ask("Hello")` not `ask(Hello)`
- Use variables for reusable content: store repeated strings in variables
- Handle edge cases: check conditions before loops and file operations

### Code Organization
- Group related variables at the top
- Use comments to explain complex logic
- Keep functions focused on single responsibilities

## Version Compatibility

This API reference is for Stim v1.0. Future versions may include:

### Planned Features
- **v1.1**: String interpolation, standard library
- **v2.0**: Multi-file projects, package management

### Deprecation Policy
- Breaking changes will be announced in advance
- Migration guides will be provided for major version updates
- Backward compatibility maintained within major versions

---

**For more help:**
- [Tutorial](Tutorial.md) - Step-by-step learning guide  
- [Examples](Examples.md) - Real-world command examples
- [FAQ](FAQ.md) - Common questions and troubleshooting