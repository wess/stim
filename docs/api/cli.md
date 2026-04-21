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

Compile a `.stim` file to the target's output format:

```bash
stim compile <file.stim>
stim compile <file.stim> --target <name>
```

The output is written to `dist/<target>/<name>.<ext>`. Each target owns its own subdirectory so multiple target builds of the same source don't collide.

**Example:**
```bash
stim compile brainstorm.stim                  # → dist/claude/brainstorm.md
stim compile brainstorm.stim --target cursor  # → dist/cursor/brainstorm.mdc
stim compile brainstorm.stim --target chatgpt # → dist/chatgpt/brainstorm.md
```

The declaration name comes from the `command` or `agent` keyword in the file.

## Install

Install a command or agent for a target:

```bash
stim install <file.stim>
stim install <file.stim> --target <name>
stim install <file.stim> --target <name> --local
```

Each target has its own install location. See [Targets](targets.md) for the full table.

**Claude (default):**
```bash
stim install brainstorm.stim                    # → ~/.claude/commands/brainstorm.md
stim install reviewer.stim                      # → ~/.claude/agents/reviewer.md
stim install brainstorm.stim --local            # → ./.claude/commands/brainstorm.md
```

**Cursor:**
```bash
stim install reviewer.stim --target cursor      # → ./.cursor/rules/reviewer.mdc
```

**ChatGPT:**
```bash
stim install reviewer.stim --target chatgpt          # → ./dist/chatgpt/reviewer.md
stim install reviewer.stim --target chatgpt --local  # → ./prompts/reviewer.md
```

## The `--target` Flag

Selects which AI tool to compile for. Accepted values: `claude` (default), `chatgpt`, `cursor`.

```bash
stim compile reviewer.stim --target cursor
stim install reviewer.stim --target chatgpt --local
```

When a target doesn't support a metadata field (Cursor and `tools`, for example), the compiler emits a warning and drops the field. Output is otherwise portable.

See [Targets](targets.md) for the full per-target behavior.

## Package Management

### Add

Add a package from GitHub:

```bash
stim add <github/user/repo>
stim add <github/user/repo@tag>
stim add <github/user/repo/subpath>                # monorepo package
stim add <github/user/repo/subpath@tag>
stim add ... --target <name>                        # claude | chatgpt | cursor
stim add ... --local                                # project scope
```

**Examples:**
```bash
stim add github/wess/brainstorm
stim add github/wess/brainstorm@v1.0.0
stim add github/wess/stim/packages/reviews          # first-party package
stim add github/wess/stim/packages/reviews --target cursor
stim add github/wess/brainstorm --local
```

The package is fetched from GitHub's raw content API. If `@tag` isn't specified, `stim` resolves to the latest GitHub release (falling back to the most recent tag).

See [Packages](packages.md) for the full package format and publishing guide.

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

## Package Manifest (`stim.yaml`)

A published Stim package includes a `stim.yaml` at its root that lists the `.stim` files to install:

```yaml
name: brainstorm
version: 1.0.0
author: wess
description: Spec development and idea refinement
commands:
  - brainstorm.stim
  - ideate.stim
  - reviewer.stim
```

The field is named `commands` for backwards compatibility, but it can list **any `.stim` files** — both commands and agents. Each file's declarator (`command` or `agent`) determines where the compiled output installs:

- A `command` declaration installs to the target's commands directory (e.g. `~/.claude/commands/`).
- An `agent` declaration installs to the target's agents directory (e.g. `~/.claude/agents/`).

For backwards compatibility, `stim.json` with the same shape is still supported. New packages should use YAML.

The `--target` flag works on `stim add`, `stim update`, and `stim remove`, so the same package can install for any supported target:

```bash
stim add github/wess/reviewer-pack                   # → claude
stim add github/wess/reviewer-pack --target cursor   # → .cursor/rules/
```

## Lockfile

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

Lockfiles are created and updated automatically by `add`, `remove`, and `update`. Separate lockfiles are maintained per-target when you install the same package for multiple targets.

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
