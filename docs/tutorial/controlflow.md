# Chapter 5: Control Flow

Control flow is what makes your commands dynamic and responsive. Without it, every command would ask the same questions in the same order. With control flow, your commands can adapt based on user input, iterate over lists, and branch into different paths.

## Why Control Flow Matters

Imagine a command that always asks about deployment to production, even if the user just wants to run tests. Or a checklist that asks you to confirm the same task 50 times instead of looping through a list. Control flow lets you write smart commands that:

- Make decisions based on user answers
- Avoid asking unnecessary questions
- Automate repetitive tasks with loops
- Handle multiple scenarios in one command

## If Statements: Making Decisions

The simplest form of control flow is the `if` statement. It runs code only when a condition is true.

### Basic If Syntax

```stim
if (condition) {
  // This code runs only if condition is true
}
```

The condition must be in parentheses. Common conditions use the `confirm()` function, which prompts the user with a yes/no question:

```stim
command decide {
  if (confirm("Do you want to set up TypeScript?")) {
    ask("Great! I'll add TypeScript to your project.")
  }
}
```

When compiled and run, this command asks "Do you want to set up TypeScript?" If the user says yes, it acknowledges the choice. If no, it says nothing.

### Using Confirm as a Condition

`confirm()` is a built-in function that presents a yes/no question and returns true or false. It's perfect for if conditions:

```stim
command database_setup {
  if (confirm("Do you need a database?")) {
    ask("What type? (PostgreSQL, MySQL, MongoDB, SQLite)")
    wait_for_response()
  }
  
  if (confirm("Should I set up migrations?")) {
    ask("I'll create a migrations directory with templates.")
  }
}
```

Each `confirm()` call asks a separate question. The user answers, and the if block either runs or doesn't.

## If/Else: Two Paths

When you want to run different code depending on the condition, use `else`:

```stim
if (condition) {
  // Run this if true
} else {
  // Run this if false
}
```

Example:

```stim
command environment_check {
  if (confirm("Is this a production environment?")) {
    ask("Production detected. Running enhanced security checks.")
    wait_for_response()
  } else {
    ask("Development environment. Running standard checks.")
    wait_for_response()
  }
}
```

Both branches are complete code paths. The user only sees one set of messages.

## Nested Conditionals: Decision Trees

You can nest if statements inside other if statements to create complex decision trees:

```stim
command framework_picker {
  if (confirm("Are you building a web application?")) {
    if (confirm("Is it a single-page application?")) {
      ask("React, Vue, or Angular? These are great for SPAs.")
    } else {
      ask("Next.js, Nuxt, or SvelteKit? These handle server-side rendering.")
    }
  } else if (confirm("Are you building a mobile app?")) {
    if (confirm("Native or cross-platform?")) {
      ask("Swift for iOS or Kotlin for Android.")
    } else {
      ask("React Native or Flutter for cross-platform development.")
    }
  } else {
    ask("CLI tool or backend? Tell me more.")
  }
}
```

Start with one decision (web vs mobile), then branch further. Each path asks the most relevant follow-up question. Nesting makes your commands feel conversational and smart.

## For Loops: Iterating Over Arrays

Loops repeat code for each item in a list. The `for` loop is perfect for this:

```stim
for variable in array {
  // This code runs once for each item in the array
}
```

Example:

```stim
command checklist {
  tasks = ["Write tests", "Format code", "Update docs", "Run linter"]
  
  for task in tasks {
    ask("Have you completed: " + task + "?")
    wait_for_response()
  }
}
```

This loops through each task and asks about it. The variable `task` changes each iteration:
- First: `task` = "Write tests"
- Second: `task` = "Format code"
- Third: `task` = "Update docs"
- Fourth: `task` = "Run linter"

### Building a Checklist Walkthrough

Let's build a realistic pre-deployment checklist:

```stim
command deploy_checklist {
  checks = [
    "All tests passing",
    "Code reviewed",
    "Environment variables set",
    "Database backed up",
    "Monitoring configured"
  ]
  
  failed_items = []
  
  for check in checks {
    if (confirm("Complete: " + check + "?")) {
      ask("✓ " + check)
    } else {
      ask("⚠️  " + check + " - what needs to be done?")
      wait_for_response()
      failed_items = failed_items + [check]
    }
  }
  
  if (failed_items.length > 0) {
    ask("Fix these items before deploying: " + failed_items.join(", "))
  } else {
    ask("All checks passed! Ready to deploy.")
  }
}
```

This loops through each check, records which ones failed, and summarizes at the end. It's a complete workflow in a few lines.

## While Loops: Repeating Until Done

`while` loops repeat as long as a condition is true. They're useful for gathering variable-length input:

```stim
while (condition) {
  // This code repeats while condition is true
}
```

Example:

```stim
command gather_requirements {
  collecting = true
  
  while (collecting) {
    ask("What's the next requirement?")
    wait_for_response()
    
    if (confirm("Any more requirements?")) {
      collecting = true
    } else {
      collecting = false
    }
  }
  
  ask("Requirements gathered. Ready to design?")
}
```

This asks for requirements repeatedly. The user decides when to stop.

### Building a Requirements Gathering Loop

Here's a more structured version:

```stim
command requirements_gathering {
  requirements = []
  capturing = true
  counter = 1
  
  while (capturing) {
    ask("Requirement #" + counter + ": Describe a requirement")
    wait_for_response()
    
    counter = counter + 1
    
    if (!confirm("Capture another requirement?")) {
      capturing = false
    }
  }
  
  ask("You've captured " + counter - 1 + " requirements.")
  ask("Ready to prioritize them?")
}
```

Each iteration increments a counter, creating a numbered list from the user's perspective. When they say no, the loop exits.

## Break: Exiting Loops Early

`break` lets you exit a loop before it naturally ends:

```stim
command find_file {
  locations = [".env.local", ".env.dev", ".env.staging", ".env.prod"]
  found = false
  
  for location in locations {
    if (confirm("Is the env file at " + location + "?")) {
      ask("Found it!")
      found = true
      break
    }
  }
  
  if (!found) {
    ask("Couldn't find the env file. Create one?")
  }
}
```

Once the file is found and `break` is executed, the loop stops. The code after the loop continues.

Another use case:

```stim
command validate_input {
  attempts = 0
  max_attempts = 3
  valid = false
  
  while (attempts < max_attempts) {
    ask("Enter a valid API key:")
    wait_for_response()
    
    attempts = attempts + 1
    
    if (confirm("Is this key correct?")) {
      valid = true
      break
    }
  }
  
  if (!valid) {
    ask("Too many failed attempts. Please try again later.")
  } else {
    ask("API key saved!")
  }
}
```

This attempts validation up to 3 times, breaking early if the user confirms the key is correct.

## Combining Control Flow: A Complete Example

Here's a realistic command that uses if, for, and while together:

```stim
command code_quality_gate {
  checks = ["tests", "linter", "types", "security"]
  failing_checks = []
  
  ask("Running code quality checks...")
  wait_for_response()
  
  // Check each item
  for check in checks {
    if (confirm("Run " + check + " check?")) {
      ask("Executing " + check + " check...")
      wait_for_response()
      
      if (confirm("Did " + check + " pass?")) {
        ask("✓ " + check + " passed")
      } else {
        ask("✗ " + check + " failed")
        failing_checks = failing_checks + [check]
      }
    }
  }
  
  // Loop to retry failures
  retrying = true
  retry_count = 0
  
  while (retrying && failing_checks.length > 0) {
    retry_count = retry_count + 1
    ask("Retry attempt " + retry_count + ": Fix " + failing_checks.join(", "))
    wait_for_response()
    
    if (confirm("Are all checks passing now?")) {
      retrying = false
      ask("Success! All quality gates passed.")
    } else if (retry_count >= 3) {
      retrying = false
      ask("Max retry attempts reached. Cannot proceed with deployment.")
    }
  }
}
```

This command:
1. Uses `for` to iterate through checks
2. Uses nested `if` to conditionally run and validate each check
3. Uses `while` to let the user retry failures
4. Tracks state with arrays and counters
5. Provides clear feedback at each step

## Compiled Output: What Happens Behind the Scenes

When you compile control flow, Stim transforms it into markdown tasks. Understanding this helps you predict what Claude will do.

An if statement compiles to a conditional task:

```stim
if (confirm("Deploy?")) {
  ask("Deploying to production")
}
```

Becomes a task that says: "Ask the user 'Deploy?' as a yes/no question. If yes, ask 'Deploying to production'. If no, stop here."

A for loop compiles to repeated tasks:

```stim
for item in ["a", "b"] {
  ask(item)
}
```

Becomes: "Ask the user about 'a', then ask the user about 'b'."

The compiled markdown is self-contained. All variables are expanded inline. This means you can read the compiled `.md` file and see exactly what Claude will be asked to do.

## Exercise: Build a Deployment Checklist

Create a command called `deploy` that:

1. Asks which environment to deploy to (staging or production)
2. For production only, requires 3 confirmations:
   - "All tests passing?"
   - "Code reviewed?"
   - "Database backed up?"
3. For staging, just asks "Run pre-deployment checks?"
4. If any check fails on production, exits with an error message
5. If all pass, lists what will be deployed: "Deploying API, Web UI, Worker to [environment]"

Here's a skeleton to start:

```stim
command deploy {
  ask("Which environment? (staging or production)")
  wait_for_response()
  
  if (confirm("Is this production?")) {
    // Add production checks here
  } else {
    // Add staging path here
  }
}
```

Complete this command with nested ifs, confirmations, and clear feedback. Test it by compiling and running `/deploy`. Try different answers and verify the behavior matches your expectations.

Once complete, you'll have a reusable deployment helper that asks the right questions for each environment and prevents accidental production deployments.

---

**Key Takeaways:**

- `if (condition) { }` runs code conditionally
- `confirm()` asks yes/no questions and returns true/false
- `else` provides an alternative path
- Nesting creates complex decision trees
- `for item in array { }` iterates over lists
- `while (condition) { }` repeats until a condition changes
- `break` exits loops early
- Combine them to create sophisticated workflows

**Next:** Learn about built-in functions that make your commands more powerful.
