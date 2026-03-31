# Control Flow

Control flow statements allow conditional execution and iteration.

## Conditionals

### If Statements

Execute a block conditionally:

```stim
if (condition) {
  // statements executed if condition is true
}
```

**Example:**
```stim
is_ready = true
if (is_ready) {
  ask("Ready to start!")
}
```

**Compiled output:**
```
If is_ready:
- Ask the user: "Ready to start!"
```

### If-Else Statements

Provide an alternative block:

```stim
if (condition) {
  // statements if condition is true
} else {
  // statements if condition is false
}
```

**Example:**
```stim
status = "complete"
if (status == "complete") {
  ask("Task is done!")
} else {
  ask("Still working...")
}
```

**Compiled output:**
```
If status == "complete":
- Ask the user: "Task is done!"

Otherwise:
- Ask the user: "Still working..."
```

## Loops

### For Loops

Iterate over array elements:

```stim
for variable_name in array_name {
  // statements executed for each element
  // variable_name contains the current value
}
```

**Example:**
```stim
languages = ["JavaScript", "Python", "Rust"]
for lang in languages {
  ask("Do you use " + lang + "?")
}
```

**Compiled output:**
```
For each lang in languages:
- Ask the user: "Do you use " + lang + "?"
```

### While Loops

Iterate while a condition is true:

```stim
while (condition) {
  // statements executed while condition is true
}
```

**Example:**
```stim
count = "0"
while (count != "3") {
  ask("Count: " + count)
  count = count + "1"
}
```

**Compiled output:**
```
While count != "3", repeat:
- Ask the user: "Count: " + count
- Set count = count + 1
```

**Warning:** Ensure the condition becomes false. Infinite loops will run until manually stopped.

## Loop Control

### Break Statement

Exit the current loop immediately:

```stim
for item in items {
  if (item == "stop") {
    break
  }
  ask(item)
}
```

**Compiled output:**
```
For each item in items:
- If item == "stop":
  - Stop current loop/process.
- Ask the user the question from variable: item
```

`break` only exits the innermost loop it appears in.

## Nesting Rules

Control flow blocks can be nested to arbitrary depth:

```stim
for outer in list1 {
  if (condition) {
    for inner in list2 {
      while (inner_condition) {
        ask(outer + inner)
      }
    }
  }
}
```

Each block must have matching braces `{ }`.

## Conditions

Conditions are expressions that evaluate to true or false. See [Operators](operators.md) for a complete list.

**Comparison:**
```stim
if (status == "ready") { }        // Equality
if (count != "0") { }             // Inequality
```

**Logical:**
```stim
if (!is_empty) { }                // NOT
if (is_ready && has_data) { }     // AND
if (is_admin || is_owner) { }     // OR
```

## See Also

- [Operators](operators.md) — Condition syntax and precedence
- [Variables](variables.md) — Use variables in conditions
- [Functions](functions.md) — Call functions in control flow blocks
