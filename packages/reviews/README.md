# reviews

Three code review agents for Claude Code.

| Agent | What it does |
|-------|--------------|
| `@security_reviewer` | Looks for SQL injection, XSS, auth bypasses, exposed secrets, and other security issues. Prioritizes findings by exploitability. |
| `@code_reviewer` | Reviews PRs for correctness, edge cases, clarity, and test quality. Distinguishes must-fix from nice-to-have. |
| `@docs_reviewer` | Verifies docs match the code and flags stale examples, hidden assumptions, and filler prose. |

## Install

```bash
stim add github/wess/stim/packages/reviews
```

Then invoke in Claude Code: `@security_reviewer`, `@code_reviewer`, `@docs_reviewer`.

For Cursor (tools/model fields will warn-and-drop):

```bash
stim add github/wess/stim/packages/reviews --target cursor
```
