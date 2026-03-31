# Tasks

Tasks spawn Claude Code subagents to execute subtasks autonomously. This is one of Stim's most powerful features, enabling complex multi-agent workflows.

## Agent Types

| Agent | Type | Use Cases |
|-------|------|-----------|
| `general` | General-purpose agent | Default agent. Use for unstructured tasks, decision-making, analysis |
| `explore` | Codebase exploration specialist | Fast search, file reading, code analysis, understanding patterns |
| `bash` | Command execution specialist | Git operations, builds, terminal tasks, system commands |
| `plan` | Software architect | Design implementation plans, architecture decisions, complex workflows |

## Inline Tasks

### Syntax with Default Agent

```stim
task "description" {
  // task body
}
```

The default agent is `general`. The description is used as the task summary.

**Example:**
```stim
task "analyze authentication patterns" {
  ask("What auth patterns exist in the codebase?")
  wait_for_response()
}
```

### Syntax with Explicit Agent

```stim
task agent_type "description" {
  // task body
}
```

**Examples:**
```stim
task explore "find config files" {
  ask("What configuration files exist?")
}

task bash "run tests" {
  ask("Which tests should we run?")
}

task plan "design API" {
  ask("What endpoints do we need?")
}
```

### Task Body

The task body contains statements executed by the subagent. Any valid Stim statement is allowed:

```stim
task explore "analyze errors" {
  ask("What error handling patterns exist?")
  wait_for_response()
}

task bash "deploy" {
  ask("Should we deploy to production?")
  confirm("Confirm deployment")
}

task plan "refactor" {
  services = ["auth", "api", "db"]
  for service in services {
    ask("How to refactor " + service + "?")
  }
}
```

### Compiled Output

**Input:**
```stim
task explore "find auth patterns" {
  ask("What patterns exist?")
}
```

**Output:**
```
Spawn a Explore subagent task: "find auth patterns"
Use the Task tool with:
- subagent_type: Explore
- description: find auth patterns
- prompt:
  - Ask the user: "What patterns exist?"
```

## File Reference Tasks

### Syntax

```stim
task("path/to/file.stim")
task("path/to/file.stim", agent_type)
```

### Behavior

The referenced `.stim` file is read and parsed at compile time. Its command body is inlined into the parent command.

**Requirements:**
- File must be a valid `.stim` file with one `command` declaration
- Path is relative to the current file's directory
- File must exist at compile time

**Examples:**
```stim
task("helpers/research.stim")
task("helpers/research.stim", explore)
task("tasks/deploy.stim", bash)
```

### Description Resolution

If no description is provided, the referenced command's name is used as the description:

```stim
// research.stim
command find_patterns {
  ask("What patterns?")
}

// main.stim
task("research.stim")  // Description: "find_patterns"
task("research.stim", explore)  // Agent: explore, Description: "find_patterns"
```

### With Explicit Description

Provide description and agent for file reference:

```stim
task explore "analyze codebase" {
  task("research.stim")
}
```

## Parallel Blocks

See [Parallel](parallel.md) for running multiple tasks concurrently.

## Circular Reference Detection

Stim detects circular task file references at compile time:

```stim
// a.stim
command a {
  task("b.stim")
}

// b.stim
command b {
  task("a.stim")  // References back to a.stim
}
```

**Error:**
```
Error: Circular task file reference detected: a.stim
```

## Status Injection (Engine Mode)

When a command uses [annotations](annotations.md), tasks include a status line in compiled output:

```stim
command deploy {
  @topology pipeline
  task "setup" {
    ask("Ready?")
  }
}
```

**Compiled output:**
```
Spawn a general-purpose subagent task: "setup"
Use the Task tool with:
- subagent_type: general-purpose
- description: setup
- prompt:
  - Ask the user: "Ready?"
  - End your output with [status: ok] or [status: error] <reason>
```

The subagent must end output with `[status: ok]` or `[status: error]` for the engine to process the result.

## See Also

- [Parallel](parallel.md) — Run multiple tasks concurrently
- [Commands](commands.md) — Command declaration for referenced files
- [Control Flow](controlflow.md) — Nested control flow in task bodies
- [Annotations](annotations.md) — Workflow annotations affect task output
