# Commands

A Stim file contains exactly one top-level declaration — either a `command` or an [`agent`](agents.md). A `command` is the interactive form: the user invokes it (as `/name` in Claude Code), it asks questions, branches on answers, spawns tasks.

## Syntax

```stim
command name {
  // command body
}
```

Every `.stim` file must start with a `command` declaration (after any [imports](imports.md) or [annotations](annotations.md)), or with an [`agent`](agents.md) declaration if you're writing a persona instead.

## Command Names

Command names become slash commands in Claude Code.

**Valid identifiers:**
- Letters: `a-z`, `A-Z`
- Digits: `0-9` (not as first character)
- Underscore: `_`

**Valid examples:**
```stim
command hello { }
command deploy_app { }
command buildProject { }
command check2 { }
```

**Invalid examples:**
```stim
command 123invalid { }    // Error: starts with digit
command my-app { }        // Error: hyphen not allowed
command my app { }        // Error: space not allowed
```

## Command Body

The command body contains zero or more statements. See [Control Flow](controlflow.md), [Functions](functions.md), and [Tasks](tasks.md) for statement types.

**Minimal command:**
```stim
command empty { }
```

**Command with statements:**
```stim
command example {
  ask("What is your name?")
  confirm("Should I proceed?")
  create_file("output.txt", "Hello, world!")
}
```

## Compiled Output

A command compiles to a formatted instruction sequence for Claude Code.

**Input:**
```stim
command deploy {
  ask("Which environment?")
}
```

**Output:**
```
Ask the user: "Which environment?"
```

## One Declaration Per File

Each `.stim` file must contain exactly one top-level declaration (command or agent). To reference other `.stim` files, use [file reference tasks](tasks.md#file-reference-task) or [imports](imports.md).

```stim
// valid: one command
command main {
  task("helpers/setup.stim")
}
```

## See Also

- [Agents](agents.md) — The other kind of declaration, for static personas
- [Variables](variables.md) — Declare variables in command body
- [Imports](imports.md) — Import shared variables before the declaration
- [Annotations](annotations.md) — Add workflow annotations after the command keyword
- [Tasks](tasks.md) — Spawn subagent tasks from a command
