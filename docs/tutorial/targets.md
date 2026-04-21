# Chapter 10 — Targets

> **Previous:** [Writing Agents](agents.md)
> **Next:** [The Stim Engine](engine.md)

Every example so far has quietly assumed one destination: Claude Code. That was fine when Stim only compiled for Claude. But prompts-as-code isn't a Claude-specific idea — ChatGPT has Custom GPTs, Cursor has rules, Windsurf has workflows, and the list will keep growing.

Stim handles this with **targets**. A target is an adapter that turns the same `.stim` AST into output for a specific AI tool. You pick one at compile or install time with `--target <name>`. The default is `claude`.

By the end of this chapter you'll understand what each target does, what stays portable across targets, and when to reach for the flag.

## The Three Built-In Targets

```bash
stim compile reviewer.stim                    # claude (default)
stim compile reviewer.stim --target cursor
stim compile reviewer.stim --target chatgpt
```

Let's see what each does with the same source. Here's our starting point:

```stim
agent reviewer {
  description "Reviews code for security and correctness"
  tools [Read, Grep, Bash]
  model "sonnet"

  "You are a code reviewer."
  "Cite file paths and line numbers."
}
```

## Target: claude

The default. Full feature support.

**Output** (`dist/claude/reviewer.md`):

```markdown
---
name: reviewer
description: Reviews code for security and correctness
tools: [Read, Grep, Bash]
model: sonnet
---

You are a code reviewer.

Cite file paths and line numbers.
```

Everything shows up. `tools` and `model` are part of Claude Code's agent format, so they go in the frontmatter. Install location:

| Flag | Path |
|------|------|
| `install` | `~/.claude/agents/reviewer.md` |
| `install --local` | `./.claude/agents/reviewer.md` |

## Target: cursor

```bash
stim compile reviewer.stim --target cursor
```

**Output** (`dist/cursor/reviewer.mdc`):

```markdown
---
description: Reviews code for security and correctness
globs:
alwaysApply: false
---

You are a code reviewer.

Cite file paths and line numbers.
```

And a warning:

```
warning: cursor target does not support agent field(s) "tools", "model"; ignoring
```

Cursor rules don't have a concept of allowed tools or preferred model — those are Claude-specific. The adapter drops them and emits Cursor's native frontmatter (`description`, `globs`, `alwaysApply`) instead.

`globs:` is empty and `alwaysApply: false` is the safe default. If you want the rule auto-applied to certain files, edit those after compilation. Cursor rules are always project-scoped, so `install` and `install --local` go to the same place:

| Flag | Path |
|------|------|
| `install` or `install --local` | `./.cursor/rules/reviewer.mdc` |

## Target: chatgpt

```bash
stim compile reviewer.stim --target chatgpt
```

**Output** (`dist/chatgpt/reviewer.md`):

```markdown
# reviewer

> Reviews code for security and correctness

You are a code reviewer.

Cite file paths and line numbers.
```

ChatGPT Custom GPTs are configured via the OpenAI web UI — there's no filesystem convention to install into. The chatgpt target emits plain markdown that you paste into the Custom GPT's *Instructions* field. `tools` and `model` are dropped (same warning as Cursor).

| Flag | Path |
|------|------|
| `install` | `./dist/chatgpt/reviewer.md` |
| `install --local` | `./prompts/reviewer.md` |

## What's Portable, What's Not

Think of your `.stim` file in two layers.

**The portable layer** — what every target emits identically:
- Prose statements (your agent's system prompt)
- `description` — shows up as frontmatter in Claude/Cursor, as a `> ...` line in ChatGPT
- Control flow (`if`, `for`, `while`) — compiled statements look the same regardless of target
- Variables and imports — resolved at compile time before the target ever sees them

**The target-specific layer** — may be dropped, transformed, or emitted differently:
- `tools` — only Claude
- `model` — only Claude
- Annotations (`@topology`, `@memory`) — only Claude's engine understands them
- Commands vs agents — Claude distinguishes `/name` vs `@name`; other targets don't

The rule of thumb: if a field describes *how to be*, it's portable. If it describes *how the host runs the agent*, it's probably target-specific.

## Warn-and-Drop

When a target can't honor a field, the compiler logs a warning and continues. This is deliberate: your source stays portable without you having to lowest-common-denominator every file.

```
$ stim compile reviewer.stim --target cursor
warning: cursor target does not support agent field(s) "tools", "model"; ignoring
✓ Compiled reviewer.stim → /…/dist/cursor/reviewer.mdc (cursor)
```

If you'd rather compile-fail on dropped fields, that's a future `--strict` flag (not wired yet at time of writing).

## Multi-Target Workflows

Some `.stim` files only make sense for one tool. That's fine — just target that one. Others are genuinely portable and deserve to live in every tool you use.

A common pattern is a build script that fans out:

```bash
stim compile reviewer.stim                    # → dist/claude/reviewer.md
stim compile reviewer.stim --target chatgpt   # → dist/chatgpt/reviewer.md
stim compile reviewer.stim --target cursor    # → dist/cursor/reviewer.mdc
```

Or for install — per-tool:

```bash
# I use Claude Code for agents
stim install reviewer.stim

# I also use Cursor on this project
stim install reviewer.stim --target cursor
```

Because the per-target output is namespaced under `dist/<target>/`, the three outputs never collide. You can `git` any of them, paste any into a tool, or move them around without them stepping on each other.

## When to Use Which Target

| Situation | Target |
|-----------|--------|
| You're writing a slash command or agent for Claude Code | `claude` |
| You're writing a rule file for a Cursor-using project | `cursor` |
| You're building a Custom GPT in the OpenAI console | `chatgpt` |
| You want a generic prompt file to paste anywhere | `chatgpt` (simplest output) |
| You're testing portability | all three, compare the output |

Don't overthink this. Pick the target that matches where your prompt will run. If your use case spans two tools, compile twice.

## Exercises

1. **Triple-compile a sample.** Take one of the agents in `examples/` and run it through all three targets. Diff the outputs. Where do they differ? Where are they the same?

2. **Add a target-specific field.** Modify one of the examples to include both `tools` and `description`. Compile for `claude` and `cursor`. What's in each output?

3. **Build a deploy script.** Write a shell script that takes an agent name, compiles it for all three targets, and prints the output paths.

## What You Learned

- A target is an adapter from the shared AST to a specific AI tool's format.
- `--target <name>` picks one; default is `claude`.
- Each target has its own compile output, destination rules, and extension.
- Target-specific fields (`tools`, `model`, annotations) are warn-and-dropped where they don't apply.
- `stim compile` writes to `dist/<target>/<name>.<ext>` so multi-target builds never collide.

Next chapter: [The Stim Engine](engine.md). We'll dig into annotations — how to turn a command into a production workflow with topology, shared memory, and error handling.
