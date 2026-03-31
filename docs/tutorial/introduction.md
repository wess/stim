# Chapter 1: Introduction

## What Is Stim?

Stim is a domain-specific language (DSL) that compiles `.stim` files into Claude Code commands. It brings control flow, variables, functions, and multi-agent orchestration to prompt automation.

In other words: you write Stim code, Stim compiles it to markdown, and you use that markdown as a `/command` in Claude Code.

That's it. Simple pipeline: `.stim` -> `compiler` -> `markdown command`.

## The Problem It Solves

Imagine you need to build a workflow that:
- Asks the user multiple questions
- Loops through a list of options
- Makes decisions based on answers
- Spawns parallel subagents
- Tracks state across steps

You could write this by hand in markdown. It would look like this:

```markdown
Ask me the first question about your project...

Remember, I need to understand the following:
- The problem you're solving
- Your target users
- Your constraints

Ask me the second question about your project...

Remember, I need to understand the following:
- The problem you're solving
- Your target users
- Your constraints

And so on...

Then, once I understand the project, you should:
1. Check if the spec is complete
2. If not, ask another question and loop back
3. If yes, save the spec to a file
4. Ask if the user wants to create a repo

Make sure that when you loop, you don't repeat the same questions...
```

This is unreadable. It's repetitive. It's easy to break. And it's impossible to version control meaningfully.

Here's the same workflow in Stim:

```stim
command brainstorm {
  questions = ["What problem are you solving?", "Who are your users?", "What are your constraints?"]
  
  for question in questions {
    ask(question)
    wait_for_response()
  }
  
  spec_complete = false
  
  while (!spec_complete) {
    ask("Next critical question?")
    if (confirm("Spec complete?")) {
      spec_complete = true
    }
  }
  
  create_file("SPEC.md", "generated_spec")
  
  if (confirm("Create GitHub repo?")) {
    task bash "init repo" {
      ask("Initialize a git repo and create the first commit")
    }
  }
}
```

Compare them side by side:

| Aspect | Markdown | Stim |
|--------|----------|------|
| Control flow | Implicit in prose | Explicit in code |
| Loops | Copy-paste, error-prone | `for` and `while` |
| Conditionals | Narrative instructions | `if` / `else` blocks |
| Variables | Repeated text | Named variables |
| Parallel tasks | Hard to coordinate | `parallel { }` block |
| Maintenance | Nightmare as it grows | Scales with your needs |
| Version control | Diffs are noisy | Clean, minimal diffs |
| Subagents | Manual instructions | `task { }` declarations |

Stim trades minimal ceremony for maximum clarity. You write less, say more, and maintain it forever.

## Why Now?

Claude Code is powerful. But prompts are just text. They don't have loops, functions, or type safety. They don't scale.

Stim fills that gap. It's to Claude Code automation what TypeScript is to JavaScript: a layer of structure that makes complex systems manageable.

## Who Should Read This

This tutorial is for anyone who:

- Uses Claude Code and repeats the same prompts multiple times
- Builds workflows that are too complex to write by hand
- Wants to version control their prompts in git
- Teams that need reproducible, documented automation
- People learning to program (Stim is beginner-friendly)
- Developers who want to bring software engineering to prompt automation

You do NOT need to be an expert programmer. You do NOT need to know Claude's internals. You just need to be comfortable in a terminal.

## What You'll Learn in This Tutorial

After Chapter 10, you will:

1. Write clean, readable Stim code for any workflow
2. Understand the compilation pipeline and what Stim generates
3. Use variables, loops, and conditionals fluently
4. Build multi-agent workflows with `task` and `parallel`
5. Organize your commands with imports and file references
6. Debug compilation errors
7. Follow best practices for production use
8. Contribute improvements to Stim itself

You'll graduate from "running prompts" to "engineering prompts."

## What's NOT in This Tutorial

This is not a guide to:
- Using Claude or understanding its capabilities
- Building AI products (that's Claude's job, you're orchestrating)
- Writing better prompts (Stim is a delivery mechanism, not a prompt engineer's guide)
- General programming (Stim is a DSL, not a full language)
- Installing Claude Code (you should already have it)

We assume you know what Claude is and can already write basic prompts.

## A Word on Philosophy

Stim has three core beliefs:

1. **Prompts are code.** They deserve structure, tests, and version control.
2. **Clarity over cleverness.** We optimize for readability. You read code 10 times more than you write it.
3. **Minimal ceremony.** Every Stim keyword exists because it solves a real problem. No boilerplate.

You'll see these beliefs throughout the tutorial. They guide every design decision in Stim.

## The Compilation Pipeline

When you run `stim compile hello.stim`, three things happen:

```
hello.stim (source) -> Parser -> AST -> Resolver -> Compiler -> hello.md (markdown)
```

1. **Parser** reads your `.stim` file and converts it to an Abstract Syntax Tree (AST)
2. **Resolver** finds any referenced files (like `task("other.stim")`) and inlines them
3. **Compiler** converts the AST to markdown that Claude Code understands

You don't need to memorize this. But it's useful to know when you debug. When Stim says "parse error on line 5," it means the parser couldn't understand your syntax.

## Your First Encounter

Chapter 2 walks you through installation and your first command. You'll create a file called `hello.stim`, compile it, and run it in Claude Code. It takes 5 minutes.

But before you jump there, let's make sure you understand why you're doing this.

## Why Version Control Your Commands?

Here's a scenario: You build a great workflow in Claude Code. Six months later, you need to rebuild it. Or your team needs the same workflow. Or you want to improve it but need to remember how it worked.

You don't have that history with hand-written prompts. They live in chat history, ephemeral and lost.

With Stim, your workflows live in git. You can:
- Revert to previous versions
- Review changes in code review
- Share with your team
- Collaborate on improvements
- Document design decisions in commit messages
- Automate testing (yes, you can test Stim commands)

This is what makes Stim powerful for teams.

## A Gentle Warning

Stim is not magic. It won't make bad prompts good. It won't teach Claude to code better. It's a tool for organizing and delivering prompts, nothing more.

But in our experience, the act of writing Stim code forces you to think more clearly about what you're asking Claude to do. Structure helps clarity.

## What Comes Next

Chapter 2 covers installation and your absolute first command. It's completely hands-on. You'll see your Stim code run in Claude Code within 5 minutes.

Ready? Let's go.
