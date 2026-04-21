# The Stim Tutorial

Welcome to Stim. Over the next thirteen chapters, you'll learn to build sophisticated AI prompts — commands, agents, and rules — using a clean, readable syntax that compiles for multiple AI tools, plus how to share your work as packages. Whether you're brand new to programming or an experienced developer, this tutorial will guide you through everything from your first command to multi-agent orchestration.

By the end, you'll understand how to write complex automation that would be impossible to maintain by hand, and you'll have the confidence to build your own workflows.

## What You'll Learn

1. **[Introduction](introduction.md)** — What Stim is, why it exists, and who it's for. No installation yet, just context.

2. **[Getting Started](gettingstarted.md)** — Installation, your absolute first command, compilation, and running in Claude Code.

3. **[Variables and Data Types](variables.md)** — Strings, booleans, arrays, and scope. Build your first real workflow using variables.

4. **[Control Flow](controlflow.md)** — if/else, for loops, while loops, and break statements. Make your commands intelligent.

5. **[Functions](functions.md)** — ask(), confirm(), wait_for_response(), create_file(), and more. Interact with the user and the filesystem.

6. **[Tasks and Subagents](tasks.md)** — Spawn autonomous subagents (bash, explore, plan, general). Delegate work to other Claude instances.

7. **[Parallel Execution](parallel.md)** — Run multiple tasks concurrently. Speed up complex workflows.

8. **[Imports and Reusability](imports.md)** — Import system, shared libraries, and file references. Build modular, maintainable commands.

9. **[Writing Agents](agents.md)** — Declare agents with metadata and prose. Understand when to use an agent versus a command.

10. **[Targets](targets.md)** — Compile for Claude Code, ChatGPT, or Cursor. Understand what changes across tools and what stays the same.

11. **[Packages](packages.md)** — Install third-party packages, publish your own, organize monorepo packages.

12. **[The Stim Engine](engine.md)** — Annotations, topologies, memory management, and orchestration. Advanced concepts for production workflows.

13. **[Best Practices](bestpractices.md)** — Patterns, tips, common pitfalls, and real-world advice from the community.

## How to Use This Tutorial

Each chapter builds on the previous one. Start with Chapter 1 even if you know the basics. Code examples are tested and real. If something doesn't work, it's a bug in Stim, not in the tutorial.

We use a progressive learning approach: earlier chapters are simpler, later chapters are more advanced. You'll see:

- **Inline code examples** that show exactly what to type
- **Compiled output** so you understand what Stim generates
- **Hands-on exercises** with solutions
- **Callout boxes** for important notes and warnings

## Prerequisites

You need:
- A terminal (bash, zsh, or Windows PowerShell)
- Claude Code (download from claude.ai)
- A text editor (VS Code, Zed, Neovim, or anything)
- Basic familiarity with running commands in a terminal

You do NOT need prior programming experience. Stim is designed for humans.

## Who This Is For

This tutorial is for:
- Developers who use Claude Code and want to automate complex workflows
- Teams that need reproducible, version-controlled commands
- Anyone building multi-step automation that's too complex for markdown
- People learning to program (start with Chapter 1 and go slow)

If you write prompts manually in Claude Code more than once, Stim is for you.

## A Quick Note on Philosophy

Stim exists because hand-written markdown commands break. Loop instructions become unreadable. Copy-paste logic is error-prone. Stim brings software engineering principles to prompt engineering: variables instead of repetition, control flow instead of instructions, functions instead of boilerplate.

But Stim is not a general-purpose programming language. It's specifically designed for Claude Code workflows. Every feature exists because it solves a real problem in prompt automation.

## Getting Help

Stuck on something? Check these resources:

- **[Syntax Reference](../Syntax-Reference.md)** — Complete grammar and keyword reference
- **[API Reference](../API.md)** — Every statement type and function with examples
- **[Examples](../Examples.md)** — Real-world commands you can run and learn from
- **[FAQ](../FAQ.md)** — Common questions and troubleshooting
- **[Contributing](../Contributing.md)** — How to report bugs and contribute improvements

## Let's Get Started

Ready? Head to **[Chapter 1: Introduction](introduction.md)** and let's go.
