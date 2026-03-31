# Chapter 10: Best Practices

You've learned syntax, variables, control flow, tasks, parallel execution, imports, and the Stim Engine. This final chapter distills patterns, conventions, and real-world wisdom that turn working code into production-ready, maintainable Stim commands.

## Naming Conventions

Descriptive names prevent subtle bugs and make code readable months later.

**Variables:**
```stim
// Good - clear purpose
security_checks = ["SQL injection", "XSS", "Auth flaws"]
user_confirmed = true
review_timeout = "300"

// Avoid - vague names
checks = ["SQL injection", "XSS", "Auth flaws"]
flag = true
timeout = "300"
```

**Commands:**
```stim
// Good - verb + noun
security_review
code_analysis
deploy_to_staging
audit_dependencies

// Avoid - vague or too broad
check
do_stuff
main
process
```

**Arrays:**
```stim
// Good - plural or _list suffix
security_issues = [...]
stages_to_run = [...]
framework_options = [...]

// Avoid - singular (confusing for iteration)
issue = [...]
stage = [...]
framework = [...]
```

Consistency matters more than perfection. Pick a style and stick with it across your project.

## Command Structure Pattern: Setup, Process, Output

Most effective commands follow a three-phase pattern:

1. **Setup:** Gather information from the user
2. **Process:** Do the work (tasks, analysis, etc.)
3. **Output:** Present results or create artifacts

```stim
command code_review {
  // Phase 1: Setup
  ask("What file or directory should I review?")
  wait_for_response()
  
  ask("What's the primary language?")
  wait_for_response()

  // Phase 2: Process
  parallel {
    task explore "security" {
      ask("Find security vulnerabilities")
    }
    task explore "performance" {
      ask("Find performance issues")
    }
    task explore "quality" {
      ask("Find code quality issues")
    }
  }

  // Phase 3: Output
  create_file("REVIEW_REPORT.md", "review_template")
  ask("Review complete. See REVIEW_REPORT.md")
}
```

This pattern is clear, testable, and adapts to almost any workflow.

## Keep Commands Focused: One Purpose Per Command

A command should do one thing well. Avoid command creep.

**Good - focused:**
```stim
// security_audit.stim - does security audits
command security_audit {
  for check in security_checks {
    ask("Check for: " + check)
  }
}

// performance_audit.stim - does performance audits
command performance_audit {
  for check in performance_checks {
    ask("Check for: " + check)
  }
}
```

**Avoid - kitchen sink:**
```stim
// audit.stim - tries to do everything
command audit {
  ask("What type of audit? (security/performance/quality)")
  wait_for_response()
  
  if (type == "security") {
    for check in security_checks {
      ask("Check for: " + check)
    }
  }
  
  if (type == "performance") {
    for check in performance_checks {
      ask("Check for: " + check)
    }
  }
  
  // 200 more lines of similar logic
}
```

Multiple focused commands are easier to maintain, test, and reuse than one monolithic command.

## Use Imports for Shared Logic

Never copy-paste variable definitions or prompt text.

**Before (duplication):**
```stim
// File 1
security_checks = ["SQL injection", "XSS", ...]

// File 2
security_checks = ["SQL injection", "XSS", ...]

// File 3
security_checks = ["SQL injection", "XSS", ...]
```

**After (imports):**
```stim
// shared/security.stim
security_checks = ["SQL injection", "XSS", ...]

// File 1
import "../shared/security.stim"
command audit1 { ... }

// File 2
import "../shared/security.stim"
command audit2 { ... }

// File 3
import "../shared/security.stim"
command audit3 { ... }
```

Edit once, propagate everywhere.

## Choose the Right Agent Type

Each agent type is optimized for specific work.

| Agent Type | Best For | Example |
|------------|----------|---------|
| `explore` | Reading code, answering codebase questions | "Find all API endpoints" |
| `bash` | Running commands, git, builds, installs | "Run tests and report results" |
| `plan` | Architecture, design decisions, strategies | "Design a caching layer" |
| `general` | Everything else (default) | "Write documentation" |

Match the agent to the task:

```stim
parallel {
  task explore "analyze code" {
    ask("What patterns exist?")
  }
  
  task bash "run tests" {
    ask("Execute test suite")
  }
  
  task plan "design fix" {
    ask("Propose an architecture for the fix")
  }
  
  task general "document" {
    ask("Create user-facing documentation")
  }
}
```

Right agent + clear ask = faster, more accurate work.

## When to Use Parallel vs Sequential

**Use parallel when:**
- Tasks are independent (no data flowing between them)
- You want to speed up overall execution
- Tasks have similar expected duration
- You're analyzing multiple code areas

```stim
parallel {
  task explore "frontend" {
    ask("What frontend frameworks?")
  }
  task explore "backend" {
    ask("What backend frameworks?")
  }
}
```

**Use sequential when:**
- Later tasks depend on earlier task output
- You need to gather user input between steps
- Order matters for clarity
- You want fine-grained control

```stim
ask("What directory to analyze?")
wait_for_response()

task explore "find issues" {
  ask("Scan that directory for issues")
}

task general "summarize" {
  ask("Summarize the issues found")
}
```

## Token Efficiency Tips

**Keep ask() prompts concise:**
```stim
// Good - focused
ask("What's your codebase?")

// Avoid - rambling
ask("I'm going to analyze your codebase now. Please tell me: what is your codebase? I need to know so I can understand what I'm analyzing.")
```

**Use variables instead of repeating strings:**
```stim
// Good
framework = "React"
ask("Setting up " + framework)
ask("Installing " + framework + " dependencies")

// Avoid - tokens wasted on repetition
ask("Setting up React")
ask("Installing React dependencies")
```

**Leverage the engine's memory compression:**
```stim
command pipeline {
  @topology pipeline

  task bash "extract" {
    ask("Pull data from source")
  }

  task bash "transform" {
    ask("Transform the data")
    // Automatically gets a summary, not the full output
  }
}
```

**Break long analyses into smaller tasks:**
```stim
// Tokens spike with one giant ask
task bash "do_everything" {
  ask("Run linter, tests, security scan, performance analysis, and generate a report")
}

// Better - token spikes are smaller
task bash "lint" {
  ask("Run linter")
}

task bash "test" {
  ask("Run tests")
}

task bash "security" {
  ask("Security scan")
}

task bash "perf" {
  ask("Performance analysis")
}
```

## Error Messages: Make confirm() Clear

Confirmation prompts should tell the user what will happen if they say yes.

```stim
// Good - clear consequence
if (confirm("Deploy to PRODUCTION? This will affect live users.")) {
  deploy()
}

// Avoid - vague
if (confirm("Continue?")) {
  deploy()
}
```

```stim
// Good - specific outcome
if (confirm("Create 50 test files? This will take ~30 seconds.")) {
  create_files()
}

// Avoid - unclear
if (confirm("Proceed?")) {
  create_files()
}
```

## Testing Your Commands

**Step 1: Compile without installing**
```bash
stim compile mycommand.stim
cat dist/mycommand.md
```

Read the generated markdown. Does it look right? Are variables substituted correctly? Does the flow make sense?

**Step 2: Check for syntax errors**
```bash
stim compile mycommand.stim 2>&1 | grep -i error
```

**Step 3: Install and test in Claude Code**
```bash
stim install mycommand.stim
# In Claude Code: /mycommand
```

Run it end-to-end. Does it feel natural? Do the prompts make sense? Are there typos?

**Step 4: Test edge cases**
If your command has `if/else`, test both paths. If it has loops, test with empty arrays. If it spawns tasks, verify all tasks run correctly.

## Organizing a Project: Directory Structure

Structure your Stim project to scale:

```
myproject/
  .stim/
    state/              # Durable state (auto-created)
      findings.log
      cache.json
  shared/
    prompts.stim        # Shared prompt text
    checks.stim         # Shared check lists
    templates.stim      # Shared file templates
  commands/
    security/
      audit.stim
      scan.stim
    deploy/
      staging.stim
      production.stim
    analysis/
      code_review.stim
      performance.stim
  helpers/
    security_checks.stim
    performance_checks.stim
```

Benefits:
- **shared/** for reusable variables (import from anywhere)
- **commands/** organized by purpose
- **helpers/** for common task logic
- **.stim/state/** for persistent state

Import paths become clear:
```stim
// In commands/security/audit.stim
import "../../shared/prompts.stim"
import "../../shared/checks.stim"
```

## Real-World Patterns

### The Interview Loop

Ask questions iteratively until the user confirms they're done:

```stim
command gather_requirements {
  requirements = []

  done = false
  while (!done) {
    ask("Describe the next requirement")
    wait_for_response()

    if (confirm("Add more requirements?")) {
      done = false
    } else {
      done = true
    }
  }

  ask("I've captured all requirements. Ready to build?")
}
```

### The Checklist Pattern

Iterate through a list and let the user check off completed items:

```stim
command deploy_checklist {
  stages = ["tests", "lint", "security", "build", "staging", "production"]

  for stage in stages {
    if (confirm("Have you completed: " + stage + "?")) {
      ask("Great! Moving on.")
    } else {
      ask("Please complete " + stage + " before proceeding.")
      break
    }
  }
}
```

### The Multi-Angle Analysis

Attack a problem from multiple angles in parallel, then synthesize:

```stim
command deep_analysis {
  @topology fanout

  parallel {
    task explore "security perspective" {
      ask("What are the security implications?")
    }
    task explore "performance perspective" {
      ask("What are the performance implications?")
    }
    task explore "user perspective" {
      ask("How will users experience this?")
    }
  }

  task general "synthesis" {
    ask("Synthesize all perspectives into recommendations")
    wait_for_response()
  }
}
```

### The Incremental Workflow

Use durable memory to track progress across multiple runs:

```stim
command ongoing_audit {
  @topology pipeline
  @memory shared

  task bash "scan" {
    ask("Scan codebase. Compare to .stim/state/previous_issues.log. Report NEW issues only.")
    wait_for_response()
  }

  task bash "persist" {
    ask("Append new findings to .stim/state/previous_issues.log")
    wait_for_response()
  }
}
```

First run: finds all issues. Second run: finds only new issues. Third run: finds only issues created since the second run.

## Where to Go From Here

You've learned Stim from syntax to advanced patterns. Next steps:

**Read the API Reference**
[API.md](../API.md) documents every statement and function with examples.

**Study Real-World Examples**
[Examples.md](../Examples.md) shows production commands you can run and adapt.

**Check the Syntax Reference**
[Syntax-Reference.md](../Syntax-Reference.md) is a complete grammar reference for when you forget details.

**Contribute**
Find a bug? Have an idea? See [Contributing.md](../Contributing.md) to help improve Stim.

**Build and Share**
The best way to learn is to build. Start with a small workflow, compile it, test it, iterate. Share your commands with your team. Stim commands are just markdown files, so they version-control beautifully.

## Key Takeaways

- Use descriptive names consistently
- Follow setup/process/output structure
- Keep commands focused on one purpose
- Import shared variables, don't copy-paste
- Match agent types to tasks
- Use parallel for independent work, sequential for dependent work
- Write concise prompts to minimize tokens
- Make confirmation prompts explicit
- Test locally before using in Claude Code
- Organize projects with shared/, commands/, helpers/
- Learn and adapt real-world patterns

## Summary of All Ten Chapters

1. **Introduction** — What Stim is and why it matters
2. **Getting Started** — Installation and your first command
3. **Variables and Data Types** — Store and manipulate data
4. **Control Flow** — Make decisions with if/else and loops
5. **Functions** — Interact with the user and filesystem
6. **Tasks and Subagents** — Spawn autonomous agents
7. **Parallel Execution** — Run tasks concurrently
8. **Imports and Reusability** — Build shared libraries
9. **The Stim Engine** — Orchestration, state, and optimization
10. **Best Practices** — Patterns, conventions, and real-world wisdom

You now have the knowledge to build sophisticated, production-ready Claude Code workflows. Stim brings software engineering rigor to prompt automation. Use these tools well.

Happy building.

## Further Reading

- [API Reference](../API.md) — Complete language documentation
- [Syntax Reference](../Syntax-Reference.md) — Grammar and keywords
- [Examples](../Examples.md) — Real commands to learn from
- [FAQ](../FAQ.md) — Common questions answered
- [Contributing Guide](../Contributing.md) — How to contribute to Stim
