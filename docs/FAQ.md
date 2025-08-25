# Spark FAQ

Frequently asked questions and troubleshooting guide for Spark.

## Table of Contents

1. [General Questions](#general-questions)
2. [Installation & Setup](#installation--setup)
3. [Syntax & Language](#syntax--language)
4. [Compilation](#compilation)
5. [Claude Code Integration](#claude-code-integration)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Usage](#advanced-usage)

## General Questions

### What is Spark?

Spark is a Domain-Specific Language (DSL) for creating sophisticated Claude Code commands. Instead of writing complex markdown instructions, you write `.spark` files with variables, loops, and conditionals that compile to Claude-executable `.md` commands.

### Why use Spark instead of writing markdown directly?

**Traditional markdown approach:**
```markdown
Ask me one question at a time...
Remember, only one question at a time...
If the user says they want option A, do this...
If the user says they want option B, do that...
```

**Spark approach:**
```spark
command interactive {
  for question in questions {
    ask(question)
    wait_for_response()
  }
  
  if (confirm("Want option A?")) {
    handle_option_a()
  }
}
```

Benefits:
- **Maintainable**: Easy to modify and extend
- **Reusable**: Variables and loops eliminate repetition
- **Version-controllable**: Clean, readable source code
- **Debuggable**: Clear logic flow and error checking

### Is Spark only for Claude Code?

Currently yes, but the architecture is extensible. Future versions could target other LLM platforms.

### Do I need to know programming to use Spark?

Basic programming concepts help, but Spark is designed to be approachable:
- Variables store data: `name = "John"`
- Loops repeat actions: `for item in items { ask(item) }`
- Conditions make decisions: `if (confirm("Ready?")) { ... }`

The [Tutorial](Tutorial.md) walks through everything step-by-step.

## Installation & Setup

### What are the prerequisites?

- [Bun](https://bun.sh) - JavaScript runtime (latest version)
- [Claude Code](https://claude.ai/code) - For executing compiled commands
- Basic command-line familiarity

### How do I install Spark?

```bash
# Clone the repository
git clone <repository-url>
cd spark

# Install dependencies  
bun install

# Verify installation
bun run dev --help
```

### Where do compiled commands go?

Compiled `.md` files are created in `~/.claude/commands/`:

```bash
bun run dev compile hello.spark
# Creates ~/.claude/commands/hello.md
# Use with: /hello
```

### Can I change the output directory?

Not currently, but this is planned for a future version. Commands must be in `~/.claude/commands/` for Claude Code to recognize them.

## Syntax & Language

### What's the basic syntax?

```spark
command name {
  // Variables
  text = "Hello"
  items = ["a", "b", "c"]
  flag = true
  
  // Control flow
  for item in items {
    ask(item)
  }
  
  if (flag) {
    ask("Flag is true!")
  }
  
  // Functions
  create_file("output.txt", "content")
}
```

### How do I handle strings with quotes?

Use escape sequences or alternate quote styles:

```spark
// Escape quotes
message = "She said \"Hello\" to me"
message = 'He\'s here'

// Alternate quotes  
message = "He's here"
message = 'She said "Hello" to me'
```

### Can I use multi-line strings?

Not directly. Use string concatenation:

```spark
long_message = "This is line one " +
               "and this is line two " + 
               "and this continues here"
```

### How do arrays work?

Arrays store multiple string values:

```spark
items = ["first", "second", "third"]

// Use in loops
for item in items {
  ask(item)
}

// Convert to string  
text = items.join(", ")  // "first, second, third"
```

### What about variable scope?

Variables are scoped to the entire command:

```spark
command scope_example {
  name = "initial"
  
  if (true) {
    name = "changed"      // Modifies existing variable
    new_var = "created"   // Creates new variable
  }
  
  ask(name)              // "changed"
  ask(new_var)           // "created" - available here
}
```

### Are there data types?

Spark has three main types:
- **String**: `"text"` or `'text'`
- **Boolean**: `true` or `false`  
- **Array**: `["item1", "item2"]`

Numbers are treated as strings: `count = "42"`

## Compilation

### How does compilation work?

Spark parses your `.spark` file and generates equivalent Claude Code markdown:

```spark
ask("What's your name?")
```

Compiles to:
```markdown
Ask the user: "What's your name?"
```

### What happens to variables in compilation?

Variables become instructions in the compiled markdown:

```spark
name = "John"
ask("Hello " + name)
```

Compiles to:
```markdown
Set name = John
Ask the user: "Hello John"
```

### Can I see the compiled output before using it?

Yes! Check the generated `.md` file:

```bash
bun run dev compile example.spark
cat ~/.claude/commands/example.md
```

### What if compilation fails?

Common compilation errors:

```bash
# Syntax error
Compilation error: Invalid assignment: name =

# Missing file
Error: File not found: /path/to/file.spark

# Permission issue  
Error: Could not write to ~/.claude/commands/
```

See [Troubleshooting](#troubleshooting) for solutions.

## Claude Code Integration

### How do I use a compiled command?

After compilation, use the command name with a forward slash:

```bash
bun run dev compile hello.spark
# Creates ~/.claude/commands/hello.md

# In Claude Code:
/hello
```

### What if Claude Code doesn't recognize my command?

1. **Check file location**: Ensure `.md` file exists in `~/.claude/commands/`
2. **Restart Claude Code**: Sometimes needed to recognize new commands
3. **Check permissions**: Verify Claude Code can read the commands directory
4. **Verify syntax**: Look at the generated `.md` file for issues

### Can I override existing Claude commands?

Yes, but be careful. If you create a command with the same name as a built-in Claude command, your version will override it.

### How do I organize many commands?

Use descriptive names and consider prefixes:

```spark
// Development workflow commands
command dev_setup { }
command dev_deploy { }
command dev_review { }

// Project management commands  
command pm_planning { }
command pm_retrospective { }
```

## Troubleshooting

### "Command not found" error

**Problem**: `/mycommand` doesn't work in Claude Code

**Solutions**:
1. Verify file exists: `ls ~/.claude/commands/mycommand.md`
2. Check file contents: `cat ~/.claude/commands/mycommand.md`
3. Restart Claude Code
4. Try recompiling: `bun run dev compile mycommand.spark`

### Compilation syntax errors

**Problem**: `Invalid assignment: name =`

**Solution**: Check your syntax:
```spark
// Wrong
name =

// Right  
name = "value"
```

**Problem**: `Invalid ask statement: ask(unclosed string"`

**Solution**: Close your strings:
```spark
// Wrong
ask("Hello world"

// Right
ask("Hello world")
```

### Variables not working as expected

**Problem**: Variables showing up literally instead of their values

**Check your usage**:
```spark
// This works for string literals
ask("Hello, world!")

// This works for variables  
ask(user_name)

// This works for concatenation
ask("Hello, " + user_name)
```

### Array issues  

**Problem**: Array not iterating correctly

**Solution**: Check array syntax:
```spark
// Wrong
items = "a", "b", "c"

// Right
items = ["a", "b", "c"]

for item in items {
  ask(item)
}
```

### File creation problems

**Problem**: `create_file` not working

**Check the syntax**:
```spark
// Wrong
create_file(filename, content)

// Right - both parameters must be strings
create_file("filename.txt", "content here")
create_file("output.md", template_variable)
```

### Performance issues

**Problem**: Commands running slowly

**Causes**:
- Very long loops
- Complex nested conditions
- Large arrays

**Solutions**:
- Break large tasks into smaller commands
- Use more specific conditions
- Consider if the logic could be simplified

## Advanced Usage

### Can I import other Spark files?

Not in v1.0, but planned for v1.1:

```spark
// Future syntax
import "common/helpers.spark" as helpers
import "std/git.spark" as git
```

### How do I create reusable patterns?

Currently, use consistent naming and copy successful patterns:

```spark
// Reusable confirmation pattern
if (confirm("Are you sure?")) {
  if (confirm("Really sure? This can't be undone.")) {
    dangerous_action()
  }
}

// Reusable multi-choice pattern
options = ["Option A", "Option B", "Option C"]
ask("Choose an option: " + options.join(", "))
```

### Can I debug Spark commands?

**During development**:
1. Compile and check the generated `.md` file
2. Test with simple inputs first
3. Add temporary `ask()` statements to trace execution

**During execution**:
- Claude Code shows each step as it executes
- You can interrupt execution anytime
- Variables and state are visible in Claude's responses

### How do I handle complex business logic?

Break it into phases:

```spark
command complex_workflow {
  // Phase 1: Gather information
  ask("Project requirements?")
  wait_for_response()
  
  // Phase 2: Make decisions
  if (confirm("Use advanced features?")) {
    advanced_setup()
  }
  
  // Phase 3: Generate outputs
  create_file("config.json", "configuration")
  
  // Phase 4: Next steps
  ask("Setup complete! Next: run npm install")
}
```

### What about error handling?

Currently limited, but you can add validation:

```spark
command validated_input {
  ask("Enter a number between 1-10")
  wait_for_response()
  
  // Manual validation through confirmation
  if (!confirm("Is this number between 1-10?")) {
    ask("Please try again with a valid number")
    wait_for_response()
  }
}
```

### How do I contribute to Spark?

See [Contributing.md](Contributing.md) for:
- Development setup
- Code style guidelines  
- How to submit issues and PRs
- Testing procedures

---

**Still have questions?**
- Check the [Tutorial](Tutorial.md) for step-by-step guidance
- Browse [Examples](Examples.md) for real-world patterns
- File an issue on GitHub for bugs or feature requests