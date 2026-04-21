# gitflow

Three commands for common git workflows.

| Command | What it does |
|---------|--------------|
| `/commit` | Reviews staged changes, drafts a conventional-commit message, and creates the commit after your approval. |
| `/pr` | Summarizes all commits on the current branch and opens a PR via `gh pr create`. |
| `/changelog` | Groups commits since the last release tag and writes user-facing changelog entries. |

## Install

```bash
stim add github/wess/stim/packages/gitflow
```

Then use `/commit`, `/pr`, `/changelog` in Claude Code.
