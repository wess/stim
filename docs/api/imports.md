# Imports

Imports allow reusing variable definitions across multiple `.stim` files.

## Syntax

Imports appear before the `command` declaration:

```stim
import "path/to/file.stim"

command mycommand {
  // body
}
```

### Single and Double Quotes

Both quote styles are supported:

```stim
import "shared/prompts.stim"
import 'shared/checks.stim'
```

## What Gets Imported

Only variable assignments are imported. Commands, annotations, and control flow statements in imported files are ignored.

**shared/prompts.stim:**
```stim
welcome_prompt = "Welcome to the system"
error_prompt = "An error occurred"
is_debug = true
supported_languages = ["Python", "JavaScript", "Go"]
```

**main.stim:**
```stim
import "shared/prompts.stim"

command example {
  ask(welcome_prompt)         // From import
  is_production = !is_debug    // Use imported variable
}
```

## Scope

Imported variables are available throughout the command body and in [tasks](tasks.md):

```stim
import "shared/vars.stim"

command example {
  // Variables are available here
  message = imported_var + " extra text"
  
  if (imported_condition) {
    ask(imported_prompt)
  }
  
  task "subtask" {
    ask(imported_prompt)  // Available in tasks too
  }
}
```

## Path Resolution

Paths are relative to the current file's directory.

**Directory structure:**
```
project/
  shared/
    prompts.stim
    checks.stim
  commands/
    main.stim
    deploy.stim
```

**In commands/main.stim:**
```stim
import "../shared/prompts.stim"    // Go up one level, then into shared/
import "../shared/checks.stim"
```

**In shared/prompts.stim (importing from same dir):**
```stim
import "checks.stim"
```

## Multiple Imports

Multiple files can be imported:

```stim
import "shared/prompts.stim"
import "shared/checks.stim"
import "config/defaults.stim"

command example {
  ask(welcome_prompt)     // From prompts.stim
  env = default_env       // From defaults.stim
}
```

**Order matters:** If two imports define the same variable, the last one wins:

```stim
import "a.stim"    // Defines: status = "pending"
import "b.stim"    // Also defines: status = "active"

command example {
  ask(status)      // Returns "active" (from b.stim)
}
```

## Nested Imports

Imported files can themselves import other files:

**a.stim:**
```stim
import "b.stim"
x = "from a"
```

**b.stim:**
```stim
import "c.stim"
y = "from b"
```

**c.stim:**
```stim
z = "from c"
```

**main.stim:**
```stim
import "a.stim"

command example {
  ask(x)  // "from a"
  ask(y)  // "from b"
  ask(z)  // "from c"
}
```

## Circular Import Detection

Circular imports are detected at compile time and produce an error:

**a.stim:**
```stim
import "b.stim"
x = "a"
```

**b.stim:**
```stim
import "a.stim"
y = "b"
```

**Error:**
```
Error: Circular import detected: a.stim
```

## Compile-Time Inlining

Imports are resolved at compile time. Imported variables are substituted inline into the compiled output:

**shared.stim:**
```stim
welcome = "Hello"
```

**main.stim:**
```stim
import "shared.stim"

command example {
  ask(welcome)
}
```

**Compiled output:**
```
Ask the user: "Hello"
```

The imported variable value is inlined directly.

## What Cannot Be Imported

The following cannot be imported:
- Commands
- Annotations
- Control flow (if, for, while)
- Tasks
- Functions

**Example (imports only variable assignments):**
```stim
// shared.stim
command helper { }        // Not imported
is_ready = true           // Imported
ask("test")               // Not imported (function call)

// main.stim
import "shared.stim"

command example {
  ask(is_ready)  // Error: is_ready is a boolean, not a string
}
```

## Future: Task Definitions (v2)

Task definitions in imported files are planned for v2. Currently, task definitions cannot be imported.

## Error Cases

### Import File Not Found

**Error:**
```
Error: Import file not found: /path/to/missing.stim
```

**Solution:** Verify the file path is correct and the file exists.

### Circular Import

**Error:**
```
Error: Circular import detected: b.stim
```

**Solution:** Remove the circular dependency by reorganizing imports.

## See Also

- [Variables](variables.md) — Variable types and scoping
- [Commands](commands.md) — Command structure and imports
- [Annotations](annotations.md) — Annotations with imports
