# Stim Editor Plugins

Editor plugins for the Stim DSL, providing syntax highlighting, compilation support, and IDE features.

## Available Plugins

- **[VS Code](vscode/)** -- full-featured extension with snippets, diagnostics, and compilation
- **[Neovim](neovim/)** -- plugin with syntax highlighting, text objects, templates, and quickfix
- **[Zed](zed/)** -- extension with tree-sitter grammar, highlighting, and indentation

## Quick Start

### VS Code

#### Pre-built
1. Download the latest `.vsix` from releases
2. Open VS Code
3. Run: `Extensions: Install from VSIX...`
4. Select the file

#### From Source
```bash
cd plugins/vscode
npm install
npm run compile
npm run package    # Creates stim-lang-1.0.0.vsix
```

### Neovim

#### vim-plug
```vim
Plug 'user/stim', {'rtp': 'plugins/neovim'}
```

#### packer.nvim
```lua
use {
  'user/stim',
  rtp = 'plugins/neovim'
}
```

#### lazy.nvim
```lua
{
  'user/stim',
  dir = 'plugins/neovim',
  ft = 'stim',
}
```

#### Manual
```bash
cp -r plugins/neovim ~/.config/nvim/pack/plugins/start/stim
```

### Zed

#### From Extensions panel (when published)
1. Open Zed
2. Extensions panel (Cmd+Shift+X)
3. Search for "Stim"
4. Install

#### From Source
```bash
cd plugins/zed/grammars
npm install -g tree-sitter-cli
tree-sitter generate
ln -s $(pwd)/plugins/zed ~/.config/zed/extensions/installed/stim
```

## Features

All plugins provide:

### Syntax Highlighting
- Keywords: `command`, `if`, `else`, `for`, `while`, `in`, `break`, `task`, `parallel`
- Agent types: `bash`, `explore`, `plan`, `general`
- Built-in functions, strings, comments, operators, arrays
- Error detection (VS Code, Neovim)

### Compilation Support (VS Code, Neovim)
- Compile `.stim` files directly from the editor
- Error reporting in the problems panel / quickfix window

### Code Intelligence (VS Code, Neovim)
- Code snippets for commands, tasks, parallel blocks, loops
- Auto-completion for keywords, agent types, and functions
- Smart indentation and bracket matching

## Building

### VS Code
```bash
cd plugins/vscode
npm install
npm run compile
npm run package
```

### Neovim
No build required -- VimScript runs directly.

### Zed
```bash
cd plugins/zed/grammars
tree-sitter generate
```

## Plugin Structure

```
plugins/
├── vscode/
│   ├── src/extension.ts              # Extension code
│   ├── syntaxes/stim.tmLanguage.json # TextMate grammar
│   ├── snippets/stim.json            # Code snippets
│   ├── language-configuration.json   # Language config
│   └── package.json                  # Extension manifest
├── neovim/
│   ├── plugin/stim.vim               # Main plugin
│   ├── ftdetect/stim.vim             # Filetype detection
│   ├── syntax/stim.vim               # Syntax highlighting
│   ├── ftplugin/stim.vim             # Filetype settings
│   └── autoload/stim/               # Autoloaded functions
│       ├── compile.vim
│       ├── template.vim
│       └── util.vim
└── zed/
    ├── extension.toml                # Extension manifest
    ├── grammars/grammar.js           # Tree-sitter grammar
    └── languages/stim/
        ├── config.toml               # Language config
        ├── highlights.scm            # Highlight queries
        └── indents.scm               # Indentation rules
```

## Contributing

1. Fork the repository
2. Make changes in the appropriate plugin directory
3. Test in your editor
4. Submit a pull request

## License

MIT
