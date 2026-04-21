# Stim API Reference

Complete technical reference for Stim syntax, functions, and features. Each page covers a specific aspect of the Stim language with precise syntax, compiled output examples, and error cases.

## Declarations

- **[Commands](commands.md)** — Command declaration syntax, naming rules, one declaration per file
- **[Agents](agents.md)** — Agent declaration, metadata fields, prose, compiled output per target

## Core Language

- **[Variables](variables.md)** — Declaration, types (strings, booleans, arrays), scoping, usage
- **[Control Flow](controlflow.md)** — Conditionals (if/else), loops (for/while), break statements
- **[Operators](operators.md)** — Concatenation, equality, logical operators, precedence

## Functions and I/O

- **[Functions](functions.md)** — Built-in functions for user interaction and file operations
  - `ask()`, `confirm()`, `wait_for_response()`
  - `create_file()`
  - Custom function calls (passthrough)

## Tasks and Execution

- **[Tasks](tasks.md)** — Inline task syntax, agent types, file references, task descriptions
- **[Parallel](parallel.md)** — Parallel task execution, rules, compiled output

## Advanced Features

- **[Imports](imports.md)** — Import variable definitions from other `.stim` files, resolution, nested imports
- **[Annotations](annotations.md)** — Workflow annotations for topology, memory, error handling
- **[Targets](targets.md)** — Compiling for Claude, ChatGPT, Cursor; adding a new target
- **[Packages](packages.md)** — Package format, manifest, publishing, discovery via packages.md

## Command Line

- **[CLI](cli.md)** — Compile, install, `--target` flag, add/remove packages, version info, engine installation

## Troubleshooting

- **[Errors](errors.md)** — Parse errors, import errors, task errors, CLI errors with solutions

---

## Quick Links

- [Tutorials](../tutorial/) — Learn Stim step-by-step
- [Examples](../Examples.md) — Real-world command examples
- [FAQ](../FAQ.md) — Common questions and troubleshooting
