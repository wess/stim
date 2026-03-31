# Errors

Common errors and how to fix them.

## Parse Errors

Errors that occur when parsing the `.stim` file syntax.

### Empty File

**Message:**
```
Error: Empty command file
```

**Cause:** The `.stim` file is empty or contains only whitespace.

**Fix:** Add a `command` declaration:
```stim
command example {
  ask("Hello!")
}
```

### Missing Command Declaration

**Message:**
```
Error: Expected command declaration: command <name> {
```

**Cause:** File does not start with a `command` declaration (after optional imports/annotations).

**Fix:** Every `.stim` file must have exactly one command:
```stim
command mycommand {
  // body
}
```

### Malformed Command Line

**Message:**
```
Error: Expected command declaration: command <name> {
```

**Cause:** Command syntax is incorrect.

**Examples of invalid syntax:**
```stim
cmd example { }           // Missing 'command' keyword
command example           // Missing opening brace
command example {         // Missing closing brace
command 123invalid { }    // Name starts with digit
command my-app { }        // Name has hyphen
```

**Fix:** Use correct syntax:
```stim
command example {
  ask("Hello!")
}
```

### Invalid Ask Statement

**Message:**
```
Error: Invalid ask statement: ask(unclosed string"
```

**Cause:** String is not properly quoted or parentheses are unbalanced.

**Fix:** Ensure quotes match:
```stim
ask("What is your name?")      // Valid
ask('What is your name?')      // Valid
ask("What is your name?)       // Error: mismatched quotes
ask(question)                  // Valid (variable reference)
```

### Invalid Assignment

**Message:**
```
Error: Invalid assignment: name =
```

**Cause:** Assignment has no value.

**Fix:** Provide a value:
```stim
name = "John"
count = "5"
items = ["a", "b"]
is_active = true
```

### Invalid Annotation Key

**Message:**
```
Error: Unknown annotation @unknown. Valid annotations: topology, memory, on_error
```

**Cause:** Using an unsupported annotation key.

**Fix:** Use one of the valid keys: `topology`, `memory`, `on_error`
```stim
command test {
  @topology pipeline
  ask("Hello")
}
```

### Invalid Annotation Value

**Message:**
```
Error: Invalid value "invalid" for @topology. Valid values: pipeline, fanout, supervisor
```

**Cause:** Annotation value is not valid for that key.

**Fix:** Use a valid value:
```stim
command test {
  @topology pipeline    // Valid: pipeline, fanout, supervisor
  @memory shared        // Valid: shared, none
  @on_error escalate    // Valid: escalate
  ask("Hello")
}
```

### Duplicate Annotation

**Message:**
```
Error: Duplicate annotation: @topology
```

**Cause:** The same annotation appears twice.

**Fix:** Remove the duplicate:
```stim
// Invalid
command test {
  @topology pipeline
  @topology fanout     // Error: duplicate
}

// Valid
command test {
  @topology pipeline
}
```

### Annotations After Statements

**Message:**
```
Error: Annotations must appear before other statements
```

**Cause:** Annotations appear after code statements.

**Fix:** Move annotations before all statements:
```stim
// Invalid
command test {
  ask("Hello")
  @topology pipeline   // Error: annotation after statement
}

// Valid
command test {
  @topology pipeline
  ask("Hello")
}
```

## Import Errors

Errors related to [imports](imports.md).

### Circular Import

**Message:**
```
Error: Circular import detected: a.stim
```

**Cause:** Two or more import files reference each other directly or indirectly.

**Example:**
```stim
// a.stim
import "b.stim"

// b.stim
import "a.stim"   // Circular reference to a.stim
```

**Fix:** Remove the circular dependency:
```stim
// a.stim
import "b.stim"

// b.stim
x = "value"        // No import of a.stim
```

### Import File Not Found

**Message:**
```
Error: Import file not found: /full/path/to/file.stim
```

**Cause:** The imported file does not exist.

**Fix:** Verify the file path:
```stim
// Check that the file exists
ls shared/prompts.stim

// Use correct relative path
import "shared/prompts.stim"
```

## Task Errors

Errors related to [tasks](tasks.md) and [parallel](parallel.md) blocks.

### Circular Task Reference

**Message:**
```
Error: Circular task file reference detected: b.stim
```

**Cause:** Two task files reference each other.

**Example:**
```stim
// a.stim
command a {
  task("b.stim")
}

// b.stim
command b {
  task("a.stim")   // Circular reference
}
```

**Fix:** Remove the circular reference or restructure tasks.

### Task File Not Found

**Message:**
```
Error: Task file not found: /full/path/to/file.stim
```

**Cause:** The referenced task file does not exist.

**Fix:** Verify the file path:
```stim
task("helpers/research.stim")  // Check this file exists
```

### Non-Task in Parallel Block

**Message:**
```
Error: parallel block may only contain task statements
```

**Cause:** Parallel block contains non-task statements.

**Example:**
```stim
// Invalid
parallel {
  ask("Hello")              // Error: not a task
  task "work" { }
}
```

**Fix:** Only use task statements in parallel blocks:
```stim
// Valid
parallel {
  task "work1" { ask("?") }
  task "work2" { ask("?") }
}
```

## CLI Errors

Errors from command-line operations.

### No Input File

**Message:**
```
Error: No input file specified
Usage: stim compile <file.stim>
```

**Cause:** Command requires a file argument but none was provided.

**Fix:** Provide a `.stim` file:
```bash
stim compile brainstorm.stim
```

### File Not Found

**Message:**
```
Error: File not found: brainstorm.stim
```

**Cause:** The specified file does not exist.

**Fix:** Check the file path:
```bash
# Verify the file exists
ls brainstorm.stim

# Use correct path
stim compile ./brainstorm.stim
```

### Wrong File Extension

**Message:**
```
Error: Input file must have .stim extension
```

**Cause:** File does not have `.stim` extension.

**Fix:** Use `.stim` files:
```bash
stim compile brainstorm.stim    # Valid
stim compile brainstorm.md      # Error: wrong extension
```

### Package Not Found (Add/Remove)

**Message:**
```
Error: Package not found: github/user/repo
```

**Cause:** GitHub repository not found or not accessible.

**Fix:** Verify the repository path:
```bash
# Check the repository exists
git clone https://github.com/user/repo

# Use correct path format
stim add github/user/repo       # Not: github.com/user/repo
```

## Debugging Tips

1. **Check syntax with compile:** Use `stim compile --dry-run` to validate syntax without writing output.

2. **Read error messages carefully:** The error message often indicates exactly where the problem is.

3. **Verify file paths:** Use absolute paths or double-check relative paths.

4. **Check file permissions:** Ensure you have read access to imported and referenced files.

5. **Validate imports:** Ensure imported files contain only variable assignments.

6. **Test with minimal examples:** Start with a simple command and build up.

```stim
// Minimal test
command test {
  ask("Hello")
}
```

7. **Check annotations:** If using annotations, ensure syntax is correct.

```stim
command test {
  @topology pipeline
  ask("Hello")
}
```

## See Also

- [Commands](commands.md) — Command syntax
- [Imports](imports.md) — Import syntax
- [Annotations](annotations.md) — Annotation syntax
- [Tasks](tasks.md) — Task syntax
- [CLI](cli.md) — Command-line usage
