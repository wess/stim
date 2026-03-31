# Commands

A Stim file contains exactly one command declaration that defines a Claude Code command.

## Syntax

```stim
command name {
  // command body
}
```

Every `.stim` file must start with a `command` declaration (after any [imports](imports.md) or [annotations](annotations.md)).

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

## One Command Per File

Each `.stim` file must contain exactly one command. To reference other `.stim` files, use [file reference tasks](tasks.md#file-reference-task).

```stim
// valid: one command
command main {
  task("helpers/setup.stim")
}
```

```stim
// invalid: two commands
command first { }
command second { }
// Error: Multiple commands not allowed
```

## See Also

- [Variables](variables.md) — Declare variables in command body
- [Imports](imports.md) — Import shared variables before command
- [Annotations](annotations.md) — Add workflow annotations after command keyword
- [Tasks](tasks.md) — Spawn subagent tasks from command
