# Stim Language Support for Neovim

Neovim plugin for the Stim DSL -- syntax highlighting, compilation, templates, and text objects for `.stim` files.

## Features

- **Syntax Highlighting** -- all Stim constructs including `task`, `parallel`, and agent types
- **Smart Indentation** -- context-aware indentation for nested blocks
- **Compilation** -- compile `.stim` files directly from Neovim
- **Code Templates** -- quick insertion of common patterns (tasks, parallel, surveys)
- **Text Objects** -- `ic`/`ac` for command blocks
- **Auto-completion** -- keywords, agent types, and built-in functions
- **Folding** -- code folding for command blocks
- **Quickfix** -- compilation errors in the quickfix window

## Installation

### vim-plug
```vim
Plug 'user/stim', {'rtp': 'plugins/neovim'}
```

### packer.nvim
```lua
use {
  'user/stim',
  rtp = 'plugins/neovim'
}
```

### lazy.nvim
```lua
{
  'user/stim',
  dir = 'plugins/neovim',
  ft = 'stim',
}
```

### Manual
```bash
cp -r plugins/neovim ~/.config/nvim/pack/plugins/start/stim
```

## Syntax Highlighting

Automatic highlighting for `.stim` files:

- **Keywords**: `command`, `if`, `else`, `for`, `while`, `in`, `break`, `task`, `parallel`
- **Agent Types**: `bash`, `explore`, `plan`, `general`
- **Built-in Functions**: `ask()`, `confirm()`, `wait_for_response()`, `create_file()`
- **Git Functions**: `git_init()`, `git_commit()`, `git_push()`
- **Strings**: `"double"` and `'single'` quoted with escape highlighting
- **Comments**: `// line comments` with TODO/FIXME highlighting
- **Operators**: `+`, `==`, `!=`, `&&`, `||`, `!`

## Commands

| Command | Description |
|---------|-------------|
| `:StimCompile` | Compile the current `.stim` file |
| `:StimCompileAndRun` | Compile and show Claude Code command |
| `:StimNewCommand [name]` | Create a new command template |

## Key Mappings

| Mapping | Description |
|---------|-------------|
| `<leader>sc` | Compile current file |
| `<leader>sr` | Compile and get run command |
| `<leader>sn` | Create new command template |

## Text Objects

| Mapping | Description |
|---------|-------------|
| `ic` | Inner command block (excludes braces) |
| `ac` | Around command block (includes braces) |

## Auto-completion

Press `Ctrl-X Ctrl-U` to complete:
- Keywords: `command`, `if`, `for`, `task`, `parallel`, etc.
- Agent types: `bash`, `explore`, `plan`, `general`
- Functions: `ask`, `confirm`, `wait_for_response`, etc.

## Abbreviations

| Abbreviation | Expands to |
|-------------|------------|
| `cmd` | `command` |
| `conf` | `confirm` |
| `resp` | `wait_for_response()` |

## Templates

Insert common patterns at cursor:

```vim
:call stim#template#insert_task()        " Inline task
:call stim#template#insert_task_agent()  " Task with agent type
:call stim#template#insert_parallel()    " Parallel block
:call stim#template#insert_survey()      " Interactive survey
:call stim#template#insert_features()    " Feature selection
:call stim#template#insert_git()         " Git workflow
```

## Configuration

```vim
" Compilation command (default: './dist/stim compile')
let g:stim_compile_command = './dist/stim compile'

" Auto-compile on save (default: 0)
let g:stim_auto_compile = 0

" Show compilation errors in quickfix (default: 1)
let g:stim_show_errors = 1

" Disable default key mappings
let g:stim_no_default_mappings = 1
```

## Requirements

- Neovim 0.5.0+ (Vim 8.0+ should also work)
- [Bun](https://bun.sh) installed
- Stim project with compilation support

## License

MIT
