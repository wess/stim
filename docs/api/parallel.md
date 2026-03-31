# Parallel

Parallel blocks execute multiple tasks concurrently.

## Syntax

```stim
parallel {
  task "description1" {
    // task body
  }
  task "description2" {
    // task body
  }
}
```

## Rules

A `parallel` block:
- May only contain `task` statements
- Cannot contain other statements (variables, asks, control flow, etc.)
- All tasks are executed concurrently
- The command waits for all tasks to complete before continuing

**Valid:**
```stim
parallel {
  task "frontend analysis" {
    ask("What patterns?")
  }
  task explore "backend analysis" {
    ask("What architecture?")
  }
}
```

**Invalid:**
```stim
parallel {
  ask("Setup")        // Error: not a task
  task "do something" {
    ask("Action")
  }
}
```

## Agent Types

All agent types are supported in parallel:

```stim
parallel {
  task "explore code" {
    ask("What patterns?")
  }
  task bash "run build" {
    ask("Build complete?")
  }
  task plan "design refactor" {
    ask("Architecture plan?")
  }
  task explore "find tests" {
    ask("Test coverage?")
  }
}
```

## File References

Use file reference tasks in parallel blocks:

```stim
parallel {
  task("research/frontend.stim", explore)
  task("research/backend.stim", explore)
  task("research/devops.stim", bash)
}
```

## Compiled Output

**Input:**
```stim
parallel {
  task "analyze frontend" {
    ask("What frameworks?")
  }
  task explore "analyze backend" {
    ask("What services?")
  }
}
```

**Output:**
```
Spawn 2 subagent tasks in parallel:

### Task 1
Spawn a general-purpose subagent task: "analyze frontend"
Use the Task tool with:
- subagent_type: general-purpose
- description: analyze frontend
- prompt:
  - Ask the user: "What frameworks?"

### Task 2
Spawn a Explore subagent task: "analyze backend"
Use the Task tool with:
- subagent_type: Explore
- description: analyze backend
- prompt:
  - Ask the user: "What services?"
```

## Use Cases

### Multi-perspective Analysis

Get multiple perspectives on a codebase in parallel:

```stim
parallel {
  task explore "find security issues" {
    ask("What security concerns?")
  }
  task explore "find performance issues" {
    ask("What performance concerns?")
  }
  task explore "find design issues" {
    ask("What design concerns?")
  }
}
```

### Parallel Implementation

Have multiple agents work on different features simultaneously:

```stim
parallel {
  task bash "implement auth" {
    ask("Auth implementation complete?")
  }
  task bash "implement api" {
    ask("API implementation complete?")
  }
  task bash "implement ui" {
    ask("UI implementation complete?")
  }
}
```

### Mixed Agent Types

Combine different agent types for specialized work:

```stim
parallel {
  task explore "document existing code" {
    ask("What's the current architecture?")
  }
  task bash "run tests" {
    ask("Test status?")
  }
  task plan "design improvements" {
    ask("Improvement plan?")
  }
}
```

## Nesting

Parallel blocks cannot be nested inside other parallel blocks. However, they can appear inside control flow:

```stim
if (ready_to_analyze) {
  parallel {
    task explore "analyze frontend" { }
    task explore "analyze backend" { }
  }
}
```

## Status Injection (Engine Mode)

When a command uses [annotations](annotations.md), each task in a parallel block includes status output:

```stim
command analyze {
  @topology fanout
  parallel {
    task "task1" { ask("?") }
    task "task2" { ask("?") }
  }
}
```

Each task must end with `[status: ok]` or `[status: error]` when running in engine mode.

## Performance Notes

All tasks start concurrently, but the system may throttle actual execution based on:
- Available resources
- Rate limits
- Agent capacity

The command waits for all tasks to complete regardless of order.

## See Also

- [Tasks](tasks.md) — Task syntax and agent types
- [Annotations](annotations.md) — Topology annotations affect parallel behavior
- [Control Flow](controlflow.md) — Use parallel in conditionals
