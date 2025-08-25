# Spark Language Support for VS Code

Official VS Code extension for the Spark DSL - syntax highlighting, snippets, and compilation support for `.spark` files.

## Features

- **Syntax Highlighting** - Full syntax highlighting for Spark language constructs
- **Code Snippets** - Pre-built snippets for common Spark patterns
- **Compilation Support** - Compile `.spark` files directly from VS Code
- **Error Detection** - Basic syntax error detection and highlighting
- **Command Templates** - Quick creation of new Spark commands

## Installation

### From VSIX (Recommended)
1. Download the latest `.vsix` file from the releases
2. Open VS Code
3. Go to Extensions (Ctrl+Shift+X)
4. Click "..." menu → "Install from VSIX..."
5. Select the downloaded `.vsix` file

### From Source
```bash
# Clone and build
git clone <repository-url>
cd spark/plugins/vscode
npm install
npm run compile

# Package extension
npm install -g vsce
vsce package

# Install the generated .vsix file
```

## Usage

### Syntax Highlighting

The extension automatically provides syntax highlighting for `.spark` files with support for:

- **Keywords**: `command`, `if`, `else`, `for`, `while`, `in`, `break`
- **Built-in Functions**: `ask()`, `confirm()`, `wait_for_response()`, `create_file()`
- **String Literals**: Both `"double"` and `'single'` quoted strings
- **Comments**: `// Line comments`
- **Operators**: `+`, `==`, `!=`, `&&`, `||`, `!`
- **Arrays**: `[item1, item2, item3]`

### Code Snippets

Type these prefixes and press Tab to expand:

| Prefix | Description |
|--------|-------------|
| `command` | Create a new Spark command |
| `ask` | Ask question and wait for response |
| `confirm` | Ask for user confirmation |
| `for` | Create a for loop |
| `while` | Create a while loop |
| `if` | Create an if statement |
| `ifelse` | Create an if-else statement |
| `var` | Create a variable assignment |
| `array` | Create an array assignment |
| `createfile` | Create a file |
| `survey` | Create an interactive survey |
| `features` | Create a feature selection workflow |
| `git` | Create a git workflow |

### Commands

Access these commands via Command Palette (Ctrl+Shift+P):

- **Spark: Compile Spark File** (`Ctrl+Shift+B`) - Compile the current `.spark` file
- **Spark: Compile and Test in Claude Code** - Compile and show command to run
- **Spark: New Spark Command** - Create a new command template

### Context Menu

Right-click on any `.spark` file in the editor or explorer:
- **Compile Spark File** - Compile the selected file
- **Compile and Test in Claude Code** - Compile and get run instructions

### Error Detection

The extension provides basic syntax error detection:
- Unclosed string literals
- Invalid assignment syntax  
- Unmatched braces
- Real-time error highlighting as you type

## Requirements

- **VS Code** 1.80.0 or later
- **Bun** installed on your system
- **Spark project** with `bun run dev compile` command available

## Extension Settings

Currently no configurable settings. The extension works out-of-the-box.

## Known Issues

- Advanced semantic analysis not yet implemented
- Error detection is basic and may miss some edge cases
- Auto-completion for variables not yet supported

## Development

### Setup
```bash
cd plugins/vscode
npm install
npm run compile
```

### Testing
```bash
# Launch extension development host
code --extensionDevelopmentPath=.
```

### Package
```bash
vsce package
```

## Release Notes

### 1.0.0
- Initial release
- Syntax highlighting for all Spark language constructs
- Code snippets for common patterns
- Compilation support with error handling
- Basic syntax error detection
- Command templates and context menu integration

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make changes in `plugins/vscode/`
4. Test with extension development host
5. Submit a pull request

## License

MIT - see LICENSE file for details