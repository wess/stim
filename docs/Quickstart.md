# Quickstart Guide

Get up and running with Stim in 5 minutes.

## Prerequisites

- [Bun](https://bun.sh) installed
- [Claude Code](https://claude.ai/code) setup
- Basic familiarity with command-line tools

## Step 1: Installation

```bash
# Clone and setup
git clone <repository-url>
cd stim
bun install

# Verify it works
bun run dev --help
```

You should see the Stim CLI help output.

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

## Step 3: Compile to Claude Command

```bash
# Build the project first
bun run build

# Compile the .stim file using the standalone executable
./dist/stim compile hello.stim

# This creates ~/.claude/commands/hello.md
```

You should see:
```
✓ Compiled hello.stim → /Users/yourusername/.claude/commands/hello.md
Command: /hello
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
bun run build
./dist/stim compile quickplan.stim
# Use with: /quickplan
```

## What's Next?

- **[Tutorial](Tutorial.md)** - Comprehensive step-by-step guide
- **[API Reference](API.md)** - Complete syntax documentation
- **[Examples](Examples.md)** - Real-world command examples

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