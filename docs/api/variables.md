# Variables

Variables store values that can be used throughout the command body.

## Declaration

Variables are declared with assignment syntax:

```stim
name = value
```

Variable names follow the same rules as [command names](commands.md): letters, digits, underscores, cannot start with a digit.

## Types

### Strings

Strings can use double or single quotes:

```stim
message = "Hello, world!"
greeting = 'Hi there'
empty = ""
```

String values are trimmed of surrounding quotes during parsing. Quotes are not part of the value.

### Booleans

True and false literals:

```stim
is_active = true
is_complete = false
```

Boolean values are useful in [conditional statements](controlflow.md).

### Arrays

Arrays are declared with bracket syntax, containing comma-separated string values:

```stim
items = ["item1", "item2", "item3"]
languages = ["JavaScript", "Python", "Rust"]
empty_array = []
```

Arrays can be iterated in [for loops](controlflow.md#for-loops).

## Scope

Variables are scoped to the command and persist throughout execution, including in nested blocks.

```stim
command scope_example {
  name = "initial"
  
  if (true) {
    name = "modified"     // Modifies the existing variable
    local_var = "temp"    // Creates new variable
  }
  
  ask(name)              // "modified" - visible here
  ask(local_var)         // "temp" - visible here too
}
```

## Usage

### In Function Calls

Pass variables as arguments to functions:

```stim
question = "What is your name?"
ask(question)

filename = "output.txt"
content = "Hello"
create_file(filename, content)
```

### In String Concatenation

Use the `+` operator to join strings:

```stim
greeting = "Hello, "
name = "Alice"
result = greeting + name    // "Hello, Alice"

count = "5"
message = "Item " + count    // "Item 5"
```

### In Conditions

Use variables in [conditional expressions](controlflow.md):

```stim
is_ready = true
if (is_ready) {
  ask("Ready to begin!")
}
```

### In Loops

Iterate over arrays in [for loops](controlflow.md#for-loops):

```stim
fruits = ["apple", "banana", "cherry"]
for fruit in fruits {
  ask("Do you like " + fruit + "?")
}
```

## Compiled Output

Variables compile to instructions to set values:

**Input:**
```stim
name = "John"
count = "42"
active = true
items = ["a", "b"]
```

**Output:**
```
Set name = John
Set count = 42
Set active = true
Set items = ["a", "b"]
```

## Imported Variables

Variables from [imported files](imports.md) are available in the command body:

```stim
import "shared/prompts.stim"

command example {
  ask(welcome_prompt)    // From imported file
}
```

## See Also

- [Operators](operators.md) — Concatenation, equality, logical operators
- [Control Flow](controlflow.md) — Use variables in conditions and loops
- [Imports](imports.md) — Import variables from other files
