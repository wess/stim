# Chapter 2: Getting Started

This chapter gets you up and running in about 10 minutes. You'll install Stim, create your first command, and see it run in Claude Code.

## Prerequisites

Before you begin, make sure you have:

1. **Claude Code installed** — Download from claude.ai and verify it works
2. **A terminal** — bash, zsh, fish, or Windows PowerShell
3. **A text editor** — VS Code, Zed, Neovim, or even vim (anything that saves text files)
4. **curl or wget** — For downloading Stim (or you can download manually)

That's all. You don't need Bun, Node.js, or any build tools unless you're building Stim itself.

## Installation Methods

### Method 1: Quick Install (Recommended)

The easiest way is the official install script:

```bash
curl -fsSL https://raw.githubusercontent.com/wess/stim/main/install.sh | sh
```

This downloads the latest version for your platform and installs it to `/usr/local/bin/stim`.

Verify it worked:

```bash
stim version
```

You should see something like: `Stim v1.2.0 (darwin-arm64)`

### Method 2: Homebrew

If you use Homebrew:

```bash
brew install wess/packages/stim
```

Then verify:

```bash
stim version
```

### Method 3: Manual Download

Download the latest release from [GitHub Releases](https://github.com/wess/stim/releases).

**macOS (Apple Silicon M1/M2/M3):**
```bash
curl -L https://github.com/wess/stim/releases/latest/download/stim-darwin-arm64 -o stim
chmod +x stim
sudo mv stim /usr/local/bin/
```

**macOS (Intel):**
```bash
curl -L https://github.com/wess/stim/releases/latest/download/stim-darwin-x64 -o stim
chmod +x stim
sudo mv stim /usr/local/bin/
```

**Linux (x64):**
```bash
curl -L https://github.com/wess/stim/releases/latest/download/stim-linux-x64 -o stim
chmod +x stim
sudo mv stim /usr/local/bin/
```

**Windows (x64):**
Download `stim-windows-x64.exe` from releases and add to your PATH.

### Method 4: Build from Source

Only do this if you're contributing to Stim or want the absolute latest development version.

Prerequisites: [Bun](https://bun.sh) installed.

```bash
git clone https://github.com/wess/stim.git
cd stim
bun install
bun run build
./dist/stim version
```

If you built from source, you'll run `./dist/stim` instead of just `stim`.

## Your First Command: Hello World

Now let's create your first Stim file. Open your editor and create a file called `hello.stim`:

```stim
command hello {
  ask("What's your name?")
  wait_for_response()
  
  ask("Nice to meet you! What would you like to work on today?")
  wait_for_response()
  
  ask("Let's build something amazing!")
}
```

Save it. Let's break down every line:

```stim
command hello {
```

Every `.stim` file starts with `command` and a name. This name becomes your slash command in Claude Code. So `hello` will become `/hello`.

The opening brace `{` starts the command's body.

```stim
  ask("What's your name?")
```

`ask()` shows a message to the user and tells Claude to respond. The string inside the parentheses is what Claude will see. Note the quotes — in Stim, strings must be quoted.

```stim
  wait_for_response()
```

This pauses execution and tells Claude Code to wait for the user's answer before continuing. Without this, Stim would barrel through all the asks instantly.

```stim
  ask("Nice to meet you! What would you like to work on today?")
  wait_for_response()
```

Ask another question, wait again.

```stim
  ask("Let's build something amazing!")
}
```

Final message, then close the command block with `}`.

That's it. You've written your first Stim program.

## Compiling Your Command

Stim uses a simple two-step process: compile, then install.

Compile your code:

```bash
stim compile hello.stim
```

Stim will output something like:

```
Compiled hello.stim -> dist/hello.md
```

Look inside `dist/hello.md` to see what Stim generated. You should see a markdown file with ask/wait_for_response instructions. This is what Claude Code will execute.

The markdown isn't perfect. It's not meant to be. Stim generates instructions for Claude, not for humans to read.

## Installing Your Command

Now install it as a global Claude Code command:

```bash
stim install hello.stim
```

This compiles and copies the result to `~/.claude/commands/hello.md`. Claude Code will now recognize `/hello` as a command.

If you want to install only for your current project (not globally):

```bash
stim install hello.stim --local
```

This installs to `.claude/commands/hello.md` in your current directory. Useful for project-specific commands.

## Running Your First Command

Open Claude Code. In the command input, type:

```
/hello
```

Claude will execute your command. It will ask for your name, wait for your answer, ask what you want to work on, and wait again. Try it!

## What Just Happened?

Let's trace the pipeline:

1. You created `hello.stim` with Stim syntax
2. You ran `stim compile hello.stim` which:
   - Parsed your code into an Abstract Syntax Tree (AST)
   - Checked it for errors
   - Converted it to markdown
3. You ran `stim install hello.stim` which:
   - Compiled (step 2 again)
   - Copied the markdown to `~/.claude/commands/hello.md`
4. You typed `/hello` in Claude Code which:
   - Read the markdown file
   - Executed it as instructions
   - Displayed results to you

This is the complete Stim story. Everything else is variations on this theme.

## A More Complex Example

Let's make sure you understand the flow. Create `project.stim`:

```stim
command quickplan {
  features = ["Authentication", "Database", "API", "Frontend"]
  
  ask("What are you building?")
  wait_for_response()
  
  ask("What's your tech stack?")
  wait_for_response()
  
  for feature in features {
    if (confirm("Do you need " + feature + "?")) {
      ask("Tell me about your " + feature + " requirements")
      wait_for_response()
    }
  }
  
  ask("Create a project plan based on what we discussed")
  create_file("PLAN.md", "plan_content")
}
```

Notice the new concepts:

- `features = [...]` — An array variable (Chapter 3)
- `for feature in features { }` — A loop (Chapter 4)
- `if (confirm(...)) { }` — An if statement with a confirmation (Chapters 3 and 4)
- `"..." + variable + "..."` — String concatenation (Chapter 3)
- `create_file()` — Writing to disk (Chapter 5)

You don't need to understand all of these yet. But you can see how they compose. Stim is just building blocks.

Compile and install:

```bash
stim compile project.stim
stim install project.stim
```

Then run `/quickplan` in Claude Code. Step through it and watch how variables and loops work in practice.

## Troubleshooting

### stim: command not found

The executable isn't in your PATH. Try:

```bash
which stim
```

If it returns nothing, Stim didn't install properly. Try the install steps again. If you used `sudo mv stim /usr/local/bin/`, verify the file is there:

```bash
ls -la /usr/local/bin/stim
```

If you're on macOS and see a "cannot be opened because the developer cannot be verified" error, Stim was downloaded over the internet. Allow it in System Preferences -> Security & Privacy.

### Compilation errors

Common mistakes:

1. **Missing quotes** — Variables and ask() arguments must be quoted: `"string"` not `string`
2. **Unmatched braces** — Every `{` needs a `}`. Check the end of your file.
3. **Invalid syntax** — Check the [Syntax Reference](../Syntax-Reference.md) for correct syntax.

If you get a parse error, Stim will tell you the line number. Example:

```
Parse error on line 5: unexpected 'confirm'
```

Count to line 5, fix it, and try again.

### Command doesn't appear in Claude Code

If `/hello` doesn't work:

1. Check the file exists: `ls ~/.claude/commands/hello.md`
2. Restart Claude Code (sometimes it needs to refresh)
3. Try manually creating `.claude/commands/` if it doesn't exist: `mkdir -p ~/.claude/commands/`

### The compiled markdown looks weird

It does. That's normal. Stim generates instructions for Claude to interpret, not for humans to read. Don't worry about the output format. Just care that it works.

## Quick Reference: Installation Verification

After installation, verify with:

```bash
stim version        # Shows Stim version
stim help           # Shows all commands
stim compile test.stim  # Compiles a file
```

If all three work, you're good.

## What Comes Next

Now that Stim is running, Chapter 3 covers **Variables and Data Types** in depth. You'll learn strings, booleans, arrays, and how scope works. Then you'll build a real workflow from scratch.

Ready? Head to Chapter 3.
