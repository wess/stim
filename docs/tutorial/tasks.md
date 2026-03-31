# Chapter 7: Tasks and Subagents

Tasks let you spawn Claude Code subagents that work autonomously on subtasks. This is one of Stim's most powerful features. Instead of doing everything in one command, you can break complex work into focused pieces and run them in parallel.

## What Are Subagents?

A subagent is an autonomous instance of Claude Code that handles a specific task. When you create a task, Stim:

1. Generates a markdown file with instructions
2. Spawns a subagent to execute those instructions
3. Waits for the subagent to complete
4. Continues with the next statement

Subagents are useful for:
- Fast codebase exploration (finding files, understanding structure)
- Running shell commands and builds
- Making architectural decisions
- Running multiple jobs in parallel

## Why Tasks Matter

Without tasks, everything runs in a single agent thread. That works for simple commands, but complex workflows become slow and unwieldy. Tasks let you:

- **Parallelize work** - Run multiple agents simultaneously
- **Specialize work** - Use the right agent type for the job
- **Break complexity** - Split large workflows into smaller pieces
- **Increase autonomy** - Agents work without waiting for user confirmation

Example without tasks:

```stim
command review {
  ask("Run security check on the codebase")
  wait_for_response()
  
  ask("Run performance analysis")
  wait_for_response()
  
  ask("Run architecture review")
  wait_for_response()
  
  ask("Compile all findings into a report")
}
```

This is slow. Each analysis runs one at a time, and the user waits for confirmations.

With tasks:

```stim
command review {
  parallel {
    task explore "security audit" {
      ask("Find security vulnerabilities")
    }
    
    task explore "performance analysis" {
      ask("Find performance bottlenecks")
    }
    
    task explore "architecture review" {
      ask("Evaluate the architecture")
    }
  }
  
  ask("Compile all findings into a report")
}
```

All three analyses run simultaneously. Much faster.

## Inline Tasks: Simple Subagent Spawning

The simplest form of a task is inline:

```stim
task "description of what to do" {
  ask("Instructions for the subagent")
  wait_for_response()
}
```

The task body contains a sequence of statements. When the task runs, a subagent receives these instructions as a markdown prompt.

### Basic Example

```stim
command research {
  task "find authentication patterns in the codebase" {
    ask("Search the codebase for authentication-related code")
    wait_for_response()
    ask("Summarize the authentication patterns found")
  }
}
```

When compiled and run:
1. The main command spawns a subagent
2. The subagent receives instructions to search for auth patterns
3. The subagent explores and reports findings
4. Control returns to the main command

The task body (the `ask` statements) is compiled into markdown instructions that guide the subagent.

## Agent Types: Choosing the Right Tool

Different agent types are optimized for different kinds of work. Specify the agent type before the description:

```stim
task general "default purpose work" { }
task explore "search and analyze code" { }
task bash "run shell commands" { }
task plan "design and architecture" { }
```

### Agent Type Reference

| Type | Best For | Optimizations |
|------|----------|---------------|
| `general` (default) | General-purpose work, flexible tasks | Balanced capabilities |
| `explore` | Fast codebase search, reading files, understanding structure | Optimized for file search and code reading |
| `bash` | Running shell commands, git operations, builds, installs | Full shell access, optimized for CLI tools |
| `plan` | Architecture decisions, implementation planning, design | Optimized for strategic thinking and planning |

### When to Use Each Type

**Explore:** Fast, focused codebase analysis

```stim
task explore "find all API endpoints" {
  ask("Search the codebase for all route handlers and API endpoints")
  wait_for_response()
  ask("List each endpoint with its HTTP method and path")
}
```

Explore agents are fast at searching and reading code. Use them when you need to understand the codebase.

**Bash:** Running commands and builds

```stim
task bash "run the test suite" {
  ask("Execute the full test suite")
  wait_for_response()
  ask("Report any failures and their error messages")
}
```

Bash agents have shell access. Use them for builds, tests, git operations, and anything CLI-based.

**Plan:** Making architectural decisions

```stim
task plan "design the caching layer" {
  ask("Analyze the current codebase and application patterns")
  wait_for_response()
  ask("Propose a caching strategy that fits the architecture")
  wait_for_response()
  ask("Outline implementation steps and potential risks")
}
```

Plan agents are optimized for thinking through complex problems. Use them for design, architecture, and strategic decisions.

**General:** Default for flexible work

```stim
task general "analyze code style consistency" {
  ask("Check the codebase for style inconsistencies")
  wait_for_response()
  ask("Report findings and recommendations")
}
```

General agents are balanced. Use them when no specific type is optimal.

### Agent Type Syntax

Specify the type before the description:

```stim
task bash "run linter" {
  ask("Run eslint on all TypeScript files")
}

task explore "find TODOs" {
  ask("Find all TODO and FIXME comments")
}

task plan "design authentication flow" {
  ask("Design a token-based authentication system")
}
```

If you omit the type, `general` is used:

```stim
task "default agent type" {
  ask("Do something")
}
```

## File Reference Tasks: Reusing Command Definitions

Instead of writing task bodies inline, you can point to another `.stim` file. It gets parsed and inlined at compile time:

```stim
task("path/to/file.stim")
task("path/to/file.stim", agent_type)
```

The path is relative to the current file. The referenced file can be another command definition.

### File Reference Examples

Suppose you have a helper file `helpers/security.stim`:

```stim
command security_check {
  ask("Scan for SQL injection vulnerabilities")
  wait_for_response()
  
  ask("Check for XSS attack vectors")
  wait_for_response()
  
  ask("Look for hardcoded secrets and credentials")
  wait_for_response()
  
  ask("Summarize all security findings")
}
```

You can reference it in your main command:

```stim
// main.stim
command code_review {
  ask("What files should I review?")
  wait_for_response()
  
  task("helpers/security.stim", explore)
  
  ask("Security review complete!")
}
```

The `task()` statement references the security helper file. At compile time, Stim:
1. Reads `helpers/security.stim`
2. Extracts the command body
3. Inlines it as a task with `explore` agent type
4. Creates a self-contained compiled output

### How File References Work at Compile Time

File references are resolved at compile time, not runtime. This means:

- The compiled `.md` file is fully self-contained (no runtime dependency on the source file)
- You can move or delete the `.stim` files after compilation
- File references are expanded inline

Example:

```stim
// Before compilation
task("helpers/lint.stim", bash)

// After compilation (inlined)
task bash "lint the codebase" {
  ask("Run eslint")
  wait_for_response()
  ask("Fix any auto-fixable issues")
}
```

### Relative Paths

File references use relative paths from the current file:

```stim
// In commands/analyze.stim
task("../helpers/security.stim")   // Goes up one level, then into helpers

// In helpers/lint.stim
task("./typecheck.stim")            // In the same directory
task("../engine/main.stim")         // Goes up one level, then into engine
```

## Circular Reference Detection

Stim detects circular references at compile time and produces an error:

```stim
// a.stim
task("b.stim")

// b.stim
task("a.stim")  // Error: circular reference!
```

This prevents infinite loops. If file A references B, and B references A, compilation fails with a clear error message.

Similarly, if A references B, B references C, and C references A, that's also detected and rejected.

## How Tasks Compile to Markdown

Tasks compile to the Task tool format that Claude Code understands. Here's how it works:

An inline task:

```stim
task explore "find API endpoints" {
  ask("List all endpoints")
}
```

Compiles to a markdown instruction like:

```
## Task: Find API Endpoints

Type: explore
Description: Find API endpoints

Instructions:
Ask the agent: List all endpoints
Wait for response
```

When rendered as a Claude Code task, the agent receives these instructions and executes them autonomously.

A file reference:

```stim
task("helpers/security.stim", explore)
```

Compiles to:

```
## Task: Security Check

Type: explore
Instructions: [entire body of helpers/security.stim inlined here]
```

All file content is expanded inline, making the output self-contained.

## Parallel Tasks: Running Multiple Agents Simultaneously

Run multiple tasks concurrently with `parallel`:

```stim
parallel {
  task explore "analyze frontend" {
    ask("List all frontend components and libraries")
  }
  
  task explore "analyze backend" {
    ask("List all backend services and APIs")
  }
  
  task bash "run tests" {
    ask("Execute the full test suite")
  }
}
```

All three tasks spawn simultaneously. Claude Code waits for all to complete before continuing.

### Parallel Example: Comprehensive Code Review

```stim
command deep_review {
  ask("What codebase should I review?")
  wait_for_response()
  
  parallel {
    task explore "security audit" {
      ask("Scan for security vulnerabilities: SQL injection, XSS, auth flaws, secrets")
      wait_for_response()
      ask("Rate severity and provide fixes")
    }
    
    task explore "performance analysis" {
      ask("Find performance bottlenecks: N+1 queries, inefficient algorithms, memory leaks")
      wait_for_response()
      ask("Estimate impact and suggest optimizations")
    }
    
    task explore "architecture review" {
      ask("Evaluate code organization, separation of concerns, design patterns")
      wait_for_response()
      ask("Identify architectural debt and improvement areas")
    }
    
    task bash "check test coverage" {
      ask("Run test coverage tools and report percentages by module")
    }
  }
  
  ask("All reviews complete! Compile findings into a comprehensive CODE_REVIEW.md report")
  create_file("CODE_REVIEW.md", review_report)
}
```

Each task runs independently and in parallel. This is much faster than running them sequentially.

### Mixing Agent Types in Parallel

Use the right agent type for each task:

```stim
parallel {
  task("helpers/lint.stim", bash)
  task("helpers/typecheck.stim", bash)
  
  task explore "check for deprecations" {
    ask("Find deprecated functions and libraries in use")
  }
  
  task plan "design refactoring" {
    ask("Propose a refactoring strategy")
  }
}
```

Two bash tasks run shell commands, one explore task searches code, and one plan task designs a strategy. All run simultaneously.

## Exercise: Build a Codebase Analyzer

Create a command called `analyze` that uses different agent types to analyze a codebase from multiple angles.

Requirements:

1. Ask the user what codebase to analyze
2. Use `parallel` to spawn multiple tasks:
   - **Explore task**: "Find all source files and understand the project structure"
   - **Explore task**: "Identify third-party dependencies and their versions"
   - **Bash task**: "Run the project's test suite and report results"
   - **Plan task**: "Evaluate overall code quality and suggest improvements"
3. After all tasks complete, ask Claude to compile findings into an ANALYSIS.md file
4. Create the ANALYSIS.md file with the compiled findings

Here's a skeleton:

```stim
command analyze {
  ask("What's the root directory of the codebase?")
  wait_for_response()
  
  parallel {
    task explore "understand project structure" {
      // Ask the agent to explore the structure
    }
    
    task explore "find dependencies" {
      // Ask the agent to identify dependencies
    }
    
    task bash "run tests" {
      // Ask the agent to run tests
    }
    
    task plan "assess code quality" {
      // Ask the agent to evaluate quality
    }
  }
  
  // After all tasks complete
  ask("Compile the findings from all analyses into a comprehensive report")
  
  content = "# Codebase Analysis\n\n..."
  create_file("ANALYSIS.md", content)
  
  ask("Analysis complete! Check ANALYSIS.md for detailed findings.")
}
```

Complete this command with proper instructions for each task. When done:

1. Compile it: `bun run build && ./dist/stim compile analyze.stim`
2. Run it: `/analyze`
3. Point it at a real codebase (the Stim project itself!)
4. Verify all four tasks run in parallel
5. Check that the generated ANALYSIS.md file contains findings from all task types

This will teach you:
- How to use all four agent types
- How to run tasks in parallel
- How to compose findings from multiple agents
- How powerful task-based workflows can be

---

## Advanced: Task Patterns

### Multi-Stage Processing

Use sequential tasks to build on previous work:

```stim
command pipeline {
  // Stage 1: Analysis
  task explore "understand requirements" {
    ask("Analyze the project requirements")
  }
  
  // Stage 2: Planning
  task plan "design implementation" {
    ask("Based on the analysis above, design the implementation")
  }
  
  // Stage 3: Implementation prep
  task bash "prepare build environment" {
    ask("Set up the build environment")
  }
  
  ask("Pipeline complete!")
}
```

Each task builds on the previous one. Stages run sequentially, but within a stage you can use `parallel`.

### Conditional Parallel Tasks

Combine tasks with control flow:

```stim
command smart_review {
  if (confirm("Run security check?")) {
    task explore "security audit" {
      ask("Check for security issues")
    }
  }
  
  if (confirm("Run performance analysis?")) {
    parallel {
      task bash "profiling" {
        ask("Profile application performance")
      }
      
      task explore "code analysis" {
        ask("Find performance-related code issues")
      }
    }
  }
}
```

Tasks only run if the user confirms they're needed.

---

**Key Takeaways:**

- Tasks spawn autonomous subagents to handle work
- Four agent types: `general`, `explore`, `bash`, `plan`
- Choose the right type for the job
- Inline tasks have bodies with statements
- File references point to other `.stim` files (resolved at compile time)
- `parallel` runs multiple tasks simultaneously
- Circular references are detected and prevented
- Tasks compile to markdown instructions
- Combine tasks with control flow for sophisticated workflows

**Next Steps:**

- Build commands with tasks for your own projects
- Experiment with parallel processing
- Create reusable helper files
- Combine all previous chapters into complete, production-ready commands

---

**You've now learned all the core Stim concepts:**

1. Variables and data types
2. Control flow (if, for, while)
3. Built-in functions (ask, confirm, wait_for_response, create_file)
4. Tasks and subagents (inline, file references, agent types, parallel)

You're ready to build sophisticated, multi-agent Claude Code commands that automate complex workflows. Start with simple commands and gradually add control flow, tasks, and parallelism as complexity grows.
