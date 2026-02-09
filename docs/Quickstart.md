# Quickstart Guide

Get up and running with Stim in 5 minutes.

## Prerequisites

- [Claude Code](https://claude.ai/code) setup
- Basic familiarity with command-line tools

## Step 1: Installation

**Quick install:**
```bash
curl -fsSL https://raw.githubusercontent.com/wess/stim/main/install.sh | sh
```

**Or via Homebrew:**
```bash
brew install wess/packages/stim
```

Verify it works:
```bash
stim version
```

## Step 2: Your First Command

Create a simple `.stim` file:

```bash
# Create hello.stim
cat > hello.stim << 'EOF'
command hello {
  ask("What's your name?")
  wait_for_response()
  
  ask("Nice to meet you! What would you like to work on today?")
  wait_for_response()
  
  if (confirm("Ready to get started?")) {
    ask("Let's build something amazing!")
  }
}
EOF
```

## Step 3: Install as a Claude Command

```bash
stim install hello.stim
```

This compiles and places the output in `~/.claude/commands/hello.md`. Use `--local` to install to the current project instead.

To compile without installing (outputs to `dist/`):
```bash
stim compile hello.stim
```

## Step 4: Use Your Command

In Claude Code, type:
```
/hello
```

Claude will now execute your interactive command workflow!

## Step 5: Try a More Complex Example

Let's create a project planning command:

```stim
command quickplan {
  features = [
    "User authentication",
    "Data storage", 
    "API endpoints",
    "Frontend interface"
  ]
  
  ask("What are you building?")
  wait_for_response()
  
  ask("What's your tech stack preference?")
  wait_for_response()
  
  for feature in features {
    if (confirm("Do you need: " + feature + "?")) {
      ask("Any specific requirements for " + feature + "?")
      wait_for_response()
    }
  }
  
  create_file("PROJECT_PLAN.md", "project_plan_template")
  
  ask("Created your project plan! Ready to start implementing?")
}
```

Compile and use it:
```bash
stim install quickplan.stim
# Use with: /quickplan
```

## Step 6: Try a Task

Spawn a subagent to handle a subtask:

```stim
command analyze {
  task explore "find all API endpoints" {
    ask("Search the codebase and list every API endpoint")
    wait_for_response()
  }

  ask("Analysis complete!")
}
```

Or run multiple tasks in parallel:

```stim
command full_scan {
  parallel {
    task explore "check frontend" {
      ask("What frontend frameworks and patterns are used?")
    }
    task explore "check backend" {
      ask("What backend frameworks and patterns are used?")
    }
  }
}
```

## What's Next?

- **[Tutorial](Tutorial.md)** - Comprehensive guide covering variables, control flow, tasks, and parallel execution
- **[API Reference](API.md)** - Complete syntax documentation
- **[Examples](Examples.md)** - Real-world command examples including multi-agent workflows

## Common Issues

### Command Not Found
If `/hello` doesn't work in Claude Code:
1. Check that the file was created: `ls ~/.claude/commands/hello.md`
2. Restart Claude Code
3. Verify your `.claude/commands/` directory exists

### Compilation Errors
Most common issues:
- **Missing quotes**: Use `"string"` not `string`
- **Unclosed braces**: Every `{` needs a matching `}`
- **Invalid syntax**: Check the [Syntax Reference](Syntax-Reference.md)

### Getting Help
- Check [FAQ](FAQ.md) for common questions
- Look at working [examples](../examples/)
- File an issue if you find a bug

---

**🎉 Congratulations!** You've created your first Stim command. Now explore the [full tutorial](Tutorial.md) to learn advanced features.