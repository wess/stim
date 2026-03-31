# Chapter 8: Imports and Reusability

You've built commands with variables, control flow, tasks, and parallel execution. But you keep rewriting the same prompts. A security analysis prompt exists in three different commands. A code quality check appears in five files. This duplication creates maintenance nightmares: fix a typo in one place, miss it in four others.

This chapter introduces imports, a system that lets you write shared prompts once and reuse them everywhere. It's how teams build maintainable Stim projects.

## The Problem: Duplicated Prompts

Without imports, a medium-sized Stim project looks like this:

```stim
// security_review.stim
command security_review {
  security_checks = [
    "SQL injection vulnerabilities",
    "XSS attack vectors",
    "Authentication/authorization flaws",
    "Sensitive data exposure"
  ]

  for check in security_checks {
    ask("Check for: " + check)
    wait_for_response()
  }
}
```

```stim
// code_quality.stim
command code_quality {
  security_checks = [
    "SQL injection vulnerabilities",
    "XSS attack vectors",
    "Authentication/authorization flaws",
    "Sensitive data exposure"
  ]

  ask("Additionally, check code quality...")
  // Plus more logic
}
```

```stim
// api_audit.stim
command api_audit {
  security_checks = [
    "SQL injection vulnerabilities",
    "XSS attack vectors",
    "Authentication/authorization flaws",
    "Sensitive data exposure"
  ]

  ask("For this API, check:")
  for check in security_checks {
    ask(check)
  }
}
```

The same security checks array is copy-pasted three times. If you discover a new vulnerability class, you edit three files. If you miss one, the commands become inconsistent.

## The Import Statement

Imports appear at the top of your file, before the `command` block:

```stim
import "shared/checks.stim"
import "shared/prompts.stim"

command mycommand {
  // Your code here
}
```

Imports bring variables from other files into the current file's namespace. The imported file contains only variable assignments, not command logic:

```stim
// shared/checks.stim
security_checks = [
  "SQL injection vulnerabilities",
  "XSS attack vectors",
  "Authentication/authorization flaws",
  "Sensitive data exposure"
]

performance_checks = [
  "Slow database queries",
  "N+1 query problems",
  "Memory leaks",
  "Inefficient loops"
]
```

Now you can import and use those variables:

```stim
import "shared/checks.stim"

command security_review {
  for check in security_checks {
    ask("Check for: " + check)
    wait_for_response()
  }
}
```

The `security_checks` variable from the imported file is available in your command.

## What Gets Imported

Only variable assignments are imported. Commands, task definitions, and control flow statements cannot be imported:

**shared/library.stim (valid imports):**
```stim
// String
greeting = "Hello, developer"

// Boolean
verbose_output = true

// Array
review_types = ["security", "performance", "quality"]

// Nested array construction
common_frameworks = [
  "React",
  "Vue",
  "Angular"
]
```

**shared/library.stim (invalid - these fail to import):**
```stim
// Cannot import: these are not variable assignments
command analysis {
  ask("This won't be imported")
}

// Cannot import: control flow isn't a variable
if (true) {
  result = "no"
}

// Cannot import: function calls aren't variables
git_init()
```

If you try to import a file with commands or control flow, you get a compilation error.

## Import Paths

Paths are relative to the importing file:

```stim
// File: src/commands/review.stim
// Import from sibling: ../shared/checks.stim
import "../shared/checks.stim"

// Import from subdirectory: ./prompts/security.stim
import "./prompts/security.stim"

// Deep relative path: ../../shared/constants.stim
import "../../shared/constants.stim"
```

If your file structure is:

```
project/
  shared/
    checks.stim
  commands/
    security.stim
    performance.stim
```

In `commands/security.stim`:
```stim
import "../shared/checks.stim"
```

In `commands/performance.stim`:
```stim
import "../shared/checks.stim"
```

Paths use forward slashes even on Windows.

## Multiple Imports

Import from several files:

```stim
import "shared/checks.stim"
import "shared/prompts.stim"
import "shared/templates.stim"

command review {
  // All variables from all three files are available
  for check in security_checks {
    ask(check_prompt)
  }
}
```

Order matters when files define overlapping variable names. See "Import Override Behavior" below.

## Import Override Behavior

If two imported files define the same variable, the last import wins:

```stim
// shared/defaults.stim
timeout = "30"
retry_count = "3"

// shared/production.stim
timeout = "60"  // Different value
retry_count = "5"  // Different value

// main.stim
import "shared/defaults.stim"
import "shared/production.stim"

command deploy {
  ask("Using timeout: " + timeout)  // "60" (production wins)
  ask("Retries: " + retry_count)    // "5" (production wins)
}
```

This allows you to have a default library and override it with environment-specific values. The production settings import last, so they take precedence.

## Nested Imports

A file can import from other files, which themselves import:

```stim
// shared/base.stim
framework = "React"

// shared/extended.stim
import "shared/base.stim"
component_library = "Material-UI"

// main.stim
import "shared/extended.stim"

command build {
  ask("Using " + framework)  // "React" - available transitively
  ask("With " + component_library)  // "Material-UI"
}
```

Transitive imports work: if A imports B, and you import A, you get B's variables too.

## Circular Import Detection

Circular imports are detected at compile time:

```stim
// a.stim
import "b.stim"
var_a = "a"

// b.stim
import "a.stim"
var_b = "b"

// main.stim
import "a.stim"  // ERROR: Circular dependency detected
```

The compiler reports this as an error and refuses to compile. Reorganize your imports to form a directed acyclic graph (DAG).

## Building a Shared Library

Here's a real-world example: create a shared prompts library used across your Stim project.

**shared/prompts.stim:**
```stim
// Security prompts
security_intro = "I'll perform a comprehensive security audit of your codebase."

security_checks = [
  "SQL injection vulnerabilities",
  "XSS and CSRF vectors",
  "Authentication/authorization flaws",
  "Sensitive data exposure",
  "Insecure deserialization",
  "Weak cryptography"
]

// Performance prompts
performance_intro = "Let's identify performance bottlenecks and optimization opportunities."

performance_checks = [
  "Slow database queries and N+1 problems",
  "Inefficient algorithms and loops",
  "Memory leaks and resource exhaustion",
  "Unoptimized asset loading",
  "Unnecessary re-renders and computations"
]

// Code quality prompts
quality_intro = "I'll review your code for maintainability, clarity, and best practices."

quality_checks = [
  "Code duplication and DRY violations",
  "Cyclomatic complexity",
  "Poor naming and unclear intent",
  "Missing or outdated documentation",
  "Inadequate test coverage"
]

// Common follow-up
action_plan_prompt = "Based on the findings, create a prioritized action plan with specific fixes."
```

**commands/security.stim:**
```stim
import "../shared/prompts.stim"

command security {
  ask(security_intro)
  
  for check in security_checks {
    ask("Check for: " + check)
    wait_for_response()
  }

  if (confirm("Create action plan?")) {
    ask(action_plan_prompt)
    wait_for_response()
  }
}
```

**commands/performance.stim:**
```stim
import "../shared/prompts.stim"

command performance {
  ask(performance_intro)
  
  for check in performance_checks {
    ask("Analyze: " + check)
    wait_for_response()
  }

  if (confirm("Create action plan?")) {
    ask(action_plan_prompt)
    wait_for_response()
  }
}
```

**commands/fullaudit.stim:**
```stim
import "../shared/prompts.stim"

command fullaudit {
  parallel {
    task bash "security" {
      ask(security_intro)
      for check in security_checks {
        ask("Check: " + check)
        wait_for_response()
      }
    }
    task bash "performance" {
      ask(performance_intro)
      for check in performance_checks {
        ask("Analyze: " + check)
        wait_for_response()
      }
    }
    task bash "quality" {
      ask(quality_intro)
      for check in quality_checks {
        ask("Review: " + check)
        wait_for_response()
      }
    }
  }

  ask(action_plan_prompt)
}
```

Now all commands use the same prompts. Change a prompt once in `shared/prompts.stim`, and all commands reflect it immediately.

## How Imports Work Under the Hood

Imports are resolved at compile time, not runtime. When you compile:

```bash
stim install commands/security.stim
```

The compiler:
1. Reads `security.stim`
2. Finds `import "../shared/prompts.stim"`
3. Reads `shared/prompts.stim`
4. Extracts all variable assignments
5. Inlines them into the compiled output
6. Recursively resolves nested imports
7. Writes a self-contained `.md` file

The resulting `.md` file contains all variables. It has no reference to the original `.stim` files. This means:
- No runtime dependency on the imported files
- Imported files don't need to exist when the command runs
- The command is portable and self-contained

## What Cannot Be Imported

Only variables can be imported. These cannot:

**Commands:**
```stim
// shared/commands.stim
command helper {
  ask("This command cannot be imported")
}

// main.stim
import "shared/commands.stim"  // OK, but the command is ignored
```

**Control flow:**
```stim
// shared/logic.stim
if (true) {
  x = "value"
}
```

**Function calls:**
```stim
// shared/logic.stim
git_init()  // Not a variable assignment
ask("Hi")   // Not a variable assignment
```

**Tasks:**
```stim
// shared/tasks.stim
task "work" {
  ask("This is a task, not a variable")
}
```

If you need to reuse tasks or logic, use file references (Chapter 6) or create separate shared files that are imported into tasks.

## Exercise: Refactor a Code Review Command

You have a code review command that repeats the same prompts in multiple places. Refactor it to use imports.

**Before (with duplication):**
```stim
command review {
  security_issues = [
    "SQL injection",
    "XSS",
    "Auth flaws"
  ]

  performance_issues = [
    "Slow queries",
    "Memory leaks"
  ]

  ask("Running security check...")
  for issue in security_issues {
    ask("Check for: " + issue)
    wait_for_response()
  }

  ask("Running performance check...")
  for issue in performance_issues {
    ask("Check for: " + issue)
    wait_for_response()
  }
}
```

**After (with imports):**

Create `shared/review.stim`:
```stim
security_issues = [
  "SQL injection",
  "XSS",
  "Auth flaws"
]

performance_issues = [
  "Slow queries",
  "Memory leaks"
]

security_intro = "Running security check..."
performance_intro = "Running performance check..."
```

Create `commands/review.stim`:
```stim
import "../shared/review.stim"

command review {
  ask(security_intro)
  for issue in security_issues {
    ask("Check for: " + issue)
    wait_for_response()
  }

  ask(performance_intro)
  for issue in performance_issues {
    ask("Check for: " + issue)
    wait_for_response()
  }
}
```

Now the prompts are centralized. Edit `shared/review.stim` to change them everywhere at once.

## Key Takeaways

- Imports bring variables from other files into your command
- Import statements go at the top, before `command`
- Paths are relative to the importing file
- Only variable assignments can be imported
- Last import wins for duplicate variable names
- Imports are resolved at compile time, inlining into output
- Use imports to build shared prompt libraries
- Circular imports are detected and rejected

## Next Steps

You've learned to reuse variables across commands. Chapter 9 covers the Stim Engine, a powerful orchestration system that teaches Claude Code to coordinate multiple agents, manage state across workflow steps, and handle errors gracefully.

See also:
- [Chapter 7: Parallel Execution](parallel.md) — Run tasks concurrently
- [Chapter 6: Tasks and Subagents](tasks.md) — Spawn autonomous agents
- [Syntax Reference: Imports](../Syntax-Reference.md#imports) — Grammar details
