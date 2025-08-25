# Stim Tutorial

A comprehensive guide to building sophisticated Claude Code commands with Stim.

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Concepts](#basic-concepts)
3. [Your First Command](#your-first-command)
4. [Working with Variables](#working-with-variables)
5. [Control Flow](#control-flow)
6. [User Interaction](#user-interaction)
7. [File Operations](#file-operations)
8. [Building a Complete Command](#building-a-complete-command)
9. [Advanced Techniques](#advanced-techniques)
10. [Best Practices](#best-practices)

## Introduction

This tutorial will teach you how to build powerful Claude Code commands using Stim. By the end, you'll be able to create complex, interactive workflows that automate your development tasks.

### What We'll Build

We're going to build a comprehensive code review command that:
- Asks questions about the code to review
- Performs different types of analysis based on responses
- Generates structured reports
- Creates follow-up tasks

## Basic Concepts

### Commands
Every Stim file defines a single command:

```stim
command mycommand {
  // Your logic here
}
```

### Statements
Commands contain statements that execute in order:

```stim
command example {
  ask("What's your name?")          // Statement 1
  wait_for_response()               // Statement 2
  create_file("output.txt", "Hi!")  // Statement 3
}
```

### Compilation
Stim compiles your `.stim` file into a `.md` file that Claude Code can execute:

```bash
bun run build && ./dist/stim compile mycommand.stim
# Creates ~/.claude/commands/mycommand.md
```

## Your First Command

Let's start with a simple greeting command:

```stim
command greet {
  ask("What's your name?")
  wait_for_response()
  ask("Hello! What can I help you with today?")
}
```

**Save this as `greet.stim` and compile:**

```bash
bun run build && ./dist/stim compile greet.stim
```

**Test it in Claude Code:**
```
/greet
```

Claude will ask for your name, wait for your response, then greet you.

## Working with Variables

Variables store data you can reuse throughout your command:

### Basic Variables

```stim
command variables_demo {
  project_name = "My Awesome Project"
  version = "1.0.0"
  is_production = true
  
  ask("Working on " + project_name + " version " + version)
}
```

### Arrays

Arrays store multiple values:

```stim
command array_demo {
  languages = ["JavaScript", "TypeScript", "Python", "Rust"]
  
  ask("Which language do you prefer? Options: " + languages.join(", "))
  wait_for_response()
}
```

### Variable Types

```stim
command types_demo {
  // String
  name = "Stim"
  
  // Number (treated as string in current version)
  port = "3000"
  
  // Boolean
  debug = true
  
  // Array
  items = ["a", "b", "c"]
}
```

## Control Flow

Control flow lets you create dynamic, responsive commands.

### Conditionals

```stim
command conditional_demo {
  ask("Are you working on a new project?")
  wait_for_response()
  
  if (confirm("Is this a web application?")) {
    ask("What frontend framework are you using?")
    wait_for_response()
  }
}
```

### Loops

#### For Loops
Iterate over arrays:

```stim
command for_loop_demo {
  tasks = ["Setup environment", "Write code", "Test", "Deploy"]
  
  for task in tasks {
    if (confirm("Have you completed: " + task + "?")) {
      ask("Great! Any notes on " + task + "?")
      wait_for_response()
    }
  }
}
```

#### While Loops
Continue until a condition is met:

```stim
command while_loop_demo {
  questions_complete = false
  
  while (!questions_complete) {
    ask("What's your next question about the project?")
    wait_for_response()
    
    if (confirm("Do you have more questions?")) {
      questions_complete = false
    } else {
      questions_complete = true
    }
  }
}
```

## User Interaction

Stim provides several ways to interact with users:

### Ask Questions

```stim
ask("What's your preferred programming language?")
ask(variable_containing_question)
```

### Get Confirmation

```stim
if (confirm("Do you want to proceed?")) {
  ask("Great! Let's continue.")
}
```

### Wait for Responses

```stim
ask("Please describe your requirements")
wait_for_response()
ask("Based on your input, here's what I recommend...")
```

## File Operations

Create files as part of your workflow:

```stim
command file_demo {
  ask("What should I name the new file?")
  wait_for_response()
  
  create_file("README.md", "project_readme_template")
  create_file("package.json", "package_template")
  
  ask("Created your project files!")
}
```

## Building a Complete Command

Let's build a comprehensive code review command that showcases all Stim features:

```stim
command code_review {
  // Configuration
  review_types = [
    "Security vulnerabilities",
    "Performance issues", 
    "Code style and formatting",
    "Architecture and design",
    "Testing coverage",
    "Documentation"
  ]
  
  // Gather basic information
  ask("What files or directories should I review?")
  wait_for_response()
  
  ask("What's the primary language/framework of this code?")
  wait_for_response()
  
  // Select review types
  selected_reviews = []
  
  for review_type in review_types {
    if (confirm("Include " + review_type + " in the review?")) {
      ask("Any specific focus areas for " + review_type + "?")
      wait_for_response()
    }
  }
  
  // Perform the review
  ask("Starting comprehensive code review...")
  
  // Security check
  if (confirm("Should I check for common security issues?")) {
    security_checks = [
      "SQL injection vulnerabilities",
      "XSS attack vectors",
      "Authentication/authorization flaws",
      "Sensitive data exposure"
    ]
    
    for check in security_checks {
      ask("Checking for: " + check)
      wait_for_response()
    }
  }
  
  // Performance analysis
  if (confirm("Analyze performance bottlenecks?")) {
    ask("Looking for inefficient algorithms, database queries, and resource usage...")
    wait_for_response()
  }
  
  // Generate report
  ask("Analyzing code structure and generating detailed report...")
  wait_for_response()
  
  create_file("CODE_REVIEW_REPORT.md", "code_review_template")
  
  // Follow-up actions
  if (confirm("Create follow-up tasks for issues found?")) {
    ask("What's your preferred task format? (GitHub issues, Jira tickets, etc.)")
    wait_for_response()
    
    create_file("REVIEW_TASKS.md", "task_list_template")
  }
  
  // Summary
  ask("Code review complete! Check CODE_REVIEW_REPORT.md for detailed findings.")
  
  if (confirm("Would you like me to prioritize the most critical issues?")) {
    ask("Here are the top 3 issues that need immediate attention:")
    wait_for_response()
  }
}
```

**Compile and test:**

```bash
bun run build && ./dist/stim compile code_review.stim
# Use with: /code_review
```

## Advanced Techniques

### Dynamic Questions

Use variables to create dynamic questions:

```stim
command dynamic_demo {
  user_type = "developer"
  
  if (user_type == "developer") {
    technical_questions = [
      "What's your preferred IDE?",
      "Do you use version control?", 
      "What testing framework do you use?"
    ]
  }
  
  for question in technical_questions {
    ask(question)
    wait_for_response()
  }
}
```

### Nested Conditions

Create complex decision trees:

```stim
command nested_demo {
  if (confirm("Are you building a web app?")) {
    if (confirm("Is it a single-page application?")) {
      ask("React, Vue, or Angular?")
    } else {
      ask("Server-side rendering framework?")
    }
  } else {
    if (confirm("Is it a mobile app?")) {
      ask("Native or cross-platform?")
    }
  }
}
```

### Template Generation

Create structured content:

```stim
command template_demo {
  ask("What's the project name?")
  wait_for_response()
  
  ask("Brief description?")
  wait_for_response()
  
  // Create multiple related files
  create_file("README.md", "readme_template")
  create_file("CONTRIBUTING.md", "contributing_template")  
  create_file("package.json", "package_template")
  
  ask("Project structure created! Ready to start coding?")
}
```

## Best Practices

### 1. Use Descriptive Variable Names

```stim
// Good
deployment_environments = ["staging", "production"]
user_confirmation_required = true

// Avoid
envs = ["staging", "production"]
flag = true
```

### 2. Break Complex Logic into Steps

```stim
// Good - clear steps
command deploy {
  // Step 1: Validate
  if (confirm("Run tests first?")) {
    run_tests()
  }
  
  // Step 2: Select environment
  environments = ["staging", "production"]
  for env in environments {
    if (confirm("Deploy to " + env + "?")) {
      deploy_to_environment(env)
    }
  }
  
  // Step 3: Verify
  ask("Deployment complete! Please verify the application is working.")
}
```

### 3. Provide Clear User Feedback

```stim
// Good - tells user what's happening
ask("Analyzing your codebase for security vulnerabilities...")
wait_for_response()

ask("Found 3 potential issues. Generating detailed report...")
wait_for_response()

// Avoid - unclear what's happening
ask("Processing...")
```

### 4. Handle Edge Cases

```stim
command robust_demo {
  if (confirm("Do you have a package.json file?")) {
    ask("Great! I'll analyze your dependencies.")
  } else {
    ask("No package.json found. Should I create one for you?")
    if (confirm("Create package.json?")) {
      create_file("package.json", "basic_package_template")
    }
  }
}
```

### 5. Use Consistent Naming

```stim
// Good - consistent naming pattern
command project_setup {
  project_name = "my-project"
  project_type = "web-app"
  project_language = "typescript"
}

// Avoid - inconsistent naming
command project_setup {
  name = "my-project"
  type_of_project = "web-app"  
  lang = "typescript"
}
```

## Next Steps

Now that you understand Stim fundamentals:

1. **Explore Examples**: Check out the `examples/` directory for real-world commands
2. **Read the API Reference**: Learn about all available functions in [API.md](API.md)
3. **Build Your Own**: Start converting your existing Claude commands to Stim
4. **Contribute**: Help improve Stim by contributing examples or features

## Troubleshooting

### Common Errors

**Syntax Error: Expected }**
- Check that every `{` has a matching `}`
- Verify proper nesting of control structures

**Compilation Failed: Invalid assignment**
- Make sure strings are quoted: `name = "value"`
- Arrays need square brackets: `items = ["a", "b"]`

**Command not found in Claude Code**
- Verify the `.md` file was created in `~/.claude/commands/`
- Restart Claude Code if needed
- Check that your command name matches the file name

### Getting Help

- **[FAQ](FAQ.md)** - Common questions and solutions
- **[Syntax Reference](Syntax-Reference.md)** - Complete language documentation
- **GitHub Issues** - Report bugs or request features

---

**🎉 You're now ready to build powerful Claude Code commands with Stim!** Start by converting one of your existing commands, or create something entirely new.