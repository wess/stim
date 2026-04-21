# Stim Package Registry

A curated list of packages you can install with `stim add`. The packages in this list live in third-party repos — Stim itself doesn't gatekeep package contents; this file just tracks what's recommended and helps discovery.

To add a package: open a PR that adds a row to the appropriate table below. See [Publishing a Package](#publishing-a-package) for how to ship your own.

## First-Party Packages

These packages live in this repo under [`packages/`](packages/) and are maintained alongside Stim itself.

| Package | Install | Description |
|---------|---------|-------------|
| [`reviews`](packages/reviews/) | `stim add github/wess/stim/packages/reviews` | Code review agents: security, quality, docs |
| [`gitflow`](packages/gitflow/) | `stim add github/wess/stim/packages/gitflow` | Git workflow commands: commit, PR, changelog |
| [`planning`](packages/planning/) | `stim add github/wess/stim/packages/planning` | Planning commands: spec, breakdown, scope |
| [`writing`](packages/writing/) | `stim add github/wess/stim/packages/writing` | Writing agents: README, docstring, explainer |

## Community Packages

Third-party packages curated and reviewed by the community. To have your package listed here, open a PR with a new row.

| Package | Install | Description |
|---------|---------|-------------|
| _(none yet — [submit yours](#publishing-a-package))_ | | |

## Publishing a Package

A Stim package is any GitHub repo (or subdirectory of one) that has a `stim.yaml` manifest at its root.

### Minimum viable package

```
your-repo/
├── stim.yaml
└── hello.stim
```

```yaml
# stim.yaml
name: hello
version: 1.0.0
author: yourname
description: A greeter
commands:
  - hello.stim
```

```stim
# hello.stim
command hello {
  ask("What's your name?")
  wait_for_response()
  ask("Nice to meet you!")
}
```

Publish to GitHub, tag a release, and users install with:

```bash
stim add github/yourname/your-repo
```

### Monorepo packages

Multiple packages in one repo work too — just put each in its own subdirectory with its own `stim.yaml`:

```
your-repo/
├── packages/
│   ├── security/
│   │   ├── stim.yaml
│   │   └── reviewer.stim
│   └── testing/
│       ├── stim.yaml
│       └── suite.stim
```

Users install individually:

```bash
stim add github/yourname/your-repo/packages/security
stim add github/yourname/your-repo/packages/testing
```

### Getting listed here

Open a PR that adds your package to the **Community Packages** table. To be accepted it should:

- Have a clear `description` in `stim.yaml`
- Include a `README.md` in the package directory showing what each command/agent does
- Work with the current version of Stim (`stim version`)
- Not duplicate a first-party package without adding something meaningfully new
- Follow the conventions in [docs/api/packages.md](docs/api/packages.md)

See [docs/api/packages.md](docs/api/packages.md) for the full package format reference.
