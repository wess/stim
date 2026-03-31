# Annotations

Annotations customize workflow behavior in command execution.

## Syntax

Annotations appear after the `command` keyword, before other statements:

```stim
command mycommand {
  @key value
  // statements
}
```

Each annotation is a line starting with `@`, followed by the annotation key and value.

## Supported Annotations

| Annotation | Valid Values | Default | Purpose |
|------------|--------------|---------|---------|
| `@topology` | `pipeline`, `fanout`, `supervisor` | `pipeline` | Task execution model |
| `@memory` | `shared`, `none` | `none` | Task memory sharing |
| `@on_error` | `escalate` | `escalate` | Error handling strategy |

### Topology

Defines how [tasks](tasks.md) and [parallel](parallel.md) blocks execute.

**pipeline** (default)
- Tasks execute sequentially
- Each task waits for the previous to complete
- Results flow from task to task

```stim
command deploy {
  @topology pipeline
  task "setup" { ask("Ready?") }
  task "build" { ask("Build?") }
  task "test" { ask("Test?") }
}
```

**fanout**
- All tasks execute concurrently
- No synchronization between tasks
- All tasks start at the same time

```stim
command analyze {
  @topology fanout
  parallel {
    task explore "frontend" { ask("?") }
    task explore "backend" { ask("?") }
  }
}
```

**supervisor**
- A single task is the supervisor
- Other tasks execute under its control
- Supervisor coordinates execution

```stim
command manage {
  @topology supervisor
  task plan "orchestration" { ask("Plan?") }
}
```

### Memory

Determines whether tasks share memory (variables).

**none** (default)
- Each task has isolated memory
- Tasks cannot see or modify parent variables
- No memory sharing between parallel tasks

```stim
command isolated {
  @memory none
  parent_var = "value"
  task "subtask" {
    ask(parent_var)  // Not accessible
  }
}
```

**shared**
- Tasks share memory with parent command
- Tasks can read and modify parent variables
- Memory is synchronized across tasks

```stim
command shared {
  @memory shared
  status = "pending"
  task "work" {
    status = "done"   // Modifies parent variable
  }
}
```

### On Error

Defines error handling strategy.

**escalate** (default)
- Errors in tasks are escalated to parent
- Parent command receives the error
- Execution halts

```stim
command critical {
  @on_error escalate
  task "risky" {
    ask("Dangerous?")
  }
}
```

## Multiple Annotations

Multiple annotations can be combined:

```stim
command complex {
  @topology fanout
  @memory shared
  @on_error escalate
  
  parallel {
    task "task1" { ask("?") }
    task "task2" { ask("?") }
  }
}
```

## Placement Rules

Annotations must:
1. Appear after the `command` keyword
2. Appear before any other statements
3. Use valid keys and values
4. Not be duplicated

**Valid:**
```stim
command test {
  @topology pipeline
  @memory shared
  ask("Hello")
}
```

**Invalid (annotation after statement):**
```stim
command test {
  ask("Hello")
  @topology pipeline   // Error: annotations must appear first
}
```

**Invalid (duplicate annotation):**
```stim
command test {
  @topology pipeline
  @topology fanout     // Error: duplicate @topology
}
```

## Validation

**Unknown annotation key:**
```
Error: Unknown annotation @unknown. Valid annotations: topology, memory, on_error
```

**Invalid value:**
```
Error: Invalid value "bad" for @topology. Valid values: pipeline, fanout, supervisor
```

**Duplicate annotation:**
```
Error: Duplicate annotation: @topology
```

**Annotation after statements:**
```
Error: Annotations must appear before other statements
```

## Compiled Output

Annotations emit a header block in compiled output:

**Input:**
```stim
command deploy {
  @topology pipeline
  @memory shared
  @on_error escalate
  ask("Start")
}
```

**Output:**
```
[annotations]
topology: pipeline
memory: shared
on_error: escalate

Ask the user: "Start"
```

Commands without annotations have no header block.

## Engine Mode

When annotations are present, the command runs in **engine mode**:

- Tasks receive status line injection
- Each task must end output with `[status: ok]` or `[status: error] <reason>`
- The engine processes status to coordinate execution

**Example with annotations (engine mode):**
```stim
command deploy {
  @topology pipeline
  task "setup" { ask("?") }
}
```

**Compiled output includes:**
```
End your output with [status: ok] or [status: error] <reason>
```

**Example without annotations (normal mode):**
```stim
command deploy {
  task "setup" { ask("?") }
}
```

**Compiled output does not include status line.**

## Use Cases

### Sequential Deployment Pipeline

```stim
command deploy {
  @topology pipeline
  @memory shared
  
  task "validate" { ask("Valid?") }
  task bash "build" { ask("Build?") }
  task bash "test" { ask("Tests?") }
  task bash "deploy" { ask("Deploy?") }
}
```

### Parallel Analysis with Shared Results

```stim
command analyze {
  @topology fanout
  @memory shared
  
  parallel {
    task explore "frontend" { ask("Frontend?") }
    task explore "backend" { ask("Backend?") }
    task explore "infra" { ask("Infra?") }
  }
}
```

### Isolated Sandboxed Tasks

```stim
command experiment {
  @memory none
  
  task "experiment1" { ask("?") }
  task "experiment2" { ask("?") }
}
```

## Forward Compatibility

Additional values for `@on_error` are planned:
- `retry` — Retry task on error
- `ignore` — Continue despite error

Current versions only support `escalate`.

## See Also

- [Tasks](tasks.md) — Tasks affected by annotations
- [Parallel](parallel.md) — Parallel blocks with topology
- [Commands](commands.md) — Command structure with annotations
