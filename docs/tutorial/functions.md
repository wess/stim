# Chapter 6: Built-in Functions

Built-in functions are the core tools for interacting with the user and generating output. Stim provides four main functions that compile to Claude Code tasks. Understanding what each does and when to use it is essential for building effective commands.

## Overview of Stim's Built-in Functions

Stim has four built-in functions:

| Function | Purpose | Returns |
|----------|---------|---------|
| `ask(message)` | Ask a question or display a message | (void) |
| `confirm(message)` | Ask a yes/no question | Boolean (true/false) |
| `wait_for_response()` | Pause and wait for user input | (void) |
| `create_file(filename, content)` | Write content to a file | (void) |

These four functions are all you need to build sophisticated commands. Anything else (custom functions like `git_init()` or `deploy()`) is passed through as-is to Claude.

## ask(question): Prompting the User

`ask()` displays a message or asks a question. It does not wait for a response unless you call `wait_for_response()` afterward.

### String Literals vs Variable References

You can pass a string literal (quoted text) or a variable:

```stim
// String literal
ask("What's your name?")

// Variable reference
question = "What's your name?"
ask(question)

// Concatenation
name = "Alice"
ask("Hello, " + name + "! How are you?")
```

String literals are the most common. Use variables when you need to build dynamic questions:

```stim
command survey {
  languages = ["JavaScript", "Python", "Rust"]
  
  for lang in languages {
    ask("Do you know " + lang + "?")
    wait_for_response()
  }
}
```

Each iteration, the message changes. In the first loop, `ask()` says "Do you know JavaScript?" In the second, "Do you know Python?" And so on.

### Key Behaviors

- `ask()` does not pause for input by itself
- Multiple `ask()` calls in a row display multiple messages
- The compiled output shows the exact message Claude will see

Example:

```stim
command info_dump {
  ask("Here's your project overview")
  ask("Total files: 450")
  ask("Total lines of code: 50000")
  ask("Test coverage: 85%")
}
```

This displays four separate messages in sequence.

## wait_for_response(): Pausing for User Input

`wait_for_response()` pauses the command and waits for the user to provide input.

### When to Use It

Use `wait_for_response()` right after `ask()` when you need the user's answer:

```stim
command gather {
  ask("What's the project name?")
  wait_for_response()
  
  ask("What's the primary language?")
  wait_for_response()
}
```

Without `wait_for_response()`, the command would ask both questions and continue before the user had a chance to answer.

### The Ask-Wait-Process Pattern

The most common pattern in Stim is:

1. **Ask** - Ask a question or display a message
2. **Wait** - Wait for user input
3. **Process** - Use the answer in your logic

```stim
command ask_wait_process {
  // Ask phase
  ask("How many database migrations do you need?")
  
  // Wait phase
  wait_for_response()
  
  // Process phase (using the user's input)
  ask("I'll generate those migrations for you.")
}
```

This pattern is so common you'll use it in almost every command.

### Progressive Disclosure

You can use ask-wait-process to progressively reveal options based on previous answers:

```stim
command guided_setup {
  // Step 1: Gather basic info
  ask("What's your project name?")
  wait_for_response()
  
  ask("What type of project? (web, mobile, cli, library)")
  wait_for_response()
  
  // Step 2: Ask follow-up based on first answer
  ask("Will you need authentication?")
  wait_for_response()
  
  // Step 3: Ask more detailed questions
  ask("Describe your database requirements")
  wait_for_response()
  
  // Step 4: Summarize and confirm
  ask("I'll create your project with these settings.")
}
```

Each step depends on understanding the previous answer. The conversation flows naturally, one question at a time.

## confirm(message): Yes/No Decisions

`confirm()` asks a yes/no question and returns true (yes) or false (no). It's primarily used in if conditions:

```stim
if (confirm("Deploy to production?")) {
  ask("Deploying...")
}
```

### Using Confirm with If Blocks

Confirm is designed to be the condition in an if statement:

```stim
command file_check {
  if (confirm("Does the project have a package.json?")) {
    ask("Great! I'll analyze your dependencies.")
  } else {
    ask("I'll create a package.json for you.")
    create_file("package.json", "template")
  }
}
```

The user answers "yes" or "no". Based on their answer, different code paths run.

### Confirm in Loops

Confirm is also useful in loops to repeatedly ask the same type of question:

```stim
command feature_selection {
  features = ["Authentication", "Database", "API", "Testing"]
  selected = []
  
  for feature in features {
    if (confirm("Do you need " + feature + "?")) {
      selected = selected + [feature]
    }
  }
  
  ask("Selected features: " + selected.join(", "))
}
```

Each loop iteration asks about a different feature. The user's yes/no answer decides if it's added to the selected list.

### Confirm in While Loops

Use confirm to control loop termination:

```stim
command requirements {
  count = 0
  
  while (true) {
    count = count + 1
    ask("Requirement #" + count + ": describe it")
    wait_for_response()
    
    if (!confirm("Add another requirement?")) {
      break
    }
  }
  
  ask("Total requirements: " + count)
}
```

Each iteration asks "Add another requirement?" When the user says no, the loop exits.

## create_file(filename, content): Generating Files

`create_file()` writes a file to disk. Pass a filename and content:

```stim
create_file("README.md", "# My Project\n\nThis is my project.")
create_file("package.json", template_content)
```

### File Creation Patterns

Most commands that generate files follow this pattern:

```stim
command generate {
  ask("What should I name the file?")
  wait_for_response()
  
  ask("Generating file...")
  
  content = "# Generated Content\n\nAuto-generated at your request."
  create_file("output.md", content)
  
  ask("File created!")
}
```

### Using Variables for Content

Build content dynamically before writing:

```stim
command project_generator {
  ask("Project name?")
  wait_for_response()
  
  ask("Project description?")
  wait_for_response()
  
  // Build README
  readme = "# Project Name\n\nProject description goes here."
  create_file("README.md", readme)
  
  // Build package.json
  package = "{\n  \"name\": \"project\",\n  \"version\": \"1.0.0\"\n}"
  create_file("package.json", package)
  
  ask("Project structure created!")
}
```

### Newlines and Formatting

Use `\n` for newlines, `\t` for tabs:

```stim
content = "Line 1\nLine 2\nLine 3"
create_file("file.txt", content)

formatted = "Item 1\n\t- subitem\n\t- subitem\nItem 2"
create_file("list.txt", formatted)
```

## Custom Function Calls: Extending Stim

Any function not in the built-in list is passed through as-is to Claude. This lets you define custom actions:

```stim
git_init()
git_commit("initial commit")
deploy(env_name)
run_tests("unit", "integration")
custom_deploy_workflow()
```

These are not built-in to Stim. Instead, they're instructions to Claude: "Do this thing." Claude interprets them based on context.

### Custom Function Examples

In a practical command:

```stim
command deployment {
  ask("Which service should I deploy?")
  wait_for_response()
  
  // Ask what to deploy
  ask("What's the target environment?")
  wait_for_response()
  
  // Custom function: Claude interprets this
  deploy_service()
  
  ask("Deployment started. Monitor logs for completion.")
}
```

Common custom functions:
- `git_init()` - Initialize a git repo
- `run_tests()` - Run the test suite
- `build_project()` - Compile/build
- `deploy()` - Deploy to a server
- `start_server()` - Start a development server
- `lint_code()` - Run a linter
- `create_migration()` - Create a database migration

These are interpreted by Claude as requests to perform those tasks.

## Patterns: Combining Functions Effectively

### The Ask-Wait-Process Pattern (Revisited)

The foundation of most commands:

```stim
command core_pattern {
  ask("What do you want to do?")
  wait_for_response()
  
  ask("Processing your request...")
  wait_for_response()
  
  ask("Done! Here's the result:")
}
```

### Conditional with File Generation

Ask about needs, then generate files accordingly:

```stim
command setup {
  if (confirm("Set up testing?")) {
    ask("Creating test configuration...")
    create_file("jest.config.js", jest_config)
    create_file("test/example.test.js", example_test)
  }
  
  if (confirm("Set up CI/CD?")) {
    ask("Creating CI configuration...")
    create_file(".github/workflows/test.yml", github_actions)
  }
  
  ask("Setup complete!")
}
```

### Loop with Confirmation and File Output

Gather items in a loop, then write to file:

```stim
command list_builder {
  items = []
  adding = true
  
  while (adding) {
    ask("Add a list item:")
    wait_for_response()
    
    if (!confirm("Add another?")) {
      adding = false
    }
  }
  
  content = "# My List\n\n" + items.join("\n")
  create_file("list.md", content)
  
  ask("List saved to list.md")
}
```

### Progressive Disclosure with Custom Functions

Ask about details, then execute:

```stim
command configure {
  ask("API endpoint?")
  wait_for_response()
  
  ask("API key?")
  wait_for_response()
  
  ask("Default environment? (dev, staging, prod)")
  wait_for_response()
  
  setup_api_client()
  
  ask("API client configured!")
}
```

## How Functions Compile to Markdown

Understanding compilation helps you predict behavior.

An `ask()` compiles to markdown text:

```stim
ask("What's your name?")
```

Becomes:

```
Ask the user: "What's your name?"
```

A `confirm()` compiles to a yes/no prompt:

```stim
if (confirm("Deploy?")) {
  ask("Deploying")
}
```

Becomes:

```
Ask the user yes/no: "Deploy?"
If yes: Ask "Deploying"
If no: Skip to next statement
```

A `create_file()` compiles to a file creation instruction:

```stim
create_file("README.md", "# Title")
```

Becomes:

```
Create file: README.md
Content: # Title
```

The compiled `.md` file is human-readable and shows exactly what Claude will be asked to do.

## Exercise: Build an API Documentation Generator

Create a command called `apidocs` that:

1. Asks for the API name
2. Asks for the base URL
3. Asks if authentication is required
   - If yes, ask what type (API key, Bearer token, Basic auth, OAuth)
4. Loop until the user says no:
   - Ask for endpoint path (e.g., /api/users)
   - Ask for HTTP method (GET, POST, PUT, DELETE)
   - Ask for brief endpoint description
5. Create a file called `API.md` with all the information formatted as markdown

Here's a skeleton:

```stim
command apidocs {
  ask("API name?")
  wait_for_response()
  
  ask("Base URL?")
  wait_for_response()
  
  if (confirm("Requires authentication?")) {
    ask("Auth type? (API key, Bearer, Basic, OAuth)")
    wait_for_response()
  }
  
  // Loop to gather endpoints
  endpoints = []
  collecting = true
  
  while (collecting) {
    // Ask for endpoint details
    // Add to endpoints array
  }
  
  // Build the markdown content
  content = "# " + api_name + "\n\n..."
  
  // Create the file
  create_file("API.md", content)
  
  ask("API documentation created!")
}
```

Complete this command. When done, compile it and run `/apidocs`. Follow the prompts and verify the generated `API.md` file is well-formatted and complete.

Bonus: Add sections for request/response examples in the markdown.

---

**Key Takeaways:**

- `ask()` displays messages; use string literals or variables
- `wait_for_response()` pauses for user input
- `confirm()` asks yes/no questions for if conditions
- `create_file()` generates output files
- Custom functions are passed to Claude as-is
- Ask-wait-process is the core pattern
- Combine functions to build sophisticated workflows
- Compiled output is always readable markdown

**Next:** Learn how to spawn subagents with tasks to handle complex work in parallel.
