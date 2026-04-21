# Packages

A Stim package is a collection of `.stim` files — commands and agents — that can be installed with `stim add`. Packages live in GitHub repos (or subdirectories of one), and the registry of recommended packages lives in the root [`packages.md`](../../packages.md) of this repo.

Stim uses a **decentralized package model**: anyone can publish a package on GitHub and anyone can install it. No central registry, no review process. The curated `packages.md` list is opt-in discovery, not gatekeeping.

## Package Structure

A package is a directory containing:

- **`stim.yaml`** — manifest describing the package (required)
- **One or more `.stim` files** — the commands and agents
- **`README.md`** — what the package does (recommended)

Minimum example:

```
my-package/
├── stim.yaml
├── hello.stim
└── README.md
```

## The Manifest (`stim.yaml`)

```yaml
name: my-package
version: 1.0.0
author: wess
description: A short one-line summary
commands:
  - hello.stim
  - deploy.stim
```

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `name` | string | yes | Package name. Convention: lowercase, no spaces, no underscores. |
| `version` | string | yes | Semantic version. Used by `stim update` to decide when to refetch. |
| `author` | string | yes | GitHub username or organization. |
| `description` | string | no | One-line summary shown in `packages.md`. |
| `commands` | list of strings | yes | Paths (relative to the manifest) of `.stim` files in this package. The name is legacy — can list both commands and agents. |

### JSON fallback

For backwards compatibility, `stim.json` with the same shape also works. New packages should use YAML — it's easier to read, supports comments, and is still parsed efficiently.

If both files exist, `stim.yaml` wins.

## Installing a Package

```bash
stim add github/<owner>/<repo>
stim add github/<owner>/<repo>@<tag>
stim add github/<owner>/<repo>/<subpath>
stim add github/<owner>/<repo>/<subpath>@<tag>
```

**Examples:**

```bash
# Simple repo-level package
stim add github/wess/brainstorm

# Pin to a specific version
stim add github/wess/brainstorm@v1.2.0

# Monorepo subdirectory package
stim add github/wess/stim/packages/reviews

# Subdirectory + version
stim add github/wess/stim/packages/reviews@v1.0.0
```

### Target selection

Like `compile` and `install`, `add` accepts `--target`:

```bash
stim add github/wess/stim/packages/reviews --target cursor
stim add github/wess/stim/packages/reviews --target chatgpt --local
```

Target-specific fields (e.g. Claude's `tools` or `model`) are warn-and-dropped for targets that don't support them — see [Targets](targets.md).

### Scope

By default packages install globally. Use `--local` to install them into the current project:

```bash
stim add github/wess/stim/packages/reviews --local
```

| Scope | Claude path | Cursor path | ChatGPT path |
|-------|-------------|-------------|--------------|
| global | `~/.claude/{commands,agents}/` | `.cursor/rules/` | `./dist/chatgpt/` |
| `--local` | `./.claude/{commands,agents}/` | `.cursor/rules/` (unchanged) | `./prompts/` |

## Tag Resolution

When you don't specify `@<tag>`, Stim resolves to the package's latest release:

1. First: the GitHub Releases API — `GET /repos/:owner/:repo/releases/latest`.
2. Fallback: the Tags API — `GET /repos/:owner/:repo/tags` (first tag wins).
3. If neither returns, the `add` fails.

Pin a specific tag with `@v1.0.0` when you want reproducibility. This is recommended for CI and team environments.

## The Lockfile (`stim.lock`)

Each target maintains its own `stim.lock` file tracking installed packages and their resolved versions:

```json
{
  "packages": {
    "github/wess/stim/packages/reviews": {
      "version": "v1.0.0",
      "commands": ["security_reviewer", "code_reviewer", "docs_reviewer"]
    },
    "github/wess/stim/packages/gitflow": {
      "version": "v1.0.0",
      "commands": ["commit", "pr", "changelog"]
    }
  }
}
```

Lockfile locations:

- **Claude, global**: `~/.claude/stim.lock`
- **Claude, local**: `./.claude/stim.lock`
- **Cursor**: `./.cursor/stim.lock`
- **ChatGPT, local**: (not persisted — ChatGPT `install --local` writes to `./prompts/` but has no lockfile concept)

The lockfile is updated automatically by `stim add`, `stim update`, and `stim remove`.

## Managing Installed Packages

```bash
stim update                         # refetch latest for every installed package
stim update github/wess/brainstorm  # refetch latest for one package
stim remove github/wess/brainstorm  # uninstall
```

`update` and `remove` respect the same `--target` and `--local` flags as `add`.

## Publishing a Package

1. Create a GitHub repo (or add a subdirectory to an existing one).
2. Add `stim.yaml` + one or more `.stim` files + a `README.md`.
3. Tag a release: `git tag v1.0.0 && git push --tags`. Optionally create a GitHub release.
4. Share the install command: `stim add github/yourname/your-repo`.

### Submitting to `packages.md`

Stim's main repo has a curated [`packages.md`](../../packages.md) that helps users discover packages. To add yours, open a PR that appends a row to the **Community Packages** table.

To be accepted, a package should:

- Have a clear `description` in `stim.yaml`
- Include a `README.md` inside the package directory explaining each command/agent
- Work with the current version of Stim
- Not duplicate an existing package without adding something meaningful
- Follow the guidelines in the "Publishing a Package" section of `packages.md`

The curation is lightweight — the goal is quality, not exclusivity. Broken packages, empty README, or dead repos are the main rejection reasons.

## Bundle Detection

When the entry `.stim` file in a package has the same name as its directory (e.g. `engine/engine.stim` or `engine/index.stim`), sibling `.stim` files are also installed as "modules" under a subdirectory. This is how the Stim engine packages itself.

Bundle detection currently only runs for the `claude` target.

## See Also

- [CLI](cli.md) — complete flag reference for `stim add`, `stim update`, `stim remove`
- [Targets](targets.md) — how `--target` affects where packages install
- [packages.md](../../packages.md) — the curated package registry
