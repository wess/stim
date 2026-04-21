# Stim

**A DSL for writing AI prompts — commands, agents, and rules — that compiles to whatever tool you use.**

Write one `.stim` file. Target Claude Code, ChatGPT, Cursor, or any future AI tool by switching a flag.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why Stim?

AI prompts have become software. Slash commands, system prompts, agent definitions, rule files — they're all code now, but most of us write them as raw markdown that breaks the moment the logic gets complex or the tool changes. Stim treats prompts as source code: parse, validate, compile.

**Two declarators, three targets:**

```stim
command deploy {
  ask("Which environment?")
  wait_for_response()
  for service in services {
    task bash "deploy " + service { ... }
  }
}
```

```stim
agent reviewer {
  description "Reviews PRs for security and correctness"
  tools [Read, Grep, Bash]
  model "sonnet"

  "You are a senior code reviewer. Cite specific files and line numbers."
  "Prioritize by severity: must change, should change, could improve."
}
```

One source, many outputs:

```bash
stim install reviewer.stim                   # → ~/.claude/agents/reviewer.md
stim install reviewer.stim --target cursor   # → .cursor/rules/reviewer.mdc
stim compile reviewer.stim --target chatgpt  # → dist/chatgpt/reviewer.md
```

## What You Get

- **Two declarators** — `command` for interactive slash commands, `agent` for system prompts with metadata
- **Three targets** — `claude`, `chatgpt`, `cursor` (more to come; targets are pluggable adapters)
- **Real control flow** — `if`/`else`, `while`, `for`, `break`
- **Variables and imports** — strings, booleans, arrays; share definitions across files
- **Subagent tasks** — spawn `bash`, `explore`, `plan`, or `general` agents; run them in parallel
- **Package management** — `stim add github/user/repo` to install shared commands
- **Standalone binary** — single compiled executable, no Node/npm runtime

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

Pick your platform from [GitHub Releases](https://github.com/wess/stim/releases):

```bash
# macOS Apple Silicon
curl -L https://github.com/wess/stim/releases/latest/download/stim-darwin-arm64 -o stim
chmod +x stim && sudo mv stim /usr/local/bin/

# macOS Intel
curl -L https://github.com/wess/stim/releases/latest/download/stim-darwin-x64 -o stim
chmod +x stim && sudo mv stim /usr/local/bin/

# Linux x64
curl -L https://github.com/wess/stim/releases/latest/download/stim-linux-x64 -o stim
chmod +x stim && sudo mv stim /usr/local/bin/
```

Windows: download `stim-windows-x64.exe` and add it to your `PATH`.

### Build from Source

Requires [Bun](https://bun.sh).

```bash
git clone https://github.com/wess/stim.git
cd stim
bun install
bun run build
./dist/stim version
```

## Your First Command

```stim
command greet {
  ask("What's your name?")
  wait_for_response()
  ask("Nice to meet you! How can I help today?")
}
```

Install it:

```bash
stim install greet.stim        # → ~/.claude/commands/greet.md
```

Use it in Claude Code: `/greet`.

## Your First Agent

```stim
agent security_reviewer {
  description "Reviews code for security vulnerabilities"
  tools [Read, Grep, Bash]
  model "sonnet"

  "You are a security engineer specializing in web application security."
  "When reviewing code, look for: SQL injection, XSS, auth bypasses, exposed secrets, unsafe deserialization."
  "Cite file paths and line numbers for every finding."
  "Prioritize findings: critical (exploit exists), high (likely exploitable), medium (defense-in-depth), low (style)."
}
```

Install it:

```bash
stim install security_reviewer.stim   # → ~/.claude/agents/security_reviewer.md
```

In Claude Code: `@security_reviewer` spawns the agent.

## Targeting Other Tools

The same source compiles to other tools — frontmatter, file layout, and unsupported fields are handled automatically.

```bash
stim install security_reviewer.stim --target cursor
# → .cursor/rules/security_reviewer.mdc
# (tools and model fields dropped with a warning — Cursor doesn't use them)

stim compile security_reviewer.stim --target chatgpt
# → dist/chatgpt/security_reviewer.md
# (plain markdown with # heading and > description — paste into a Custom GPT)
```

| Target | Output location | Frontmatter | Notes |
|--------|----------------|-------------|-------|
| `claude` | `~/.claude/{commands,agents}/` (or `.claude/…` with `--local`) | YAML with `name`, `description`, `tools`, `model` | Default. Full feature support. |
| `cursor` | `.cursor/rules/<name>.mdc` | YAML with `description`, `globs`, `alwaysApply` | `tools`/`model` warn-and-drop. Always project-scoped. |
| `chatgpt` | `dist/chatgpt/<name>.md` (or `./prompts/` with `--local`) | None (heading + quote block) | For copy-pasting into the OpenAI console. |

## Language Overview

### Commands

Commands are interactive workflows — they ask questions, branch on answers, spawn tasks.

```stim
command brainstorm {
  ask("What problem are you solving?")
  wait_for_response()

  done = false
  while (!done) {
    ask("What's the next critical question?")
    wait_for_response()
    if (confirm("Spec complete?")) {
      done = true
    }
  }

  create_file("SPEC.md", "generate_spec()")
}
```

### Agents

Agents are static personas with metadata. The body is prose — bare string literals on their own lines.

```stim
agent doc_writer {
  description "Writes clear technical documentation"
  tools [Read, Edit, Grep]

  "You write documentation for engineers, not marketing copy."
  "Lead with the shape — what the thing is and what it does — before mechanics."
  "Use concrete examples from the actual code, never hypothetical ones."
}
```

Metadata fields must come before prose. Fields a target doesn't understand are dropped with a warning.

### Variables

```stim
services = ["api", "web", "worker"]
env = "production"
dry_run = false
```

Used anywhere a value is expected:

```stim
for service in services {
  ask("Deploy " + service + " to " + env + "?")
}
```

### Control Flow

```stim
if (confirm("Ready?")) {
  ask("Proceeding")
} else {
  ask("Aborted")
}

for step in steps {
  if (step == "stop") { break }
  ask(step)
}

while (!done) {
  ask("Next requirement?")
  if (confirm("All captured?")) { done = true }
}
```

### Tasks

Spawn Claude Code subagents from within a command:

```stim
task explore "find API endpoints" {
  ask("List all route handlers in the codebase")
}

task bash "run tests" {
  ask("Execute the full test suite")
}

task("helpers/security.stim", explore)   // inline another .stim file
```

### Parallel Execution

```stim
parallel {
  task explore "analyze frontend" { ask("What patterns are used?") }
  task explore "analyze backend" { ask("What patterns are used?") }
  task bash "run checks" { ask("Run linter and type checker") }
}
```

Compiles to instructions telling Claude Code to spawn all three subagents concurrently.

## CLI Reference

```bash
stim compile <file.stim> [--target <name>]
stim install <file.stim> [--target <name>] [--local]
stim add <github/user/repo[/subpath][@tag]> [--target <name>] [--local]
stim remove <github/user/repo[/subpath]> [--target <name>] [--local]
stim update [github/user/repo[/subpath]] [--target <name>] [--local]
stim version
stim help

stim --lsp                    # start the Language Server on stdio
```

**Flags**

| Flag | Description |
|------|-------------|
| `--target <name>` | `claude`, `chatgpt`, or `cursor`. Default: `claude`. |
| `--local` | Install to the project directory instead of the user's home. |
| `--lsp` | Start the LSP server (for editor integrations). |

## Packages

Stim has a decentralized package system: any GitHub repo with a `stim.yaml` manifest is a package. Install with `stim add github/<user>/<repo>`.

**First-party packages** live in this repo under [`packages/`](packages/):

```bash
stim add github/wess/stim/packages/reviews   # security, quality, docs reviewer agents
stim add github/wess/stim/packages/gitflow   # commit, PR, changelog commands
stim add github/wess/stim/packages/planning  # spec, breakdown, scope commands
stim add github/wess/stim/packages/writing   # README, docstring, explainer agents
```

**Community packages** are curated in [`packages.md`](packages.md). Open a PR to add yours.

See [docs/api/packages.md](docs/api/packages.md) for the full package format, manifest schema, and publishing guide.

## Architecture

Four-stage pipeline. The parser and compiler are pure; all I/O is in the resolver and CLI.

```
.stim ─► parse ─► AST ─► resolve ─► AST (inlined) ─► target adapter ─► output
                                                          │
                                                          ├─► claude  (.md + YAML)
                                                          ├─► chatgpt (.md prose)
                                                          └─► cursor  (.mdc)
```

```
stim/
├── src/
│   ├── main.ts          # Entry point
│   ├── cli/             # Argument parsing, file I/O
│   ├── parser/          # .stim → AST
│   ├── resolve/         # Inline task("file.stim") + imports
│   ├── compiler/        # Target-agnostic prose emitter (shared)
│   ├── targets/         # One adapter per AI tool
│   │   ├── claude/
│   │   ├── chatgpt/
│   │   └── cursor/
│   ├── add/, update/    # Package manager commands
│   ├── registry/        # GitHub package fetching (supports subpaths)
│   └── types/           # AST type definitions (Declaration, Statement)
├── lsp/                 # Language Server Protocol implementation
├── packages/            # First-party packages (reviews, gitflow, planning, writing)
├── examples/            # Ready-to-use .stim files
├── engine/              # Meta-workflow stim files (annotated commands)
├── plugins/             # Editor integrations: VS Code, Neovim, Zed
├── docs/                # Documentation
└── tests/               # Test suite (bun:test)
```

Each target adapter is a 50-line module exposing `{ name, compile, destination, extension }`. Adding a new target (Windsurf, Gemini, anything) means writing one file.

## Documentation

- **[Quickstart](docs/Quickstart.md)** — five-minute walkthrough of commands + agents
- **[Tutorial](docs/Tutorial.md)** — step-by-step guide, starts from zero
- **[Syntax Reference](docs/Syntax-Reference.md)** — complete grammar and keywords
- **[API Reference](docs/API.md)** — every statement and function with compiled output
- **[Agents](docs/api/agents.md)** — agent declarator deep-dive
- **[Targets](docs/api/targets.md)** — what each target does, how to add a new one
- **[Packages](docs/api/packages.md)** — package format, publishing, discovery
- **[Package Registry](packages.md)** — curated list of installable packages
- **[Examples](docs/Examples.md)** — real-world patterns
- **[FAQ](docs/FAQ.md)** — common questions

## Examples

The `examples/` directory contains working commands and agents:

| File | Kind | What it does |
|------|------|--------------|
| [brainstorm.stim](examples/brainstorm.stim) | command | Interactive spec development |
| [commit.stim](examples/commit.stim) | command | Semantic commit workflow |
| [plan.stim](examples/plan.stim) | command | Project planning with phases |
| [session-summary.stim](examples/session-summary.stim) | command | Session analysis |
| [security-review.stim](examples/security-review.stim) | command | Security assessment |
| [recall.stim](examples/recall.stim) | command | Context management |
| [reviewer.stim](examples/reviewer.stim) | agent | Full-metadata code reviewer |
| [explainer.stim](examples/explainer.stim) | agent | Minimal-metadata code explainer |
| [refactorer.stim](examples/refactorer.stim) | agent | Behavior-preserving refactoring |

### Multi-Agent Deep Review

```stim
command deep_review {
  ask("What code should I review?")
  wait_for_response()

  parallel {
    task explore "security scan" {
      ask("Check for SQL injection, XSS, auth flaws, exposed secrets")
    }
    task explore "performance audit" {
      ask("Find N+1 queries, unnecessary allocations, blocking I/O")
    }
    task explore "architecture review" {
      ask("Evaluate separation of concerns and dependency management")
    }
  }

  ask("Compile all findings into a single report")
  create_file("REVIEW.md", "review_report")
}
```

## Development

```bash
bun install
bun run dev                    # run without building
bun run dev -- compile f.stim  # dev-mode subcommand
bun run build                  # single binary → dist/stim
bun run build:all              # cross-platform binaries
bun test                       # full test suite
bun test tests/agent.test.ts   # one file
bun test -t "parses tools"     # tests matching a name
```

## Editor Support

| Editor | Features |
|--------|----------|
| **VS Code** (`plugins/vscode/`) | Syntax highlighting, snippets, compile commands, real-time diagnostics |
| **Neovim** (`plugins/neovim/`) | Syntax highlighting, text objects, templates, quickfix integration |
| **Zed** (`plugins/zed/`) | Tree-sitter grammar, smart indentation, bracket matching |

All three editors talk to the same LSP server (`stim --lsp`).

## Contributing

See [docs/Contributing.md](docs/Contributing.md) for setup, code style, and PR guidelines.

```bash
git clone https://github.com/wess/stim.git
cd stim
bun install
bun test
```

Adding a new target is a good first contribution — see [docs/api/targets.md](docs/api/targets.md) for the adapter interface.

## License

MIT — see [LICENSE](LICENSE).
