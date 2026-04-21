# writing

Three agents for writing the words that surround code.

| Agent | What it does |
|-------|--------------|
| `@readme_writer` | Writes READMEs that get to the point. First paragraph answers "what is this and why should I care". No filler, no empty sections. |
| `@docstring_writer` | Writes docstrings that explain what the code does, not what the code says. Skips obvious helpers; flags subtle behavior. |
| `@explainer` | Explains unfamiliar code to engineers learning the codebase. Leads with the shape, uses real examples, names historical tradeoffs. |

## Install

```bash
stim add github/wess/stim/packages/writing
```

Then invoke in Claude Code: `@readme_writer`, `@docstring_writer`, `@explainer`.
