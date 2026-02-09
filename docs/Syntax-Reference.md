# Stim Syntax Reference

Everything you can write in a `.stim` file, with examples.

## Table of Contents

1. [Commands](#commands)
2. [Variables](#variables)
3. [Data Types](#data-types)
4. [Operators](#operators)
5. [Control Flow](#control-flow)
6. [Tasks](#tasks)
7. [Parallel](#parallel)
8. [Functions](#functions)
9. [Comments](#comments)
10. [Naming Rules](#naming-rules)
11. [Keywords](#keywords)
12. [Common Errors](#common-errors)

## Commands

Every `.stim` file contains one command. The name becomes the slash command in Claude Code.

```stim
command deploy {
  ask("What should I deploy?")
  wait_for_response()
}
```

This compiles to `deploy.md` and is used as `/deploy`.

## Variables

Assign with `=`. Use anywhere you need the value later.

```stim
name = "production"
port = "8080"
ready = true
services = ["api", "web", "worker"]
```

Reference by name:

```stim
ask(name)
ask("Deploying to " + name)
if (ready) { ... }
for service in services { ... }
```

Variables are scoped to the entire command. Assigning inside an `if` or `for` block is visible everywhere.

```stim
command example {
  result = "pending"

  if (confirm("Done?")) {
    result = "complete"
  }

  ask(result)  // "complete" if confirmed
}
```

## Data Types

### Strings

Double or single quotes. Both work the same.

```stim
greeting = "Hello, world!"
greeting = 'Hello, world!'
empty = ""
```

Escape sequences: `\"`, `\'`, `\\`, `\n`, `\t`

### Booleans

```stim
enabled = true
disabled = false
```

### Arrays

Square brackets, comma-separated. All elements are strings.

```stim
items = ["one", "two", "three"]
empty = []
```

## Operators

### Concatenation (`+`)

Joins strings together:

```stim
full = first_name + " " + last_name
ask("Hello, " + name + "!")
```

### Comparison (`==`, `!=`)

```stim
if (status == "done") {
  ask("Finished!")
}

if (env != "production") {
  ask("Safe to experiment")
}
```

### Logical (`!`, `&&`, `||`)

```stim
if (!ready) {
  ask("Not ready yet")
}

if (ready && approved) {
  ask("Deploying")
}

if (is_admin || is_owner) {
  ask("Access granted")
}
```

### Precedence

Highest to lowest: `!`, then `==`/`!=`, then `&&`, then `||`, then `+`.

Use parentheses when needed:

```stim
if (!(ready && approved)) {
  ask("Blocked")
}
```

## Control Flow

### if / else

```stim
if (confirm("Use TypeScript?")) {
  ask("Setting up TypeScript config")
}
```

```stim
if (env == "production") {
  ask("Running production deploy")
} else {
  ask("Running staging deploy")
}
```

### for

Iterate over an array:

```stim
checks = ["tests", "lint", "types"]

for check in checks {
  ask("Running " + check)
  wait_for_response()
}
```

### while

Repeat until a condition changes:

```stim
done = false

while (!done) {
  ask("Describe the next requirement")
  wait_for_response()

  if (confirm("All requirements captured?")) {
    done = true
  }
}
```

### break

Exit a loop early:

```stim
for item in items {
  if (item == "stop") {
    break
  }
  ask(item)
}
```

## Tasks

Tasks spawn Claude Code subagents. The body describes what the agent should do.

### Inline task

```stim
task "explore the auth module" {
  ask("What authentication patterns exist?")
  wait_for_response()
}
```

### With an agent type

Pick the right agent for the job: `explore`, `bash`, `plan`, or `general` (default).

```stim
task explore "find all API endpoints" {
  ask("Search the codebase and list every route handler")
}

task bash "run the test suite" {
  ask("Execute all tests and report failures")
}

task plan "design the caching layer" {
  ask("Propose a caching architecture for this app")
}
```

| Type | Best for |
|------|----------|
| `general` | General-purpose work (default) |
| `explore` | Searching files, reading code, answering codebase questions |
| `bash` | Running commands, git, builds, installs |
| `plan` | Designing implementation plans, architecture decisions |

### File reference

Point to another `.stim` file. It gets parsed and inlined at compile time.

```stim
task("helpers/security.stim")
task("helpers/security.stim", explore)
```

The path is relative to the current file. The output is fully self-contained -- no runtime dependency on the referenced file.

Circular references are detected at compile time and produce an error.

## Parallel

Run multiple tasks at the same time. Only `task` statements are allowed inside.

```stim
parallel {
  task explore "check frontend" {
    ask("What frontend patterns are used?")
  }
  task explore "check backend" {
    ask("What backend patterns are used?")
  }
  task bash "run tests" {
    ask("Execute the test suite")
  }
}
```

This tells Claude Code to spawn all three subagents concurrently.

You can mix agent types and use file references inside parallel blocks:

```stim
parallel {
  task("helpers/lint.stim", bash)
  task("helpers/typecheck.stim", bash)
  task explore "check for TODOs" {
    ask("Find all TODO and FIXME comments")
  }
}
```

## Functions

### Built-in

```stim
ask("What should I work on?")             // Prompt the user
wait_for_response()                        // Pause for user input
confirm("Deploy to production?")           // Yes/no confirmation
create_file("README.md", content)          // Create a file
```

`ask()` accepts a string literal or a variable:

```stim
ask("What's your name?")    // string literal
ask(my_question)             // variable reference
ask("Hello, " + name)       // concatenation
```

### Custom functions

Any other function call is passed through as-is:

```stim
git_init()
git_commit("initial commit")
deploy(env_name)
run_tests("unit", "integration")
```

## Comments

Single-line only. Start with `//`.

```stim
// Setup phase
name = "test"

ask("Hello")  // inline comment

// Multiple comment lines
// work fine back to back
```

## Naming Rules

Names for commands, variables, and functions must:

- Start with a letter or underscore
- Contain only letters, numbers, and underscores
- Not be a reserved keyword

```stim
// Valid
project_name
myVar
_private
user123

// Invalid
123abc       // starts with number
my-var       // hyphen not allowed
my var       // spaces not allowed
```

## Keywords

These are reserved and cannot be used as variable or command names:

```
command   if        else      for       in        while
break     true      false     task      parallel
bash      explore   plan      general
```

Built-in function names (`ask`, `confirm`, `create_file`, `wait_for_response`) are also reserved.

## Common Errors

**Missing command declaration:**
```
Error: Expected command declaration: command <name> {
```
Every file must start with `command name {`.

**Unclosed string:**
```
Error: Invalid ask statement: ask(unclosed string"
```
Make sure quotes match: `ask("text")` not `ask("text)`.

**Missing value in assignment:**
```
Error: Invalid assignment: name =
```
The right side of `=` can't be empty: `name = "value"`.

**Non-task inside parallel:**
```
Error: parallel block may only contain task statements
```
Only `task` statements go inside `parallel { }`.

**Circular file reference:**
```
Error: Circular task file reference detected: b.stim
```
Two `.stim` files can't reference each other (directly or indirectly).

**Missing task file:**
```
Error: Task file not found: /path/to/missing.stim
```
Check that the path in `task("path.stim")` is correct relative to the current file.

---

**See also:**
- [API Reference](API.md) -- detailed documentation for every statement and function
- [Tutorial](Tutorial.md) -- learn by building commands step by step
- [Examples](Examples.md) -- real-world patterns to copy and adapt
