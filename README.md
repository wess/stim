# Spark ⚡

**A powerful DSL for building sophisticated Claude Code commands with control flow, variables, and complex logic.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 What is Spark?

Spark transforms the way you create Claude Code commands. Instead of writing complex, hard-to-maintain markdown instructions, you write clear, programmatic `.spark` files with loops, conditionals, and variables that compile into Claude-ready `.md` commands.

### The Problem
```markdown
<!-- Complex markdown with repetitive instructions -->
Ask me one question at a time so we can develop a spec...
Remember, only one question at a time...
Make sure to not be agreeable...
Once we are done, save the spec as SPEC.md...
Ask if the user wants to create a git repo...
```

### The Spark Solution
```spark
command brainstorm {
  questions = ["What problem?", "Who are users?", "What constraints?"]
  
  for question in questions {
    ask(question)
    wait_for_response()
  }
  
  while (!spec_complete) {
    ask("Next critical question?")
    if (confirm("Spec complete?")) {
      spec_complete = true
    }
  }
  
  if (confirm("Create GitHub repo?")) {
    git_init()
    create_file("SPEC.md", "generated_spec")
  }
}
```

## ✨ Key Features

- **🔄 Control Flow** - Loops, conditionals, and branching logic
- **📦 Variables** - Store and reuse data, arrays, and configurations  
- **💬 User Interaction** - Built-in primitives for asking questions and getting confirmation
- **📁 File Operations** - Create, read, and manipulate files programmatically
- **🎯 Type-Safe** - Built with TypeScript for reliability and great developer experience
- **⚡ Fast** - Powered by Bun for lightning-fast compilation
- **🛠️ Extensible** - Clean architecture ready for future enhancements

## 📦 Installation

### Prerequisites
- [Bun](https://bun.sh) (latest version)
- [Claude Code](https://claude.ai/code)

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd spark

# Install dependencies
bun install

# Verify installation
bun run dev --help
```

## 🏃‍♂️ Quick Start

1. **Create a `.spark` file:**
```spark
command hello {
  name = "World"
  ask("What's your name?")
  wait_for_response()
  ask("Hello, " + name + "! How are you today?")
}
```

2. **Compile to Claude command:**
```bash
bun run dev compile hello.spark
```

3. **Use in Claude Code:**
```bash
/hello
```

## 📖 Documentation

- **[Quickstart Guide](docs/Quickstart.md)** - Get up and running in 5 minutes
- **[Tutorial](docs/Tutorial.md)** - Step-by-step guide to building your first commands
- **[API Reference](docs/API.md)** - Complete syntax and function reference
- **[Examples](docs/Examples.md)** - Real-world command examples
- **[Syntax Guide](docs/Syntax-Reference.md)** - Complete language reference
- **[FAQ](docs/FAQ.md)** - Common questions and troubleshooting

## 💡 Example Commands

All your existing Claude commands, now in Spark:

- **[brainstorm.spark](examples/brainstorm.spark)** - Interactive spec development
- **[commit.spark](examples/commit.spark)** - Semantic commit workflow  
- **[plan.spark](examples/plan.spark)** - Project planning with phases
- **[session-summary.spark](examples/session-summary.spark)** - Session analysis
- **[security-review.spark](examples/security-review.spark)** - Security assessment
- **[recall.spark](examples/recall.spark)** - Context management system

## 🛠️ Development

### Commands
```bash
# Compile a .spark file
bun run dev compile examples/brainstorm.spark

# Build standalone executable
bun run build

# Run development mode
bun run dev
```

### Project Structure
```
spark/
├── src/
│   ├── types/           # Type definitions
│   ├── parser/          # .spark file parser
│   ├── compiler/        # Markdown generator
│   └── cli/             # Command-line interface
├── examples/            # Example .spark commands
├── docs/               # Documentation
└── dist/               # Built executable
```

## 🔧 Language Overview

### Basic Syntax
```spark
command mycommand {
  // Variables
  name = "value"
  items = ["a", "b", "c"]
  flag = true
  
  // Control flow
  for item in items {
    ask(item)
    wait_for_response()
  }
  
  // Conditionals
  if (flag) {
    create_file("output.md", "content")
  }
  
  // User interaction
  if (confirm("Continue?")) {
    ask("What's next?")
  }
}
```

### Built-in Functions
- **User Interaction:** `ask()`, `confirm()`, `wait_for_response()`
- **File Operations:** `create_file()`, `read_file()`, `append_file()`
- **Git Operations:** `git_init()`, `git_commit()`, `git_push()`
- **GitHub Integration:** `github_create_repo()`, `github_create_pr()`

## 🌟 Why Spark?

| **Traditional Markdown** | **Spark** |
|-------------------------|-----------|
| Hard to maintain complex logic | Clean, readable control flow |
| Repetitive instructions | Reusable variables and loops |
| No error checking | Type-safe compilation |
| Difficult to version control | Git-friendly source code |
| Manual updates everywhere | Single source of truth |

## 🚧 Roadmap

### v1.1 (Next)
- [ ] Import system for code reuse
- [ ] Standard library of common patterns
- [ ] Better error messages with line numbers
- [ ] String interpolation support

### v2.0 (Future)
- [ ] Package manager for sharing commands
- [ ] Multi-file projects
- [ ] Template system
- [ ] IDE extensions

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](docs/Contributing.md) for guidelines.

### Development Setup
```bash
git clone <repository-url>
cd spark
bun install
bun run dev compile examples/brainstorm.spark
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Bun](https://bun.sh) for performance
- Designed for [Claude Code](https://claude.ai/code) integration
- Inspired by the need for better command automation

---

**Ready to spark your Claude Code workflow?** [Get started with our tutorial](docs/Tutorial.md) 🚀
