# Chapter 7: Parallel Execution

You've learned to spawn tasks and chain them sequentially. But some tasks don't need to wait for each other. A code review can check security and performance at the same time. A multi-file analysis can explore the frontend and backend in parallel. This chapter teaches you to speed up your workflows with concurrent execution.

## Why Parallel Matters

Sequential workflows execute one task after another. A command that spawns three analysis tasks takes as long as all three combined:

- Task 1 (explore frontend): 30 seconds
- Task 2 (explore backend): 30 seconds
- Task 3 (bash tests): 30 seconds
- Total: 90 seconds

With parallel execution, all three run at the same time:

- Task 1, 2, 3 (concurrent): 30 seconds

Parallel is crucial for multi-analysis workflows where subtasks are independent. It's how Stim handles real-world complexity without bogging down the user.

## The Parallel Block

Syntax:

```stim
parallel {
  task "first task" {
    ask("Do something")
  }
  task "second task" {
    ask("Do something else")
  }
  task "third task" {
    ask("Do yet another thing")
  }
}
```

All tasks inside the block run concurrently. Execution resumes sequentially after the block completes.

## Rules for Parallel

Only `task` statements are allowed inside a `parallel` block. Other statements (assignments, if/else, for loops) must go outside:

```stim
// Good
setup_var = "config"

parallel {
  task explore "analyze" {
    ask("What patterns exist?")
  }
  task bash "run tests" {
    ask("Execute tests")
  }
}

ask("All tasks complete")
```

```stim
// Invalid - ask() inside parallel
parallel {
  ask("This will not compile")
  task "oops" {
    ask("This is fine")
  }
}
```

## Mixing Agent Types in Parallel

Each task can use a different agent type. The parallel block doesn't care:

```stim
parallel {
  task explore "check frontend" {
    ask("What React components exist?")
  }
  task bash "run linter" {
    ask("Run eslint on all files")
  }
  task plan "design database" {
    ask("Propose a schema for user data")
  }
  task general "write docs" {
    ask("Create API documentation")
  }
}
```

The engine spawns four independent subagents. When all four finish, the next sequential statement runs.

## Using File References Inside Parallel

You can reference external `.stim` files inside parallel blocks:

```stim
// security.stim
command security_check {
  ask("Scan for SQL injection vulnerabilities")
  wait_for_response()
  ask("Check for exposed secrets")
  wait_for_response()
}

// performance.stim
command perf_check {
  ask("Find slow database queries")
  wait_for_response()
  ask("Identify memory leaks")
  wait_for_response()
}

// main.stim
command code_review {
  parallel {
    task("security.stim", explore)
    task("performance.stim", explore)
  }

  ask("Security and performance reviews complete")
}
```

Each file is inlined at compile time. The output is self-contained.

## Sequential Flow After Parallel

Parallel blocks are transparent to the rest of your command. The next statement runs only after all parallel tasks finish:

```stim
command workflow {
  // Setup
  ask("Starting multi-phase analysis")
  wait_for_response()

  // Phase 1: Parallel analysis
  parallel {
    task explore "analyze frontend" {
      ask("What frontend frameworks?")
    }
    task explore "analyze backend" {
      ask("What backend frameworks?")
    }
  }

  // Phase 2: Sequential synthesis (runs AFTER both parallel tasks finish)
  ask("Both analyses complete. Summarizing findings...")
  wait_for_response()

  // Phase 3: More parallel work (allowed)
  parallel {
    task bash "run frontend tests" {
      ask("Execute frontend test suite")
    }
    task bash "run backend tests" {
      ask("Execute backend test suite")
    }
  }

  // Final step
  ask("All work done!")
}
```

This pattern is common: parallelize independent work, then synthesize the results sequentially.

## How Parallel Compiles to Markdown

Let's trace compilation. Your `.stim` file:

```stim
command review {
  parallel {
    task explore "check frontend" {
      ask("What frontend patterns?")
    }
    task bash "check backend" {
      ask("What backend patterns?")
    }
  }

  ask("Analysis complete")
}
```

Compiles to markdown with special markers that Claude Code interprets as concurrent instructions:

```markdown
# /review

Start these tasks in parallel:

---
**Task 1: check frontend (explore)**

What frontend patterns?

---
**Task 2: check backend (bash)**

What backend patterns?

---

Wait for all parallel tasks above to complete, then continue:

Analysis complete
```

Claude Code sees the `parallel` section and spawns subagents concurrently. The exact markdown format is an implementation detail, but the key insight is: your Stim code becomes a readable, version-controlled document.

## When to Use Parallel vs Sequential

**Use parallel when:**
- Tasks are independent (don't depend on each other's output)
- You want faster overall execution
- Tasks have similar expected duration
- You're analyzing multiple code areas simultaneously

**Use sequential when:**
- One task depends on another's output
- You need to gather input, then use it in the next task
- Order matters for clarity
- You want fine-grained control over what happens when

Example of appropriate sequential flow:

```stim
command setup {
  ask("What's your project name?")
  wait_for_response()

  ask("What's your tech stack?")
  wait_for_response()

  // Can't parallelize these - they depend on user input
  task bash "create project structure" {
    ask("Create directories matching the tech stack")
  }

  task bash "install dependencies" {
    ask("Install required packages")
  }
}
```

Example of appropriate parallel:

```stim
command analyze {
  // These are independent
  parallel {
    task explore "find security issues" {
      ask("Scan for vulnerabilities")
    }
    task explore "find performance issues" {
      ask("Identify bottlenecks")
    }
    task explore "check test coverage" {
      ask("Measure coverage percentage")
    }
  }

  ask("All analyses complete")
}
```

## Exercise: Build a Deep Code Review

Create a file called `deepreview.stim` that performs three parallel analysis tasks: security, performance, and code quality. After all three complete, ask the user which issues are most critical.

```stim
command deepreview {
  ask("What codebase should I review?")
  wait_for_response()

  parallel {
    task explore "security analysis" {
      ask("Identify security vulnerabilities: SQL injection, XSS, authentication flaws, data exposure")
      wait_for_response()
    }
    task explore "performance analysis" {
      ask("Identify performance issues: slow algorithms, N+1 queries, memory leaks, inefficient loops")
      wait_for_response()
    }
    task explore "code quality analysis" {
      ask("Identify code quality issues: duplication, complexity, poor naming, missing tests")
      wait_for_response()
    }
  }

  ask("All analyses complete. Which category of issues is most critical to address first?")
  wait_for_response()

  if (confirm("Should I create a prioritized action plan?")) {
    ask("Creating action plan with prioritized fixes...")
    wait_for_response()
  }
}
```

**To test:**

```bash
stim install deepreview.stim
# In Claude Code: /deepreview
```

The three analysis tasks run simultaneously. You'll see subagents working in parallel. When all three finish, the user is asked to prioritize.

## Key Takeaways

- Parallel blocks run multiple tasks concurrently
- Only `task` statements go inside `parallel {}`
- Non-task statements must be outside the block
- Sequential flow resumes after parallel completes
- Use parallel for independent, time-consuming analyses
- Mix agent types freely inside parallel blocks
- File references work inside parallel blocks

## Next Steps

You now know how to speed up multi-analysis workflows. But you're duplicating prompts across commands. Chapter 8 introduces the import system, which lets you reuse common logic across many `.stim` files.

See also:
- [Chapter 6: Tasks and Subagents](tasks.md) — Learn about task spawning
- [Chapter 8: Imports and Reusability](imports.md) — Build shared libraries
- [Syntax Reference: Parallel](../Syntax-Reference.md#parallel) — Grammar details
