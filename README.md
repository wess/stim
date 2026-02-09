# Stim

**A DSL compiler that transforms `.stim` files into Claude Code commands.**

Stim gives you variables, control flow, subagent tasks, and parallel execution for building sophisticated Claude Code slash commands. Write `.stim`, compile to markdown, use as `/command`.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why Stim?

Claude Code commands are markdown files. Simple ones are fine to write by hand, but complex workflows with branching logic, loops, and multi-agent orchestration become unreadable fast.

**Markdown by hand:**
```markdown
Ask me one question at a time so we can develop a spec...
Remember, only one question at a time...
Make sure to not be agreeable...
Once we are done, save the spec as SPEC.md...
Ask if the user wants to create a git repo...
```

**Stim:**
```stim
command brainstorm {
  questions = ["What problem?", "Who are users?", "What constraints?"]

  for question in questions {
    ask(question)
    wait_for_response()
  }

  while (!spec_complete) {
    ask("Next critical question?")
    if (confirm("Spec complete?")) {
      spec_complete = true
    }
  }

  create_file("SPEC.md", "generated_spec")
}
```

| Markdown | Stim |
|----------|------|
| Hard to maintain complex logic | Clean, readable control flow |
| Repetitive instructions | Variables and loops |
| No error checking | Type-safe compilation |
| Difficult to version control | Git-friendly source files |
| Copy-paste reuse | Modular file references |
| Single-agent only | Multi-agent parallelism |

## Features

- **Control flow** -- `if`/`else`, `while`, `for`, `break`
- **Variables** -- strings, booleans, arrays
- **User interaction** -- `ask()`, `confirm()`, `wait_for_response()`
- **File operations** -- `create_file()` and more
- **Subagent tasks** -- spawn `bash`, `explore`, `plan`, or `general` agents
- **Parallel execution** -- run multiple tasks concurrently with `parallel {}`
- **File references** -- `task("other.stim")` inlines another command at compile time
- **Standalone binary** -- compiles to a single executable with no runtime dependencies
- **Package management** -- `stim add github/user/repo` to install shared commands

## Installation

### Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/wess/stim/main/install.sh | sh
```

### Homebrew

```bash
brew install wess/packages/stim
```

### Manual Download

Download from [GitHub Releases](https://github.com/wess/stim/releases):

**macOS (Apple Silicon):**
```bash
curl -L https://github.com/wess/stim/releases/latest/download/stim-darwin-arm64 -o stim
chmod +x stim
sudo mv stim /usr/local/bin/
```

**macOS (Intel):**
```bash
curl -L https://github.com/wess/stim/releases/latest/download/stim-darwin-x64 -o stim
chmod +x stim
sudo mv stim /usr/local/bin/
```

**Linux (x64):**
```bash
curl -L https://github.com/wess/stim/releases/latest/download/stim-linux-x64 -o stim
chmod +x stim
sudo mv stim /usr/local/bin/
```

**Windows (x64):**
Download `stim-windows-x64.exe` from releases and add to your PATH.

### Build from Source

Requires [Bun](https://bun.sh).

```bash
git clone https://github.com/wess/stim.git
cd stim
bun install
bun run build
./dist/stim version
```

## Quick Start

**1. Write a `.stim` file:**

```stim
command greet {
  ask("What's your name?")
  wait_for_response()
  ask("Nice to meet you! How can I help today?")
}
```

**2. Install it as a Claude Code command:**

```bash
stim install greet.stim
```

**3. Use it:**

```
/greet
```

The `install` command compiles and places the output in `~/.claude/commands/`. Use `stim install greet.stim --local` to install to `.claude/commands/` in the current project instead.

To compile without installing (outputs to `dist/`):

```bash
stim compile greet.stim
```

## Language Overview

### Commands

Every `.stim` file declares one command:

```stim
command deploy {
  // statements here
}
```

The command name becomes the slash command (`/deploy`).

### Variables

```stim
name = "production"
items = ["api", "web", "worker"]
ready = true
```

### Control Flow

```stim
if (ready) {
  for service in items {
    ask("Deploy " + service + "?")
    wait_for_response()
  }
}

while (!done) {
  ask("Any more services?")
  if (confirm("All done?")) {
    done = true
  }
}
```

### Built-in Functions

```stim
ask("What should I work on?")       // prompt the user
wait_for_response()                  // pause for user input
confirm("Deploy to production?")     // yes/no confirmation
create_file("output.md", content)    // create a file
```

### Tasks

Spawn Claude Code subagents for autonomous subtasks:

```stim
// Default general-purpose agent
task "explore the auth module" {
  ask("What patterns exist?")
  wait_for_response()
}

// Specify an agent type: bash, explore, plan, general
task explore "find API endpoints" {
  ask("List all API endpoints in the project")
}

// Reference another .stim file (inlined at compile time)
task("helpers/security.stim", explore)
```

Agent types:

| Type | Use for |
|------|---------|
| `general` | General-purpose work (default) |
| `explore` | Fast codebase search and analysis |
| `bash` | Shell commands, git, builds |
| `plan` | Architecture and implementation planning |

### Parallel Execution

Run multiple tasks concurrently:

```stim
parallel {
  task explore "analyze frontend" {
    ask("What frontend patterns are used?")
  }
  task explore "analyze backend" {
    ask("What backend patterns are used?")
  }
  task bash "run tests" {
    ask("Execute the test suite")
  }
}
```

This compiles to instructions that tell Claude Code to spawn all three subagents simultaneously.

## CLI Reference

```bash
stim compile <file.stim>                     # Compile to dist/
stim install <file.stim> [--local]           # Install as Claude command
stim add <github/user/repo[@tag]> [--local]  # Add package from GitHub
stim remove <github/user/repo> [--local]     # Remove installed package
stim update [github/user/repo] [--local]     # Update packages
stim version                                 # Show version
stim help                                    # Show help
```

## Architecture

Three-stage pipeline: **Parse -> Resolve -> Compile**

```
.stim file -> Parser -> AST -> Resolver -> AST (resolved) -> Compiler -> Markdown
```

```
stim/
├── src/
│   ├── main.ts          # Entry point
│   ├── cli/             # CLI arg parsing, file I/O
│   ├── parser/          # Recursive descent parser -> AST
│   ├── resolve/         # Task file resolution (reads referenced .stim files)
│   ├── compiler/        # AST -> markdown generation
│   └── types/           # Statement, Command, AgentType definitions
├── examples/            # Example .stim commands
├── plugins/
│   ├── vscode/          # VS Code extension (syntax, snippets, diagnostics)
│   ├── neovim/          # Neovim plugin (syntax, text objects, templates)
│   └── zed/             # Zed extension (tree-sitter grammar, highlighting)
├── docs/                # Documentation
├── tests/               # Test suite
└── dist/                # Built executable
```

The parser and compiler are pure functions with no I/O. The resolver handles file reads for `task("file.stim")` references, keeping the pipeline clean.

## Documentation

- **[Quickstart](docs/Quickstart.md)** -- get running in 5 minutes
- **[Tutorial](docs/Tutorial.md)** -- step-by-step guide covering variables, control flow, tasks, and parallel execution
- **[Syntax Reference](docs/Syntax-Reference.md)** -- complete grammar, keywords, and EBNF
- **[API Reference](docs/API.md)** -- every statement type, function, and operator with compiled output examples
- **[Examples](docs/Examples.md)** -- real-world commands: surveys, code reviews, CI pipelines, multi-agent research
- **[FAQ](docs/FAQ.md)** -- common questions and troubleshooting
- **[Contributing](docs/Contributing.md)** -- development setup, code style, PR guidelines

## Examples

The `examples/` directory contains ready-to-use commands:

- **[brainstorm.stim](examples/brainstorm.stim)** -- interactive spec development
- **[commit.stim](examples/commit.stim)** -- semantic commit workflow
- **[plan.stim](examples/plan.stim)** -- project planning with phases
- **[session-summary.stim](examples/session-summary.stim)** -- session analysis
- **[security-review.stim](examples/security-review.stim)** -- security assessment
- **[recall.stim](examples/recall.stim)** -- context management

### Multi-Agent Example

A command that runs parallel analysis, then synthesizes the results:

```stim
command deep_review {
  ask("What code should I review?")
  wait_for_response()

  parallel {
    task explore "security scan" {
      ask("Check for SQL injection, XSS, auth flaws, exposed secrets")
      wait_for_response()
    }
    task explore "performance audit" {
      ask("Find N+1 queries, unnecessary allocations, blocking I/O")
      wait_for_response()
    }
    task explore "architecture review" {
      ask("Evaluate separation of concerns and dependency management")
      wait_for_response()
    }
  }

  ask("Compile all findings into a single report")
  create_file("REVIEW.md", "review_report")
}
```

### Modular Commands with File References

```stim
// helpers/lint.stim
command lint {
  ask("Run linter on all source files and fix auto-fixable issues")
}

// precommit.stim
command precommit {
  parallel {
    task("helpers/lint.stim", bash)
    task("helpers/typecheck.stim", bash)
  }
  ask("All checks passed!")
}
```

## Development

```bash
bun run dev                    # Run without building
bun run dev -- compile f.stim  # Compile in dev mode
bun run build                  # Build standalone binary
bun run build:all              # Cross-platform builds
bun test                       # Run test suite
```

## Editor Support

### VS Code

The `plugins/vscode/` extension provides:
- Syntax highlighting via TextMate grammar
- Snippets for commands, tasks, parallel blocks, loops
- Compile commands from the command palette
- Real-time diagnostics

### Neovim

The `plugins/neovim/` plugin provides:
- Syntax highlighting with agent type support
- Text objects, templates, and auto-completion
- Compilation with quickfix integration

### Zed

The `plugins/zed/` extension provides:
- Tree-sitter grammar for full syntax highlighting
- Smart indentation and bracket matching
- See the [Zed plugin README](plugins/zed/README.md) for build instructions

## Contributing

See [Contributing](docs/Contributing.md) for development setup, code style, and PR guidelines.

```bash
git clone https://github.com/wess/stim.git
cd stim
bun install
bun test
```

## License

MIT -- see [LICENSE](LICENSE).
