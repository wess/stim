# Stim Language Support for Zed

[Zed](https://zed.dev) extension for the Stim DSL -- syntax highlighting, indentation, and bracket matching for `.stim` files.

## Features

- **Syntax Highlighting** -- keywords, agent types, functions, strings, comments, operators
- **Smart Indentation** -- auto-indent after `{`, auto-dedent on `}`
- **Bracket Matching** -- auto-close `{}`, `[]`, `()`, quotes
- **Comment Toggle** -- `//` line comments via Cmd+/

## Installation

### From Zed Extensions (when published)

1. Open Zed
2. Open the Extensions panel (Cmd+Shift+X)
3. Search for "Stim"
4. Click Install

### From Source

The extension requires a compiled tree-sitter grammar. To build:

1. Install [tree-sitter-cli](https://github.com/tree-sitter/tree-sitter/tree/master/cli):
   ```bash
   npm install -g tree-sitter-cli
   ```

2. Generate the parser from `grammars/grammar.js`:
   ```bash
   cd plugins/zed/grammars
   tree-sitter generate
   ```

3. Copy or symlink the extension directory to your Zed extensions folder:
   ```bash
   ln -s $(pwd)/plugins/zed ~/.config/zed/extensions/installed/stim
   ```

4. Restart Zed.

## Highlighted Constructs

- **Keywords**: `command`, `if`, `else`, `for`, `while`, `in`, `break`, `task`, `parallel`
- **Agent Types**: `bash`, `explore`, `plan`, `general`
- **Built-in Functions**: `ask()`, `confirm()`, `wait_for_response()`, `create_file()`
- **Strings**: `"double"` and `'single'` quoted with escape sequences
- **Comments**: `// line comments`
- **Operators**: `+`, `==`, `!=`, `&&`, `||`, `!`, `=`

## File Structure

```
zed/
├── extension.toml              # Extension manifest
├── grammars/
│   └── grammar.js              # Tree-sitter grammar source
└── languages/
    └── stim/
        ├── config.toml         # Language configuration
        ├── highlights.scm      # Syntax highlighting queries
        └── indents.scm         # Indentation rules
```

## Tree-sitter Grammar

The `grammars/grammar.js` file defines the full Stim grammar for tree-sitter, covering:

- Command declarations
- Variable assignments
- Control flow (`if`/`else`, `while`, `for`, `break`)
- Task statements (inline, with agent type, file references)
- Parallel blocks
- Function calls
- Expressions (strings, booleans, arrays, operators)
- Comments

To publish the grammar as a standalone tree-sitter package, copy `grammar.js` into a new `tree-sitter-stim` repository and run `tree-sitter generate`.

## License

MIT
