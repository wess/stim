# Chapter 3: Variables and Data Types

Variables let you store information and reuse it throughout your command. Instead of repeating the same text over and over, you name it once and reference it everywhere.

This chapter covers strings, booleans, arrays, and scope. By the end, you'll build a complete "project setup" command using variables.

## Why Variables Matter

Imagine a command without variables:

```stim
command deploy {
  ask("Deploy to staging?")
  wait_for_response()
  
  ask("Now deploy to production?")
  wait_for_response()
  
  ask("Roll back from staging?")
  wait_for_response()
}
```

If you need to change the environment name, you edit every line. With variables:

```stim
command deploy {
  env1 = "staging"
  env2 = "production"
  
  ask("Deploy to " + env1 + "?")
  wait_for_response()
  
  ask("Now deploy to " + env2 + "?")
  wait_for_response()
  
  ask("Roll back from " + env1 + "?")
  wait_for_response()
}
```

Now change is one edit. That's the power of variables.

## Declaring Variables

Create a variable with `=`:

```stim
name = "Alice"
port = "8080"
enabled = true
items = ["apple", "banana", "cherry"]
```

That's it. No `let`, `var`, or `const`. Just name and value.

## Strings

Strings are text. Use double or single quotes interchangeably:

```stim
greeting = "Hello, world!"
greeting = 'Hello, world!'
emoji_note = "Note: Stim is text-only, keep it simple"
empty = ""
```

### Escape Sequences

Need special characters? Use backslash escapes:

```stim
quote = "She said \"Hello\""
newline = "Line 1\nLine 2"
tab = "Column1\tColumn2"
backslash = "Path: C:\\Users\\Name"
```

Common escapes:

- `\"` — Double quote
- `\'` — Single quote
- `\\` — Backslash
- `\n` — Newline
- `\t` — Tab

### String Concatenation

Join strings with `+`:

```stim
greeting = "Hello"
name = "Alice"
full_greeting = greeting + ", " + name + "!"

ask(full_greeting)  # Asks: "Hello, Alice!"
```

You can concatenate:
- String to string: `"Hello" + "World"`
- Variable to string: `"Count: " + count`
- String to variable: `prefix + "_suffix"`

## Booleans

Booleans are true or false. They're used in conditions (Chapter 4):

```stim
ready = true
deployed = false
production_safe = true

if (ready) {
  ask("Starting deployment...")
}

if (!deployed) {
  ask("Deployment not yet complete")
}
```

Note the `!` operator: `!true` is `false`, `!false` is `true`.

You can test a boolean directly:

```stim
if (production_safe) { ... }
if (!production_safe) { ... }
```

## Arrays

Arrays store multiple values. Use square brackets and commas:

```stim
colors = ["red", "green", "blue"]
numbers = ["1", "2", "3"]  # All elements are strings
empty = []
```

All array elements are strings. You can't mix types:

```stim
# Valid
items = ["apple", "banana", "cherry"]
ids = ["100", "200", "300"]

# Invalid (strings only in arrays)
mixed = ["apple", 42, true]  # Won't compile
```

### Using Arrays in Loops

Arrays shine in `for` loops. More on loops in Chapter 4, but here's the idea:

```stim
colors = ["red", "green", "blue"]

for color in colors {
  ask("Pick " + color)
  wait_for_response()
}
```

This asks three times, once for each color.

### Array Methods

You can call methods on arrays. The main one is `.join()`:

```stim
colors = ["red", "green", "blue"]
joined = colors.join(", ")

ask("Available colors: " + joined)  # "Available colors: red, green, blue"
```

`.join()` takes a separator string and concatenates all elements.

## Variable Scope

Here's the important part: **Variables are scoped to the entire command, not just the block they're defined in.**

```stim
command example {
  result = "pending"
  
  if (confirm("Done?")) {
    result = "complete"  # Modifies the outer variable
  }
  
  ask(result)  # Shows "complete" if user confirmed
}
```

In many languages, `result` defined inside the `if` block would be local to that block. Not in Stim. Everything is command-wide.

This makes sense because Stim commands are relatively small. You'll never have deep nesting where scope isolation matters.

### Multiple Commands Share No State

Each command is isolated. Variables don't carry between commands:

```stim
# command1.stim
command first {
  name = "Alice"
  ask("Name is " + name)
}

# command2.stim
command second {
  ask(name)  # Error! 'name' doesn't exist
}
```

Each command is its own world.

## Hands-On: Build a Project Setup Command

Let's create a real command that uses variables throughout. This is `setup.stim`:

```stim
command setup {
  # Define project info
  project_name = "MyApp"
  environments = ["development", "staging", "production"]
  services = ["web", "api", "database"]
  
  ask("Setting up " + project_name)
  wait_for_response()
  
  ask("Which services do you need? Available: " + services.join(", "))
  wait_for_response()
  
  ask("Which environments should we configure? Available: " + environments.join(", "))
  wait_for_response()
  
  ready = confirm("Ready to create configuration files?")
  
  if (ready) {
    ask("Create configuration for " + project_name)
    create_file("CONFIG.md", "configuration_instructions")
  } else {
    ask("Setup canceled. Let me know when you're ready.")
  }
}
```

Let's trace through it:

```stim
project_name = "MyApp"
```

Store the project name. We'll reuse it multiple times.

```stim
environments = ["development", "staging", "production"]
services = ["web", "api", "database"]
```

Arrays for the options we'll offer.

```stim
ask("Setting up " + project_name)
```

Concatenate the string with the variable. Claude sees: "Setting up MyApp"

```stim
ask("Which services do you need? Available: " + services.join(", "))
```

Use `.join()` to make the list pretty. Claude sees: "Which services do you need? Available: web, api, database"

```stim
ready = confirm("Ready to create configuration files?")
```

Store the user's yes/no answer in a boolean variable.

```stim
if (ready) {
  ask("Create configuration for " + project_name)
  create_file("CONFIG.md", "configuration_instructions")
} else {
  ask("Setup canceled. Let me know when you're ready.")
}
```

Conditional logic based on the boolean (you'll see more of this in Chapter 4).

## The Compiled Output

Let's see what Stim generates for this. Compile and look at the output:

```bash
stim compile setup.stim
cat dist/setup.md
```

You'll see something like:

```
Ask: "Setting up MyApp"

...

Ask: "Which services do you need? Available: web, api, database"

...

Ask: "Ready to create configuration files?"

If yes:
  Ask: "Create configuration for MyApp"
  Create file CONFIG.md with: configuration_instructions

If no:
  Ask: "Setup canceled. Let me know when you're ready."
```

Notice how:
- Variable values are substituted before compilation
- `.join()` is evaluated at compile time
- The final markdown has no variables, just values
- Booleans become "If yes/If no" branches

This is important: Stim is a **compile-time** system. Variables exist only while you're writing. Once compiled, they're gone, replaced by their values.

## Common Patterns

### Configuration at the Top

Put all variables at the start:

```stim
command mycommand {
  # Configuration
  max_retries = "5"
  timeout = "30s"
  log_level = "info"
  
  # Main logic
  ask("Starting with " + max_retries + " retries...")
}
```

This makes it easy to tweak behavior.

### Meaningful Names

Name variables for what they represent, not how you'll use them:

```stim
# Good
environments = ["dev", "staging", "prod"]
max_connections = "100"

# Avoid
x = ["dev", "staging", "prod"]
n = "100"
```

### Build Strings Progressively

For complex messages, build them step by step:

```stim
error = "ERROR: "
error = error + "File not found"
error = error + " at line 42"

ask(error)
```

This is clearer than one long concatenation.

## Type Safety at Compile Time

Stim doesn't allow mixed-type operations:

```stim
# Valid
"hello" + "world"
greeting = "hello"; ask(greeting)
count = "5"; ask("Count: " + count)

# Invalid
"hello" + 5               # Can't add string and number
true + false              # Can't add booleans
items = [1, 2, 3]         # Array elements must be strings
```

If you write invalid code, Stim tells you at compile time:

```
Type error on line 8: cannot concatenate string and array
```

This is good. It catches bugs before they reach Claude.

## Shadowing and Reassignment

You can reassign variables:

```stim
status = "starting"
ask("Status: " + status)

status = "running"
ask("Status: " + status)

status = "complete"
ask("Status: " + status)
```

Each `ask()` sees the current value of `status`.

## Exercise: Build a Survey Command

Create `survey.stim`:

```stim
command survey {
  questions = ["What's your favorite language?", "How many years experience?", "What's your biggest challenge?"]
  
  for question in questions {
    ask(question)
    wait_for_response()
  }
  
  complete = confirm("Complete survey?")
  
  if (complete) {
    ask("Thank you! Save results to SURVEY_RESULTS.md")
    create_file("SURVEY_RESULTS.md", "survey_results_summary")
  } else {
    ask("Incomplete. Feel free to restart anytime.")
  }
}
```

Compile it:

```bash
stim compile survey.stim
```

Install it:

```bash
stim install survey.stim
```

Run it in Claude Code:

```
/survey
```

Notice:
- The `for` loop asks every question
- You answer each one
- At the end, you confirm completion
- Based on your answer, different things happen

This is a complete workflow, and you built it with variables, arrays, and conditionals. You're already fluent in Stim basics.

## What You've Learned

- Variables store and reuse information
- Strings use double or single quotes
- Booleans are true/false
- Arrays store multiple string values
- Scope is command-wide
- Variable values are substituted at compile time
- Type safety catches errors early

## What Comes Next

Chapter 4 covers **Control Flow** in depth: `if`/`else`, `for`, `while`, and `break`. You've seen brief examples already. Now you'll master them.
