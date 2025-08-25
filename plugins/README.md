# Spark Editor Plugins

Official editor plugins for the Spark DSL, providing syntax highlighting, compilation support, and IDE features.

## Available Plugins

- **[VSCode](vscode/)** - Full-featured Visual Studio Code extension
- **[Neovim](neovim/)** - Comprehensive Neovim/Vim plugin

## Quick Start

### VSCode Extension

#### Install Pre-built
1. Download the latest `.vsix` file from releases
2. Open VSCode
3. Run command: `Extensions: Install from VSIX...`
4. Select the downloaded file

#### Build from Source
```bash
cd plugins/vscode
npm install
npm run compile
npm run package  # Creates spark-lang-1.0.0.vsix
```

Then install the generated `.vsix` file in VSCode.

### Neovim Plugin

#### Using a Plugin Manager

**vim-plug:**
```vim
Plug 'user/spark', {'rtp': 'plugins/neovim'}
```

**packer.nvim:**
```lua
use {
  'user/spark',
  rtp = 'plugins/neovim'
}
```

**lazy.nvim:**
```lua
{
  'user/spark',
  dir = 'plugins/neovim',
  ft = 'spark',
}
```

#### Manual Installation
```bash
# Copy to your Neovim config
cp -r plugins/neovim ~/.config/nvim/pack/plugins/start/spark
```

## Features

Both plugins provide:

### Syntax Highlighting
- Complete syntax highlighting for all Spark language constructs
- Keywords, functions, strings, comments, operators
- Error detection and highlighting

### Compilation Support
- Compile `.spark` files directly from your editor
- Error reporting with line numbers
- Integration with quickfix/problems panel

### Code Intelligence
- Auto-completion for keywords and functions
- Code snippets for common patterns
- Smart indentation and formatting
- Bracket matching and auto-closing

### Commands & Shortcuts
- Compile current file
- Create new command templates
- Navigate and select code blocks

## Building from Source

### Prerequisites

**VSCode Extension:**
- Node.js 16+ and npm
- TypeScript 5+
- `vsce` package tool: `npm install -g vsce`

**Neovim Plugin:**
- Neovim 0.5.0+ (or Vim 8.0+)
- No build required (VimScript)

### VSCode Build Steps

```bash
cd plugins/vscode

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Package extension
npm run package

# Output: spark-lang-1.0.0.vsix
```

### Testing Extensions

**VSCode:**
```bash
# Launch extension development host
code --extensionDevelopmentPath=plugins/vscode

# Or press F5 in VSCode with the extension folder open
```

**Neovim:**
```bash
# Test with minimal config
nvim -u NONE -c "set rtp+=plugins/neovim" test.spark
```

## Development

### VSCode Extension Structure
```
vscode/
├── src/
│   └── extension.ts      # Main extension code
├── syntaxes/
│   └── spark.tmLanguage.json  # TextMate grammar
├── snippets/
│   └── spark.json        # Code snippets
├── language-configuration.json  # Language config
├── package.json          # Extension manifest
└── tsconfig.json         # TypeScript config
```

### Neovim Plugin Structure
```
neovim/
├── plugin/
│   └── spark.vim         # Main plugin file
├── ftdetect/
│   └── spark.vim         # Filetype detection
├── syntax/
│   └── spark.vim         # Syntax highlighting
├── ftplugin/
│   └── spark.vim         # Filetype settings
└── autoload/
    └── spark/            # Autoloaded functions
        ├── compile.vim   # Compilation
        ├── template.vim  # Templates
        └── util.vim      # Utilities
```

## Publishing

### VSCode Marketplace

1. Create a publisher account at https://marketplace.visualstudio.com
2. Get a Personal Access Token
3. Login: `vsce login <publisher-name>`
4. Publish: `npm run publish`

### Vim/Neovim

The Neovim plugin can be:
- Added to vim-scripts organization
- Published as a GitHub repository
- Submitted to VimAwesome.com

## Contributing

1. Fork the repository
2. Create your feature branch
3. Make changes in the appropriate plugin directory
4. Test thoroughly in your editor
5. Submit a pull request

## License

MIT - see LICENSE file for details

## Support

- **Issues**: Report bugs on GitHub
- **VSCode**: Check Output panel for Spark logs
- **Neovim**: Run `:call spark#util#show_info()` for diagnostics