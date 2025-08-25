# Spark Language Support for Neovim

Comprehensive Neovim plugin for the Spark DSL - syntax highlighting, compilation support, templates, and more for `.spark` files.

## Features

- **Full Syntax Highlighting** - Complete syntax support for all Spark constructs
- **Smart Indentation** - Context-aware indentation for nested blocks
- **Compilation Integration** - Compile `.spark` files directly from Neovim
- **Code Templates** - Quick insertion of common Spark patterns
- **Text Objects** - Navigate and select command blocks efficiently
- **Auto-completion** - Built-in keyword and function completion
- **Folding Support** - Code folding for command blocks
- **Error Handling** - Quickfix integration for compilation errors

## Installation

### Using vim-plug
```vim
Plug 'user/spark', {'rtp': 'plugins/neovim'}
```

### Using packer.nvim
```lua
use {
  'user/spark',
  rtp = 'plugins/neovim'
}
```

### Using lazy.nvim
```lua
{
  'user/spark',
  dir = 'plugins/neovim',
  ft = 'spark',
}
```

### Manual Installation
```bash
# Clone to your Neovim configuration directory
git clone https://github.com/user/spark.git ~/.config/nvim/pack/plugins/start/spark
```

## Usage

### Syntax Highlighting

Automatic syntax highlighting for `.spark` files includes:

- **Keywords**: `command`, `if`, `else`, `for`, `while`, `in`, `break`
- **Built-in Functions**: `ask()`, `confirm()`, `wait_for_response()`, `create_file()`
- **Git Functions**: `git_init()`, `git_commit()`, `git_push()`
- **String Literals**: Both `"double"` and `'single'` quoted
- **Comments**: `// Line comments` with TODO highlighting
- **Arrays**: `[item1, item2, item3]` syntax
- **Operators**: `+`, `==`, `!=`, `&&`, `||`, `!`

### Commands

| Command | Description |
|---------|-------------|
| `:SparkCompile` | Compile the current `.spark` file |
| `:SparkCompileAndRun` | Compile and show Claude Code command |
| `:SparkNewCommand [name]` | Create a new command template |

### Key Mappings

Default key mappings (with `<leader>` prefix):

| Mapping | Command | Description |
|---------|---------|-------------|
| `<leader>sc` | `:SparkCompile` | Compile current file |
| `<leader>sr` | `:SparkCompileAndRun` | Compile and get run command |
| `<leader>sn` | `:SparkNewCommand` | Create new command template |

### Text Objects

Navigate and select command blocks:

| Mapping | Description |
|---------|-------------|
| `ic` | Select inner command block (excludes braces) |
| `ac` | Select around command block (includes braces) |

Example usage:
- `dic` - Delete inner command block
- `yac` - Yank around command block
- `vic` - Visually select inner command block

### Auto-completion

Press `Ctrl-X Ctrl-U` to trigger completion for:
- Spark keywords (`command`, `if`, `for`, etc.)
- Built-in functions (`ask`, `confirm`, etc.)
- Git functions (`git_init`, `git_commit`, etc.)

### Abbreviations

Type these abbreviations and press space:
- `cmd` → `command`
- `conf` → `confirm`  
- `resp` → `wait_for_response()`

### Templates

Create common patterns quickly:

```vim
:call spark#template#insert_survey()     " Interactive survey
:call spark#template#insert_features()   " Feature selection
:call spark#template#insert_git()        " Git workflow
```

### Folding

Code folding is enabled by default:
- `zc` - Close fold
- `zo` - Open fold  
- `za` - Toggle fold
- `zM` - Close all folds
- `zR` - Open all folds

## Configuration

### Default Settings

```vim
" Compilation command (default: 'bun run dev compile')
let g:spark_compile_command = 'bun run dev compile'

" Auto-compile on save (default: 0)
let g:spark_auto_compile = 0

" Show compilation errors in quickfix (default: 1)
let g:spark_show_errors = 1
```

### Custom Key Mappings

```vim
" Disable default mappings
let g:spark_no_default_mappings = 1

" Create your own mappings
nnoremap <C-c> :SparkCompile<CR>
nnoremap <C-r> :SparkCompileAndRun<CR>
```

### Buffer-Local Settings

The plugin automatically sets these for `.spark` files:
- `commentstring=//%s` - For commenting with `gcc`
- `shiftwidth=2` - 2-space indentation
- `expandtab` - Use spaces instead of tabs
- `textwidth=100` - Line wrapping at 100 characters

## Integration

### Quickfix Integration

Compilation errors are automatically parsed and displayed in the quickfix window:
```vim
:SparkCompile  " If errors occur, quickfix window opens
:cn            " Next error
:cp            " Previous error
:ccl           " Close quickfix
```

### Statusline Integration

Add Spark status to your statusline:
```vim
set statusline+=%{SparkStatus()}
```

### Auto-commands

Enable auto-compilation on save:
```vim
let g:spark_auto_compile = 1
```

Or set up custom auto-commands:
```vim
augroup my_spark_config
  autocmd!
  autocmd BufWritePost *.spark echo 'Spark file saved!'
  autocmd FileType spark setlocal number relativenumber
augroup END
```

## Requirements

- **Neovim** 0.5.0 or later (Vim 8.0+ should work but is not tested)
- **Bun** installed and available in PATH
- **Spark project** with compilation support

## Troubleshooting

### Common Issues

**"Not a Spark file" error**
- Ensure the file has `.spark` extension
- Check that filetype is set: `:set ft=spark`

**Compilation fails**
- Verify Bun is installed: `:!bun --version`
- Check project root has `package.json`
- Ensure `bun run dev compile` works from terminal

**Syntax highlighting not working**
- Restart Neovim after installation
- Verify plugin is loaded: `:scriptnames`
- Check filetype detection: `:set ft?`

### Debug Commands

```vim
:call spark#util#show_info()    " Show plugin and project info
:call spark#util#check_bun()    " Verify Bun installation
:echo spark#util#find_project_root()  " Show detected project root
```

## Development

### Plugin Structure
```
plugins/neovim/
├── plugin/spark.vim          # Main plugin file
├── ftdetect/spark.vim        # Filetype detection
├── syntax/spark.vim          # Syntax highlighting
├── ftplugin/spark.vim        # Filetype-specific settings
├── autoload/spark/           # Autoloaded functions
│   ├── compile.vim          # Compilation functions
│   ├── template.vim         # Template functions
│   └── util.vim             # Utility functions
└── README.md                # This file
```

### Contributing

1. Fork the repository
2. Create your feature branch
3. Make changes in `plugins/neovim/`
4. Test with different Neovim versions
5. Submit a pull request

### Testing

```bash
# Test with minimal vimrc
nvim --noplugin -u minimal.vim test.spark

# Test syntax highlighting
nvim -c 'set syntax=spark' -c 'colorscheme default' test.spark

# Test compilation
nvim -c 'SparkCompile' test.spark
```

## License

MIT - see LICENSE file for details

## Changelog

### 1.0.0
- Initial release
- Full syntax highlighting
- Compilation integration
- Code templates and text objects
- Auto-completion support
- Folding and indentation
- Quickfix integration