# Chapter 9: The Stim Engine

You can now build multi-agent workflows with parallel execution and shared libraries. But these workflows are still manual orchestrations. You tell Claude Code what to do step by step. The Stim Engine is different. It's an intelligent orchestration layer that sits between your Stim file and Claude Code, teaching Claude to coordinate agents, manage state, handle errors, and optimize for token efficiency.

The key insight: Claude Code IS the runtime. The engine teaches it to coordinate.

## What the Engine Is

The Stim Engine is a specialized system prompt and orchestration strategy that travels with your Stim file. It tells Claude Code how to:

1. Execute workflows as a directed graph of steps
2. Maintain working memory between steps (last two summaries)
3. Store durable state across workflow runs
4. Handle errors and escalate appropriately
5. Minimize token usage through compression and strategic memory

When you use the engine, you annotate your Stim file with metadata that describes your workflow's structure. The compiler generates a specialized `.md` file that Claude Code interprets as a coordinated, stateful workflow instead of a sequence of prompts.

## Installing the Engine

The engine ships with Stim:

```bash
stim install engine/engine.stim
```

This registers engine templates in your Stim environment. You can now use engine features in your commands.

## Using the Engine: The `/stim` Command

Once installed, you invoke an engine-powered workflow in Claude Code using:

```
/stim commands/myworkflow.stim
```

Claude Code recognizes the special engine format and executes it as a coordinated workflow, not a flat sequence of tasks.

## Annotations

Annotations are metadata at the top of your command block that describe workflow structure:

```stim
command myworkflow {
  @topology pipeline
  @memory shared
  @on_error escalate

  // Your workflow here
}
```

All annotations are optional. Defaults are: `pipeline`, `none`, `escalate`.

## Annotation Details

### Topology: How Tasks Are Executed

The `@topology` annotation tells the engine how to structure task execution.

**`@topology pipeline`** (default)
Sequential execution with working memory compression. Output from one step is summarized and becomes input to the next step:

```stim
command data_pipeline {
  @topology pipeline

  task bash "extract" {
    ask("Pull data from the source")
    wait_for_response()
  }

  task bash "transform" {
    ask("Transform the data according to schema")
    wait_for_response()
    // Gets a summary of extract's output
  }

  task bash "load" {
    ask("Load the data into the warehouse")
    wait_for_response()
    // Gets a summary of transform's output
  }
}
```

Each step's output is compressed before the next step begins, saving tokens.

**`@topology fanout`**
Parallel task execution with a synthesis step. All tasks run concurrently, then results are merged:

```stim
command research {
  @topology fanout

  parallel {
    task explore "find security issues" {
      ask("Audit the codebase for security vulnerabilities")
    }
    task explore "find performance issues" {
      ask("Identify performance bottlenecks")
    }
    task explore "measure coverage" {
      ask("Calculate test coverage")
    }
  }

  task general "synthesize" {
    ask("Combine the three analyses into a single report")
    wait_for_response()
    // Receives summaries of all parallel tasks
  }
}
```

Parallel tasks run concurrently. Results are compressed, then passed to a synthesis step.

**`@topology supervisor`**
Sequential execution with quality gates. After each step, a review task validates the output before proceeding:

```stim
command deploy {
  @topology supervisor

  task bash "run tests" {
    ask("Execute the test suite")
    wait_for_response()
  }

  task general "review test results" {
    ask("Did tests pass? If not, what failed?")
    wait_for_response()
  }

  task bash "build" {
    ask("Build the application")
    wait_for_response()
  }

  task general "review build" {
    ask("Did the build succeed? Any warnings?")
    wait_for_response()
  }

  task bash "deploy" {
    ask("Deploy to production")
    wait_for_response()
  }
}
```

Supervisor topology ensures quality gates between critical steps.

### Memory: State Management

The `@memory` annotation controls how state is shared between steps and workflow runs.

**`@memory none`** (default)
No state persistence. Each step starts fresh. Useful for one-off analyses:

```stim
command analyze {
  @memory none

  parallel {
    task explore "frontend" {
      ask("Analyze frontend")
    }
    task explore "backend" {
      ask("Analyze backend")
    }
  }
}
```

**`@memory shared`**
Persistent state across steps and runs. Results are stored in `.stim/state/` and accessible to future workflow invocations:

```stim
command incremental_audit {
  @memory shared

  task explore "find new security issues" {
    ask("Scan for NEW security issues since last run (use state/security.log for context)")
    wait_for_response()
  }

  task bash "update issue tracker" {
    ask("Update state/security.log with findings")
    wait_for_response()
  }
}
```

On first run, state files don't exist, so the task finds all issues. On subsequent runs, the task uses the state file to find only new issues.

State files are stored in `.stim/state/` relative to your project root.

### Error Handling: On Error

The `@on_error` annotation determines what happens when a task fails.

**`@on_error escalate`** (default)
Report the error to the user and pause execution. User decides whether to retry, skip, or abort:

```stim
command critical_deploy {
  @on_error escalate

  task bash "backup database" {
    ask("Create a database backup")
    wait_for_response()
  }

  task bash "run migrations" {
    ask("Execute database migrations")
    wait_for_response()
  }
}
```

If migrations fail, the user is notified immediately.

**`@on_error continue`**
Log the error and continue to the next step:

```stim
command cleanup {
  @on_error continue

  parallel {
    task bash "remove temp files" {
      ask("Delete /tmp/project/")
    }
    task bash "clear cache" {
      ask("Empty cache directory")
    }
  }

  ask("Cleanup complete (some steps may have failed)")
}
```

Even if one cleanup task fails, the other continues.

**`@on_error retry`**
Automatically retry the failed step up to 3 times:

```stim
command flaky_test {
  @on_error retry

  task bash "run tests" {
    ask("Execute test suite (may be flaky)")
    wait_for_response()
  }
}
```

If tests fail, they're automatically retried.

## Memory Model Details

### Working Memory: Sliding Window

Between steps, the engine maintains a sliding window of the last two step summaries. This provides context without the token overhead of full history:

**Step 1 (extract):**
Output: 50,000 tokens of raw data

Compressed: "Extracted 10,000 records from database with 3 errors in row 5000-5002."

**Step 2 (transform):**
Receives: Summary from step 1 (100 tokens)
Asks: "Transform this data..."

Compressed after step 2: "Transformed 9,997 records after removing 3 error rows."

**Step 3 (load):**
Receives: Summaries from steps 1 and 2 (200 tokens total)
Asks: "Load this data..."

This sliding window approach keeps token usage bounded while maintaining context.

### Durable Memory: State Files

Durable memory is stored in `.stim/state/` as plain text files. Your tasks can read and write them:

```stim
command learning_loop {
  @memory shared

  task bash "find issues" {
    ask("Scan codebase. Check .stim/state/findings.log for past issues. Report NEW findings only.")
    wait_for_response()
  }

  task bash "persist findings" {
    ask("Append new findings to .stim/state/findings.log")
    wait_for_response()
  }
}
```

On first run: `.stim/state/findings.log` doesn't exist, so all findings are new.
On second run: The file exists, so only truly new findings are reported.

### What Gets Shared Between Agents

When tasks run in sequence or parallel, summaries of previous outputs are passed as context:

```stim
command multiagent {
  @topology pipeline

  task explore "analyze code" {
    ask("What patterns exist?")
  }

  task plan "propose architecture" {
    ask("Based on the analysis, what architecture do you propose?")
    // Receives summary of the analysis
  }

  task bash "implement" {
    ask("Based on the proposed architecture, create the implementation")
    // Receives summary of both previous steps
  }
}
```

Each step sees summaries of previous results, not the raw uncompressed output.

## Error Handling Deep Dive

Error status is tracked throughout execution:

```stim
command robust {
  @on_error escalate

  task bash "critical_step" {
    ask("Do something critical")
  }

  if (confirm("Continue with dependent step?")) {
    task bash "dependent_step" {
      ask("This depends on critical_step succeeding")
    }
  }
}
```

When `critical_step` fails, execution pauses. The user is notified and can decide whether to retry, skip the dependent step, or abort.

## Token Efficiency

The engine is designed to minimize token usage through:

1. **Output compression:** Step results are summarized before being passed to the next step
2. **Sliding window memory:** Only the last two summaries are kept in context
3. **Lazy state loading:** Durable state is only read when requested
4. **Parallel execution:** Independent tasks don't wait, reducing total runtime
5. **Error boundaries:** Failed steps don't cascade token waste to subsequent steps

A 10-step workflow with output compression uses roughly the same tokens as a 3-step workflow with uncompressed output.

## Complete Example: Deploy Workflow

A real-world deployment workflow using the engine:

```stim
command deploy {
  @topology pipeline
  @memory shared
  @on_error escalate

  // Step 1: Validate
  task bash "validate" {
    ask("Run linter, type checker, and security scanner. Report any blockers.")
    wait_for_response()
  }

  // Step 2: Test
  task bash "test" {
    ask("Execute test suite. Report coverage and failures.")
    wait_for_response()
  }

  // Step 3: Build
  task bash "build" {
    ask("Build production bundle. Report size and any warnings.")
    wait_for_response()
  }

  // Step 4: Deploy to Staging
  task bash "deploy_staging" {
    ask("Deploy to staging environment. Verify health checks pass.")
    wait_for_response()
  }

  // Step 5: Smoke Tests
  task bash "smoke_tests" {
    ask("Run smoke tests on staging. Verify core functionality.")
    wait_for_response()
  }

  // Step 6: User Approval
  task general "approval" {
    ask("Review the deployment. Are you ready to go to production?")
    wait_for_response()
  }

  // Step 7: Deploy to Production
  task bash "deploy_prod" {
    ask("Deploy to production. Verify health checks. Monitor for errors.")
    wait_for_response()
  }

  // Step 8: Post-Deploy
  task bash "monitor" {
    ask("Check error logs, performance metrics, and user-facing uptime for 5 minutes.")
    wait_for_response()
  }

  ask("Deployment complete!")
}
```

Each step gets a summary of the previous step, so later steps understand what happened earlier. If validation fails, execution stops and the user is notified.

## Exercise: Build a Research Workflow

Create a research workflow with `@topology fanout`:

```stim
command research {
  @topology fanout
  @memory none
  @on_error escalate

  ask("What topic should I research?")
  wait_for_response()

  parallel {
    task explore "historical context" {
      ask("What's the historical background of this topic?")
    }
    task explore "current state" {
      ask("What's the current state of the field?")
    }
    task explore "future trends" {
      ask("What are emerging trends and predictions?")
    }
    task bash "find references" {
      ask("Search for academic papers, articles, and authoritative sources")
    }
  }

  task general "synthesis" {
    ask("Synthesize all research into a comprehensive report with citations")
    wait_for_response()
  }

  create_file("RESEARCH_REPORT.md", "research_output")

  ask("Research complete. See RESEARCH_REPORT.md for full findings.")
}
```

To use:
```bash
stim install research.stim
# In Claude Code: /stim research.stim
```

All four parallel tasks run concurrently. Their results are summarized and passed to the synthesis task.

## Key Takeaways

- The Stim Engine is an orchestration layer between your Stim file and Claude Code
- Annotations describe workflow structure: `@topology`, `@memory`, `@on_error`
- Topologies: `pipeline` (sequential with compression), `fanout` (parallel with synthesis), `supervisor` (with quality gates)
- Memory models: `none` (stateless), `shared` (persistent state)
- Error handling: `escalate` (pause for user), `continue` (skip failed step), `retry` (automatic retry)
- Working memory uses a sliding window of the last two summaries
- Durable memory persists in `.stim/state/` files
- The engine optimizes for token efficiency and user experience

## Next Steps

Chapter 10 covers best practices for all aspects of Stim development: naming conventions, command structure, project organization, token efficiency, testing, and real-world patterns.

See also:
- [Chapter 7: Parallel Execution](parallel.md) — Concurrent task execution
- [Chapter 6: Tasks and Subagents](tasks.md) — Spawning agents
- [Engine Design Specification](../superpowers/specs/2026-03-30-stim-engine-design.md) — Technical details
