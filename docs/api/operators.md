# Operators

Operators combine and transform values in expressions.

## String Concatenation

The `+` operator joins strings:

```stim
greeting = "Hello, "
name = "Alice"
message = greeting + name              // "Hello, Alice"

count = "5"
result = "Item " + count               // "Item 5"

combined = "a" + "b" + "c"             // "abc"
```

Used in function arguments:

```stim
ask("Hello " + name + "!")

filename = "data-" + date + ".txt"
create_file(filename, content)
```

## Comparison Operators

### Equality (==)

Test if two values are equal:

```stim
if (status == "complete") {
  ask("Done!")
}

if (count == "0") {
  ask("Empty")
}
```

### Inequality (!=)

Test if two values are not equal:

```stim
if (status != "pending") {
  ask("Status changed")
}

if (count != "0") {
  ask("Has items")
}
```

Both operators compare string values.

## Logical Operators

### Logical NOT (!)

Inverts a boolean:

```stim
if (!is_complete) {
  ask("Still working...")
}

if (!is_empty) {
  ask("Has content")
}
```

### Logical AND (&&)

True only if both conditions are true:

```stim
if (is_ready && has_permission) {
  ask("Can proceed")
}

if (status == "done" && !has_errors) {
  ask("Success")
}
```

### Logical OR (||)

True if at least one condition is true:

```stim
if (is_admin || is_owner) {
  ask("Access granted")
}

if (env == "dev" || env == "test") {
  ask("Non-production")
}
```

## Operator Precedence

Operators are evaluated in this order (highest to lowest):

1. `!` (NOT)
2. `==`, `!=` (comparison)
3. `&&` (AND)
4. `||` (OR)
5. `+` (concatenation)

### Precedence Examples

```stim
// ! has highest precedence
if (!is_ready && can_wait) {
  // Equivalent to: if ((!is_ready) && can_wait)
}

// && has higher precedence than ||
if (is_admin || is_owner && can_edit) {
  // Equivalent to: if (is_admin || (is_owner && can_edit))
}

// + has lowest precedence
message = "status: " + status == "ok"
// Concatenates "status: " + status, then compares to "ok"
```

## Array Operations

### Array in For Loops

Use arrays in [for loops](controlflow.md#for-loops):

```stim
languages = ["Python", "JavaScript", "Go"]
for lang in languages {
  ask("Use " + lang + "?")
}
```

Arrays are indexed by iteration in the loop, not by numeric index.

## Variable in Conditions

Variables can be used directly as conditions:

```stim
is_ready = true
if (is_ready) {
  ask("Ready!")
}
```

Non-boolean variables may behave unexpectedly. Use explicit comparisons:

```stim
status = "active"
if (status) {
  // May not work as expected
}

if (status == "active") {
  // Correct
}
```

## Complex Expressions

Combine operators with proper precedence:

```stim
if ((!is_locked && can_edit) || is_admin) {
  ask("Can modify")
}

if (is_ready && (status == "pending" || status == "retry")) {
  ask("Proceed")
}

message = "Name: " + name + " (" + role + ")"
```

## See Also

- [Variables](variables.md) — Variable types and values
- [Control Flow](controlflow.md) — Using operators in conditions
- [Functions](functions.md) — Operators in function arguments
