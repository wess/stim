# Stim Language Support for VS Code

VS Code extension for the Stim DSL -- syntax highlighting, snippets, and compilation support for `.stim` files.

## Features

- **Syntax Highlighting** -- keywords, functions, strings, operators, agent types
- **Code Snippets** -- pre-built snippets for commands, tasks, parallel blocks, loops, and more
- **Compilation Support** -- compile `.stim` files directly from VS Code
- **Error Detection** -- real-time syntax error highlighting
- **Command Templates** -- quickly create new Stim commands

## Installation

### From VSIX
1. Download the latest `.vsix` file from releases
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X)
4. Click "..." menu -> "Install from VSIX..."
5. Select the downloaded file

### From Source
```bash
cd plugins/vscode
npm install
npm run compile
npm install -g vsce
vsce package
# Install the generated .vsix file
```

## Syntax Highlighting

Automatic highlighting for all `.stim` constructs:

- **Keywords**: `command`, `if`, `else`, `for`, `while`, `in`, `break`, `task`, `parallel`
- **Agent Types**: `bash`, `explore`, `plan`, `general`
- **Built-in Functions**: `ask()`, `confirm()`, `wait_for_response()`, `create_file()`
- **Strings**: `"double"` and `'single'` quoted
- **Comments**: `// line comments`
- **Operators**: `+`, `==`, `!=`, `&&`, `||`, `!`
- **Arrays**: `["a", "b", "c"]`

## Code Snippets

Type a prefix and press Tab:

| Prefix | Description |
|--------|-------------|
| `command` | New command |
| `ask` | Ask question and wait |
| `confirm` | Confirmation block |
| `for` | For loop |
| `while` | While loop |
| `if` | If statement |
| `ifelse` | If-else statement |
| `var` | Variable assignment |
| `array` | Array assignment |
| `createfile` | Create a file |
| `task` | Inline task |
| `taskagent` | Task with agent type picker |
| `taskfile` | File reference task |
| `parallel` | Parallel block with two tasks |
| `survey` | Interactive survey pattern |
| `features` | Feature selection pattern |
| `git` | Git workflow pattern |

## Commands

Access via Command Palette (Ctrl+Shift+P):

- **Stim: Compile Stim File** (Ctrl+Shift+B) -- compile the current `.stim` file
- **Stim: Compile and Test in Claude Code** -- compile and copy the slash command
- **Stim: New Stim Command** -- create a new command from a template

## Context Menu

Right-click any `.stim` file in the editor or explorer:

- **Compile Stim File**
- **Compile and Test in Claude Code**

## Error Detection

Real-time detection of:
- Unclosed string literals
- Invalid assignment syntax
- Unmatched braces

## Requirements

- VS Code 1.80.0+
- [Bun](https://bun.sh) installed
- Stim project with `bun run build` available

## Development

```bash
cd plugins/vscode
npm install
npm run compile

# Launch extension development host
code --extensionDevelopmentPath=.
```

## License

MIT
