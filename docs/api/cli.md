# CLI

The Stim command-line interface for managing commands and packages.

## Version

Show the Stim version:

```bash
stim version
stim -v
stim --version
```

## Help

Show available commands:

```bash
stim help
stim -h
stim --help
```

## Compile

Compile a `.stim` file to markdown:

```bash
stim compile <file.stim>
```

The output is written to `dist/<command_name>.md`.

**Example:**
```bash
stim compile brainstorm.stim
```

**Output:** `dist/brainstorm.md`

The command name comes from the `command` declaration in the file.

## Install

Install a command globally or locally:

```bash
stim install <file.stim>
stim install <file.stim> --local
```

Without `--local`, the command is installed globally and available in all Claude Code projects.

With `--local`, the command is installed only in the current project (in `.claude/commands/`).

**Global installation:**
```bash
stim install brainstorm.stim
```

**Local installation:**
```bash
stim install brainstorm.stim --local
```

The command can then be used in Claude Code as `/<command_name>`.

## Package Management

### Add

Add a package from GitHub:

```bash
stim add <github/user/repo>
stim add <github/user/repo@tag>
stim add <github/user/repo> --local
stim add <github/user/repo@tag> --local
```

**Examples:**
```bash
stim add github/wess/brainstorm
stim add github/wess/brainstorm@v1.0.0
stim add github/wess/brainstorm --local
stim add github/wess/brainstorm@v1.2.3 --local
```

The package is cloned from GitHub. If a specific version tag is not provided, the latest release is used.

### Remove

Remove an installed package:

```bash
stim remove <github/user/repo>
stim remove <github/user/repo> --local
```

**Examples:**
```bash
stim remove github/wess/brainstorm
stim remove github/wess/brainstorm --local
```

### Update

Update installed packages to the latest version:

```bash
stim update
stim update <github/user/repo>
stim update --local
stim update <github/user/repo> --local
```

**Examples:**
```bash
stim update                              # Update all packages
stim update github/wess/brainstorm       # Update one package
stim update --local                      # Update local packages only
stim update github/wess/brainstorm@v2.0 # Update to specific version
```

## Engine Installation

The Stim engine enables workflow automation features like [annotations](annotations.md).

```bash
stim install engine/engine.stim
```

Once installed, you can reference workflow files in Claude Code:

```
/stim workflow.stim
```

The engine processes annotations, task execution, and status reporting.

## Bundle Installation

When you install the engine via `stim install engine/engine.stim`, all sibling modules in the engine directory are automatically bundled and installed together.

This includes:
- Task execution runtime
- Status reporting system
- Workflow orchestration

All bundled modules are available to your installed commands.

## Lockfile Management

A `stim.lock` file tracks installed package versions:

```json
{
  "packages": {
    "github/wess/brainstorm": {
      "version": "v1.0.0",
      "commands": ["brainstorm", "ideate"]
    }
  }
}
```

Lockfiles are created and updated automatically by `add`, `remove`, and `update` commands.

## Global vs Local Installation

**Global installation** (`--local` not specified)
- Installs to user's global Claude Code directory
- Available in all projects
- Persists across sessions

**Local installation** (`--local` specified)
- Installs to current project's `.claude/commands/` directory
- Available only in this project
- Useful for project-specific commands

## Error Cases

### File Not Found

```
Error: File not found: brainstorm.stim
```

**Solution:** Provide the correct file path.

### Invalid File Extension

```
Error: Input file must have .stim extension
```

**Solution:** Use `.stim` files, not `.md` or other extensions.

### Package Not Found

```
Error: Package not found: github/user/nonexistent
```

**Solution:** Verify the GitHub repository path is correct and the package is public.

### No Input File

```
Error: No input file specified
Usage: stim compile <file.stim>
```

**Solution:** Provide a `.stim` file as an argument.

## Examples

**Complete workflow:**
```bash
# Create a new command
echo 'command hello { ask("Hello!") }' > hello.stim

# Compile to markdown
stim compile hello.stim

# Install globally
stim install hello.stim

# Now use in Claude Code: /hello
```

**Package management:**
```bash
# Add a package
stim add github/wess/brainstorm@v1.0.0

# View what was installed
cat stim.lock

# Update all packages
stim update

# Remove a package
stim remove github/wess/brainstorm
```

## See Also

- [Commands](commands.md) — Command declaration syntax
- [Imports](imports.md) — Sharing variables across files
- [Annotations](annotations.md) — Workflow automation features
