# Chapter 9 — Writing Agents

> **Previous:** [Imports and Reusability](imports.md)
> **Next:** [Targets](targets.md)

Until now, everything we've built has been a `command` — an interactive workflow the user invokes with `/name`. This chapter introduces the other kind of declaration: the `agent`.

An agent is a static persona. It has a description, optional metadata (tools it can use, preferred model), and a body of prose — the system prompt that defines who the agent is and how it behaves. You invoke it with `@name` (in Claude Code), not `/name`.

By the end of this chapter you'll know when to reach for an agent, how to structure one cleanly, and how its body differs from a command's.

## Why Agents Exist

Some work is *procedural*. "Ask the user what to deploy, confirm, run these three commands in order." That's a command — a script with branches.

Other work is *dispositional*. "You are a senior code reviewer. When reviewing code, cite file paths. Prioritize by severity." That's a persona — a role the AI tool plays whenever it's invoked. No branches, no asking — just a set of instructions for *how to be*.

You could cram a persona into a command, but it fights the grain. Commands compile to imperative prose ("Ask the user..."). Personas need declarative prose ("You are..."). Different shape, different declarator.

## Your First Agent

```stim
agent explainer {
  description "Explains code clearly to engineers learning the codebase"

  "You explain code without being condescending."
  "Assume the reader is a competent engineer new to this codebase."
  "Start with the shape — what the thing is — before mechanics."
  "Use concrete examples from the actual code, never hypothetical ones."
}
```

Three things to notice:

1. The declarator is `agent`, not `command`.
2. `description` is a first-class metadata field — it's not an assignment.
3. Bare string literals on their own line become **prose**. Each one becomes a paragraph in the output.

Install it:

```bash
stim install explainer.stim
# → ~/.claude/agents/explainer.md
```

In Claude Code: `@explainer` invokes it.

## Metadata Fields

Agents support three metadata fields. All three are optional, but including at least a `description` is strongly recommended — it's how the tool knows what the agent is for.

### description

A one-line summary.

```stim
agent reviewer {
  description "Reviews pull requests for security and correctness"
  "..."
}
```

### tools

An array of tool names the agent is allowed to use. Claude Code interprets these.

```stim
agent reviewer {
  description "..."
  tools [Read, Grep, Glob, Bash]
  "..."
}
```

Tool names are emitted verbatim. Arrays can be empty (`tools []`).

### model

Preferred model name (`opus`, `sonnet`, `haiku`).

```stim
agent reviewer {
  description "..."
  model "sonnet"
  "..."
}
```

### Putting it together

```stim
agent reviewer {
  description "Reviews PRs for security and correctness"
  tools [Read, Grep, Glob, Bash]
  model "sonnet"

  "You are a senior code reviewer with deep expertise in security."
  "When reviewing code, check for SQL injection, XSS, auth bypasses, exposed secrets."
  "Cite file paths and line numbers for every finding."
  "Prioritize findings: critical, high, medium, low."
}
```

Metadata fields must all come before prose. This is a parse error:

```stim
agent bad {
  "prose first"
  description "too late"   // ERROR
}
```

## Prose in Depth

Prose statements are the agent's system prompt — the instructions that govern how it behaves. One quoted line, one paragraph.

```stim
"Paragraph one."
"Paragraph two."
"Paragraph three."
```

Compiles to:

```
Paragraph one.

Paragraph two.

Paragraph three.
```

Inside prose you can use anything a Stim string literal supports, including concatenation:

```stim
agent x {
  description "..."
  team_name = "Platform"
  "You work on the " + team_name + " team."
}
```

### Prose Inside Control Flow

Unlike commands, agents mostly don't use control flow — but when you want conditional personas, you can:

```stim
agent adaptive {
  description "Adjusts explanation depth based on context"

  "You are a technical writer."

  if (audience_is_expert) {
    "Use precise technical language. Assume background knowledge."
  } else {
    "Use plain language. Define technical terms the first time they appear."
  }
}
```

This is a power move — use it sparingly. Most agents should be one pure block of prose.

## Command vs Agent: A Decision Table

| Question | Command | Agent |
|----------|---------|-------|
| Who invokes it? | The user (`/name`) | The AI tool (`@name`) |
| Is it interactive? | Yes — asks, branches | No — static |
| What's the output? | A sequence of actions | A system prompt |
| Does it use tasks/parallel? | Often | Rarely |
| Does it have metadata? | No | Usually |

Some workflows use both: a command that orchestrates, which spawns tasks which rely on agent definitions installed separately.

## A Real Example

Let's build an agent you'd actually use — a refactoring specialist.

```stim
agent refactorer {
  description "Refactors code while preserving behavior"
  tools [Read, Edit, Grep, Glob, Bash]
  model "sonnet"

  "You are a refactoring specialist. Your job is to improve code structure without changing what it does."
  "Before making any change, read enough surrounding context to understand why the code is the way it is."
  "Never refactor and add features in the same pass. Refactors must be behavior-preserving."
  "If tests exist, run them before and after. If they don't, ask whether to add them before refactoring."
  "Prefer small, reviewable diffs over sweeping rewrites. One concept per change."
  "When a pattern appears three times, extract it. Twice is not enough — premature abstraction is worse than duplication."
}
```

Install and invoke:

```bash
stim install refactorer.stim
# In Claude Code: @refactorer find a 3x-duplicated pattern in src/ and refactor it
```

The metadata tells Claude Code which tools the agent can reach for. The prose defines how it behaves. That separation is the whole point of the declarator.

## Cross-Target Behavior

A quick preview of the next chapter: this same agent file compiles for other tools.

```bash
stim install refactorer.stim --target cursor
# → .cursor/rules/refactorer.mdc
# `tools` and `model` are dropped with a warning — Cursor doesn't use them.
```

The prose is fully portable. Only Claude-specific metadata gets dropped.

## Exercises

1. **Minimum viable agent.** Write an agent with just a `description` and two prose lines. Compile it. Does it work?

2. **Conditional persona.** Write an agent that switches between "beginner-friendly" and "expert" tone based on a boolean variable. (Bonus: use an [import](imports.md) to set the boolean.)

3. **Convert a command.** Find one of the commands in `examples/` that's more about "how to be" than "what to do" and convert it to an agent. What changed? What stayed the same?

## What You Learned

- `agent` is the second declarator in Stim, alongside `command`.
- Agents have structured metadata: `description`, `tools`, `model`.
- Metadata must come before prose.
- Prose statements — bare string literals on a line — are the agent's system prompt.
- Use `command` for procedural work, `agent` for personas.

Next chapter: [Targets](targets.md). Your `.stim` file isn't locked to Claude Code — we'll see how the same source compiles for ChatGPT and Cursor, and what stays the same across tools.
