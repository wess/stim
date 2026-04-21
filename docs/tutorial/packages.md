# Chapter 11 — Packages

> **Previous:** [Targets](targets.md)
> **Next:** [The Stim Engine](engine.md)

Until now, everything you've written has lived in a single `.stim` file or two. That's fine for personal commands. But once you want to share something — with your team, with the wider Stim community, or just across three projects of your own — you need a way to package it up.

This chapter covers Stim's package system: how to install packages other people have published, how to author your own, and how Stim's decentralized approach differs from npm or brew.

By the end you'll have installed a couple of packages, published one of your own, and understand when to use the monorepo-subdirectory pattern versus a dedicated repo.

## The Short Version

A Stim package is a GitHub repo (or subdirectory of one) containing a `stim.yaml` manifest and some `.stim` files. You install it with `stim add github/<user>/<repo>`. There's no central registry and no publish command.

## Installing a Package

Start by installing one of the first-party packages:

```bash
stim add github/wess/stim/packages/reviews
```

This fetches the `reviews` package from the Stim monorepo and installs three agents: `@security_reviewer`, `@code_reviewer`, `@docs_reviewer`. Open Claude Code and invoke any of them.

A few things just happened:

1. **Stim fetched `stim.yaml`** from `https://raw.githubusercontent.com/wess/stim/.../packages/reviews/stim.yaml`.
2. **Stim fetched each `.stim` file** listed in the manifest.
3. **Each file was compiled** through the Claude adapter (the default target).
4. **The compiled files were placed** in `~/.claude/agents/` because they're agent declarations.
5. **Version info was recorded** in a per-target `stim.lock` file so `stim update` can check for newer versions later.

### Install options

```bash
stim add github/wess/stim/packages/reviews                     # default: claude, global
stim add github/wess/stim/packages/reviews --local             # project only
stim add github/wess/stim/packages/reviews --target cursor     # Cursor rules
stim add github/wess/stim/packages/reviews@v1.0.0              # pin version
```

## Finding Packages

Stim doesn't have a search command or a web registry. Discovery lives in the curated [`packages.md`](../../packages.md) file at the repo root. It lists:

- **First-party packages** — maintained by the Stim team, in this repo
- **Community packages** — third-party packages vetted by PR review

It's a markdown file. You can browse it in your editor, in the GitHub UI, or copy-paste install commands from it.

Packages not in `packages.md` still work — `stim add` takes any GitHub repo, curated or not. The list is a discovery aid, not a gatekeeper.

## Publishing Your Own Package

Let's walk through publishing a package step by step. We'll build a tiny one called `hello`.

### Step 1: Create the package directory

```bash
mkdir -p ~/code/stim-hello
cd ~/code/stim-hello
```

### Step 2: Write the manifest

Create `stim.yaml`:

```yaml
name: hello
version: 1.0.0
author: yourname
description: A greeter that knows your name
commands:
  - greet.stim
```

### Step 3: Write the command

Create `greet.stim`:

```stim
command greet {
  ask("What's your name?")
  wait_for_response()
  ask("Nice to meet you — what can I help you with today?")
}
```

### Step 4: Add a README

```markdown
# hello

A greeter command.

## Install

stim add github/yourname/stim-hello

## Use

In Claude Code: /greet
```

### Step 5: Publish

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:yourname/stim-hello.git
git push -u origin main
git tag v1.0.0
git push --tags
```

That's it — your package is installable anywhere with:

```bash
stim add github/yourname/stim-hello
```

### Optional: Get listed in `packages.md`

Fork this repo, add a row to the Community Packages table in `packages.md`, open a PR. If the package has a clear description, a README, and works with the current Stim, it'll get merged.

## Monorepo Packages

Some authors have several related packages. Rather than creating five separate repos, you can put them in subdirectories of one repo.

```
your-repo/
├── packages/
│   ├── security/
│   │   ├── stim.yaml
│   │   └── scanner.stim
│   ├── testing/
│   │   ├── stim.yaml
│   │   └── coverage.stim
│   └── docs/
│       ├── stim.yaml
│       └── writer.stim
```

Users install the subdirectories directly:

```bash
stim add github/yourname/your-repo/packages/security
stim add github/yourname/your-repo/packages/testing
```

Each subdirectory is an independent package with its own manifest and version. This is the pattern Stim itself uses for its first-party packages.

When should you use it? When two or more packages share meaningful context (imports, docs, test fixtures) or when publishing related packages together saves you and your users hassle. For genuinely independent packages, separate repos are fine.

## Versioning and Updates

Each lock file tracks the resolved version of each installed package:

```json
{
  "packages": {
    "github/wess/stim/packages/reviews": {
      "version": "v1.0.0",
      "commands": ["security_reviewer", "code_reviewer", "docs_reviewer"]
    }
  }
}
```

To update everything to the latest release:

```bash
stim update
```

To update one package:

```bash
stim update github/wess/stim/packages/reviews
```

By default, `stim add` without a tag fetches the latest GitHub release. Pin a specific version with `@v1.2.0` when you need reproducibility (CI, shared team setup).

## Removing Packages

```bash
stim remove github/wess/stim/packages/reviews
```

This deletes the installed `.md` files and removes the package's entry from the lockfile. Other packages are untouched.

## Why Decentralized?

Stim could have gone the npm route: a central registry, a publish command, a quality review process. It didn't, because:

1. **Zero gatekeeping.** Anyone can publish anything. No maintainer bottleneck.
2. **Authors own versioning.** No one can yank your package or rename it out from under you.
3. **It scales.** One hundred packages, one thousand — the model doesn't break.
4. **Discovery is separate from distribution.** `packages.md` gives curation without constraining publishing.

The tradeoff: finding high-quality packages requires the curated list or word of mouth. There's no search-all-packages command. For most users, that's fine. If it becomes a real problem as the ecosystem grows, a community-run search service could be built on top of GitHub's existing repo search.

## Exercises

1. **Install and use a first-party package.** Run `stim add github/wess/stim/packages/gitflow` and try `/commit` on a repo with staged changes.

2. **Publish your own package.** Walk through the five steps above with a command of your own. Install it from a fresh directory to verify the install flow works end-to-end.

3. **Try the monorepo pattern.** Put two small packages in subdirectories of one repo. Install both. Compare the experience to two separate repos.

## What You Learned

- Packages are GitHub repos (or subdirectories) with a `stim.yaml` manifest plus `.stim` files.
- Install with `stim add`, update with `stim update`, remove with `stim remove`.
- Subpath syntax (`github/user/repo/path/to/package`) lets one repo host multiple packages.
- Discovery happens through the curated `packages.md` file; publishing is just `git push`.

Next chapter: [The Stim Engine](engine.md). Annotations turn a command into an orchestrated workflow with topology, memory, and error handling.
