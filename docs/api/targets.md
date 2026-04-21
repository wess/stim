# Targets

A **target** is the AI tool a `.stim` file compiles for. Stim ships with three: `claude`, `chatgpt`, and `cursor`. Pick one with `--target <name>` on `compile` or `install`. The default is `claude`.

```bash
stim compile reviewer.stim                    # claude (default)
stim compile reviewer.stim --target chatgpt   # explicit
stim install reviewer.stim --target cursor    # install for Cursor
```

## The Adapter Model

A target is an adapter — a small module that converts the shared AST into output for one AI tool. Each adapter owns three things:

1. **Compile** — how a `command` or `agent` AST becomes output text (frontmatter format, heading style, prose emission).
2. **Destination** — where `stim install` writes the file (tool-native conventions like `.claude/agents/` or `.cursor/rules/`).
3. **Extension** — the output file extension (`.md`, `.mdc`, etc.).

Adapters also decide what to do with fields they don't understand. The current policy is **warn-and-drop**: if a target doesn't support a metadata field (say, Cursor and `tools`), it logs a warning and emits without it. This keeps `.stim` source portable.

## Target Comparison

| | `claude` | `chatgpt` | `cursor` |
|---|---|---|---|
| **Default** | ✓ | | |
| **Extension** | `.md` | `.md` | `.mdc` |
| **Command output** | Prose instructions | `# name` + prose | YAML frontmatter + prose |
| **Agent output** | YAML frontmatter + prose | `# name` + `> description` + prose | YAML frontmatter + prose |
| **Install location (global)** | `~/.claude/commands/` or `~/.claude/agents/` | `./dist/chatgpt/` | N/A |
| **Install location (`--local`)** | `.claude/commands/` or `.claude/agents/` | `./prompts/` | `.cursor/rules/` |
| **Supports `tools`** | ✓ | drops (warn) | drops (warn) |
| **Supports `model`** | ✓ | drops (warn) | drops (warn) |
| **Engine-mode annotations** | ✓ | drops | drops |

## The `claude` Target

The default. Full feature support.

### Commands

```stim
command hello {
  ask("What's your name?")
  wait_for_response()
}
```

Compiles to `~/.claude/commands/hello.md`:

```markdown
Ask the user the question from variable: What's your name?

Wait for user response before continuing.
```

With [annotations](annotations.md), the output is prefixed with an `[annotations]` block — the Claude engine uses this at runtime to apply topology/memory/error-handling semantics.

### Agents

```stim
agent reviewer {
  description "Reviews PRs"
  tools [Read, Grep]
  model "sonnet"

  "You are a code reviewer."
}
```

Compiles to `~/.claude/agents/reviewer.md`:

```markdown
---
name: reviewer
description: Reviews PRs
tools: [Read, Grep]
model: sonnet
---

You are a code reviewer.
```

In Claude Code: `@reviewer` invokes the agent; `/hello` invokes the command.

### Destination Rules

| Invocation | Path |
|------------|------|
| `stim install foo.stim` (command) | `~/.claude/commands/foo.md` |
| `stim install foo.stim` (agent) | `~/.claude/agents/foo.md` |
| `stim install foo.stim --local` (command) | `./.claude/commands/foo.md` |
| `stim install foo.stim --local` (agent) | `./.claude/agents/foo.md` |
| `stim compile foo.stim` | `./dist/claude/foo.md` |

## The `cursor` Target

Writes [Cursor rules](https://docs.cursor.com/context/rules-for-ai) in `.mdc` format.

### Compilation

```stim
agent reviewer {
  description "Reviews PRs"
  tools [Read, Grep]     // dropped with warning
  model "sonnet"          // dropped with warning

  "You are a code reviewer."
}
```

Compiles to `.cursor/rules/reviewer.mdc`:

```markdown
---
description: Reviews PRs
globs:
alwaysApply: false
---

You are a code reviewer.
```

`globs:` and `alwaysApply: false` are emitted as stubs — edit them to match how you want Cursor to apply the rule. If `description` is omitted, the agent's name is used as a fallback.

### Destination Rules

Cursor rules are always project-scoped, so `--local` is a no-op for this target.

| Invocation | Path |
|------------|------|
| `stim install foo.stim --target cursor` | `./.cursor/rules/foo.mdc` |
| `stim install foo.stim --target cursor --local` | `./.cursor/rules/foo.mdc` (same) |
| `stim compile foo.stim --target cursor` | `./dist/cursor/foo.mdc` |

### Limitations

- `tools` and `model` are dropped with a warning (Cursor doesn't use them).
- [Annotations](annotations.md) like `@topology` are silently ignored — the Claude engine that interprets them doesn't exist in Cursor.
- Commands compile the same way as agents (YAML frontmatter + prose), since Cursor has no "slash command" concept.

## The `chatgpt` Target

Writes plain markdown with no filesystem convention. ChatGPT Custom GPTs are configured via the web UI, so the output is meant to be copy-pasted into the Instructions field.

### Compilation

```stim
agent reviewer {
  description "Reviews PRs"
  tools [Read, Grep]     // dropped
  model "sonnet"          // dropped

  "You are a code reviewer."
}
```

Compiles to `./dist/chatgpt/reviewer.md`:

```markdown
# reviewer

> Reviews PRs

You are a code reviewer.
```

No frontmatter, no metadata. The heading and quote block give you a visual header when the file is viewed in a reader; paste everything below the `>` line into the OpenAI console.

### Destination Rules

| Invocation | Path |
|------------|------|
| `stim install foo.stim --target chatgpt` | `./dist/chatgpt/foo.md` |
| `stim install foo.stim --target chatgpt --local` | `./prompts/foo.md` |
| `stim compile foo.stim --target chatgpt` | `./dist/chatgpt/foo.md` |

`install` and `compile` write to the same place by default — there's no OS-native install location for ChatGPT. Use `--local` if you want the file in a project-relative `./prompts/` directory.

### Limitations

- `tools` and `model` are dropped with a warning.
- Annotations are ignored.
- No distinction between `command` and `agent` beyond whether a `description` is emitted as a `> ...` line.

## Warn-and-Drop Policy

When a target can't honor a field, it logs a warning and continues. The goal is to keep `.stim` source portable across targets without forcing every file to be the lowest common denominator.

```
$ stim compile reviewer.stim --target cursor
warning: cursor target does not support agent field(s) "tools", "model"; ignoring
✓ Compiled reviewer.stim → /…/dist/cursor/reviewer.mdc (cursor)
```

This is the current default. If you want stricter behavior (fail the compile instead of warning), file an issue — a `--strict` flag is scaffolded but not yet exposed.

## Compile vs Install

| Command | Where the file lands |
|---------|---------------------|
| `stim compile <file> --target <t>` | `./dist/<target>/<name>.<ext>` — always |
| `stim install <file> --target <t>` | The target's native install location (see tables above) |

Use `compile` when you want to inspect the output before deploying it. Use `install` to put it where the AI tool will pick it up.

## Adding a New Target

Every target is a module under `src/targets/<name>/index.ts` that exports a single `Target` object:

```ts
import type { Declaration } from '../../types/index.js'
import type { Target, CompileOptions, InstallOptions, InstallPath } from '../index.js'
import { compileBody } from '../../compiler/index.js'

const compile = (decl: Declaration, _opts?: CompileOptions): string => {
  // emit frontmatter + body however the target expects
  return '...'
}

const destination = (decl: Declaration, opts: InstallOptions): InstallPath => {
  return { path: '/absolute/path/to/file.ext', scope: 'global' | 'local' | 'project' }
}

export const windsurf: Target = {
  name: 'windsurf',
  compile,
  destination,
  extension: '.md',
}
```

Then register it in `src/targets/index.ts`:

```ts
import { windsurf } from './windsurf/index.js'

const targets: Record<string, Target> = {
  claude,
  chatgpt,
  cursor,
  windsurf,   // ← add
}
```

Reuse `compileBody(decl.body, options)` from `src/compiler/index.js` to emit the target-agnostic statement prose. Call `warnDropped(targetName, kind, fieldList)` to report any metadata the new target can't honor.

See [Contributing](../Contributing.md) for test requirements and PR guidelines.

## See Also

- [Agents](agents.md) — the `agent` declarator and metadata fields
- [Commands](commands.md) — the `command` declarator
- [CLI](cli.md) — complete flag reference for `stim compile` and `stim install`
