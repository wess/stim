# Agents

Agents are static personas compiled from `.stim` source. Unlike [commands](commands.md), which are interactive workflows invoked by the user, agents are system prompts with structured metadata (description, tools, model) and a body of prose.

## Syntax

```stim
agent name {
  description "..."     // optional, but recommended
  tools [A, B, C]       // optional
  model "..."           // optional

  "Prose line one."
  "Prose line two."
}
```

The same naming rules apply as for [commands](commands.md#command-names): letters, numbers, and underscores; no leading digit.

## Metadata Fields

Metadata fields describe the agent to its host tool. They must appear **before** any prose or other statements — the same ordering rule as [annotations](annotations.md).

### `description`

A one-line summary of what the agent does. Used by tools to show the agent in a picker or invoke it by context.

```stim
agent reviewer {
  description "Reviews pull requests for security and correctness"
  "..."
}
```

String literal. Double or single quotes both work.

### `tools`

An array of tool names the agent is allowed to call. Claude Code understands tools like `Read`, `Write`, `Edit`, `Grep`, `Glob`, `Bash`, `WebFetch`.

```stim
agent reviewer {
  tools [Read, Grep, Glob, Bash]
  "..."
}
```

Tool names are emitted verbatim — quote them only if the target requires it. Arrays may be empty (`tools []`).

### `model`

The preferred model for the agent. Typical values: `opus`, `sonnet`, `haiku`.

```stim
agent reviewer {
  model "sonnet"
  "..."
}
```

String literal.

## Prose

Bare string literals on their own line become prose statements — they compile to the agent's system prompt verbatim.

```stim
agent explainer {
  description "Explains code clearly"

  "You explain code without being condescending."
  "Start with the shape — what the thing is — before mechanics."
  "Use concrete examples from the actual file."
}
```

Each quoted line becomes one prose statement. Statements compile to output paragraphs joined with blank lines.

Prose can appear anywhere inside the body after metadata, and can be interleaved with control flow:

```stim
agent adaptive {
  description "Adjusts tone based on user"

  "You are a technical writer."

  if (audience == "expert") {
    "Use dense, precise language. Assume background knowledge."
  } else {
    "Use plain language. Define terms the first time you use them."
  }
}
```

## Ordering Rules

Agent body content must appear in this order:

1. **Metadata** (`description`, `tools`, `model`) — at most one of each
2. **Everything else** (prose, control flow, function calls)

Violations produce parse errors:

```stim
agent bad {
  "prose first"
  description "too late"   // Error: Metadata fields must appear before other statements
}
```

```stim
agent bad {
  description "a"
  description "b"          // Error: Duplicate metadata field: description
}
```

Metadata fields are only valid inside `agent` declarations — they're rejected inside `command`:

```stim
command bad {
  description "nope"       // Error: only allowed in agent declarations
}
```

## Compiled Output

### Claude target

The claude adapter emits YAML frontmatter with every metadata field, followed by prose joined by blank lines.

**Input:**
```stim
agent reviewer {
  description "Reviews PRs for security issues"
  tools [Read, Grep, Bash]
  model "sonnet"

  "You are a security engineer."
  "Cite file paths and line numbers."
}
```

**Output (`~/.claude/agents/reviewer.md`):**
```markdown
---
name: reviewer
description: Reviews PRs for security issues
tools: [Read, Grep, Bash]
model: sonnet
---

You are a security engineer.

Cite file paths and line numbers.
```

In Claude Code: `@reviewer` invokes the agent.

### Cursor target

The cursor adapter emits Cursor's `.mdc` frontmatter. `tools` and `model` are warn-and-dropped because Cursor rules don't use them.

**Output (`.cursor/rules/reviewer.mdc`):**
```markdown
---
description: Reviews PRs for security issues
globs:
alwaysApply: false
---

You are a security engineer.

Cite file paths and line numbers.
```

```
warning: cursor target does not support agent field(s) "tools", "model"; ignoring
```

Edit `globs:` manually if you want the rule auto-applied to specific paths, or set `alwaysApply: true` for global rules.

### ChatGPT target

The chatgpt adapter emits plain markdown — no frontmatter, no file convention. Paste the output into a Custom GPT's Instructions field.

**Output (`dist/chatgpt/reviewer.md`):**
```markdown
# reviewer

> Reviews PRs for security issues

You are a security engineer.

Cite file paths and line numbers.
```

```
warning: chatgpt target does not support agent field(s) "tools", "model"; ignoring
```

## Using Imports in Agents

Agents can import shared variables from other `.stim` files, then reference them in prose via `ask()`:

```stim
// persona.stim
engineer_intro = "You are a senior engineer with 10 years of experience."
```

```stim
// reviewer.stim
import "persona.stim"

agent reviewer {
  description "Reviews code"
  ask(engineer_intro)
  "Review the provided code for issues."
}
```

See [imports.md](imports.md) for the full import resolution semantics.

## Choosing Between Command and Agent

| Use a `command` when... | Use an `agent` when... |
|-------------------------|------------------------|
| The user invokes it (`/deploy`) | Claude invokes it autonomously (`@reviewer`) |
| Interactive — asks questions, branches | Static persona with a fixed role |
| Orchestrates other tasks | Is itself one of the things orchestrated |
| The output is a sequence of actions | The output is a system prompt |

Some workflows use both: a command that spawns tasks which use agent definitions.

## See Also

- [Commands](commands.md) — interactive workflows
- [Targets](targets.md) — how agents compile for each AI tool
- [Annotations](annotations.md) — similar ordering rules for workflow annotations
- [Imports](imports.md) — sharing persona fragments across agents
