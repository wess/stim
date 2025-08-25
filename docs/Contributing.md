# Contributing to Spark

Thank you for your interest in contributing to Spark! This guide will help you get started.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Setup](#development-setup)
4. [Project Structure](#project-structure)
5. [Making Changes](#making-changes)
6. [Testing](#testing)
7. [Submitting Changes](#submitting-changes)
8. [Code Style](#code-style)
9. [Documentation](#documentation)

## Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:

- Be respectful and constructive in discussions
- Focus on what's best for the community
- Show empathy toward other community members
- Accept constructive feedback gracefully
- Help newcomers get up to speed

## Getting Started

### Ways to Contribute

- **Bug Reports**: Found something broken? Let us know!
- **Feature Requests**: Have an idea for improvement? Share it!
- **Code Contributions**: Fix bugs, add features, improve performance
- **Documentation**: Improve guides, fix typos, add examples
- **Examples**: Share useful `.spark` commands with the community

### Before You Start

1. Check existing [issues](https://github.com/user/spark/issues) to avoid duplicates
2. For major changes, open an issue to discuss the approach first
3. Make sure you understand the [project goals](#project-goals)

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) (latest version)
- [Git](https://git-scm.com)
- [Claude Code](https://claude.ai/code) (for testing)

### Setup Steps

```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/yourusername/spark.git
cd spark

# Install dependencies
bun install

# Verify setup works
bun run dev --help

# Test compilation
bun run dev compile examples/brainstorm.spark
```

### Development Commands

```bash
# Compile a .spark file
bun run dev compile file.spark

# Build executable
bun run build

# Run tests (when available)
bun test

# Format code
bun run format

# Lint code  
bun run lint
```

## Project Structure

```
spark/
├── src/                    # Source code
│   ├── types/             # TypeScript type definitions
│   ├── parser/            # .spark file parser
│   ├── compiler/          # Markdown generator
│   ├── cli/               # Command-line interface
│   └── main.ts            # Entry point
├── examples/              # Example .spark files
├── docs/                  # Documentation
├── tests/                 # Test files (future)
└── package.json          # Project configuration
```

### Key Files

- **`src/types/index.ts`**: Core type definitions for AST nodes
- **`src/parser/index.ts`**: Parses `.spark` files into AST
- **`src/compiler/index.ts`**: Converts AST to Claude-compatible markdown
- **`src/cli/index.ts`**: Command-line interface implementation

## Making Changes

### Workflow

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our [code style](#code-style)

3. **Test your changes**:
   ```bash
   # Test compilation
   bun run dev compile examples/brainstorm.spark
   
   # Test new functionality
   bun run dev compile your-test-file.spark
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

### Types of Changes

#### Bug Fixes

- Target specific, well-defined issues
- Include minimal reproduction case
- Test that fix works without breaking existing functionality

#### New Features

- Start with an issue discussion for major features
- Follow existing patterns and conventions
- Update documentation and examples
- Consider backward compatibility

#### Documentation

- Fix typos, improve clarity, add examples
- Keep documentation in sync with code changes
- Use consistent formatting and tone

## Testing

### Manual Testing

Currently, testing is primarily manual:

```bash
# Test basic compilation
bun run dev compile examples/brainstorm.spark

# Test error handling
bun run dev compile non-existent.spark

# Test compiled command in Claude Code
/brainstorm
```

### Test Cases to Check

When making changes, verify:

1. **Compilation succeeds** for all example files
2. **Error messages** are helpful for invalid syntax
3. **Generated markdown** is well-formatted
4. **Commands work** correctly in Claude Code

### Future Testing

We plan to add automated testing:

- Unit tests for parser components
- Integration tests for compilation
- Example validation tests
- Performance benchmarks

## Submitting Changes

### Pull Request Guidelines

1. **Title**: Use conventional commit format
   - `feat: add import system`
   - `fix: resolve parser error with nested loops`
   - `docs: update tutorial examples`

2. **Description**: Include:
   - What changes were made
   - Why the changes were needed
   - How to test the changes
   - Any breaking changes

3. **Small PRs**: Keep changes focused and reviewable

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature  
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Tested compilation of existing examples
- [ ] Tested new functionality manually
- [ ] Updated documentation as needed

## Breaking Changes
None / Describe any breaking changes
```

### Review Process

1. **Automated checks**: PRs must pass linting and compilation tests
2. **Manual review**: Maintainer will review code and test functionality
3. **Feedback**: Address any requested changes
4. **Merge**: Approved PRs are merged to `main`

## Code Style

### TypeScript Conventions

- **Functional programming**: No classes, prefer pure functions
- **Type safety**: Use TypeScript types extensively
- **Immutability**: Prefer `const`, avoid mutations where possible

```typescript
// Good
const parseCommand = (source: string): Command => {
  const lines = source.split('\n')
  return { name: extractName(lines), body: parseBody(lines) }
}

// Avoid
class Parser {
  parseCommand(source: string): Command {
    // ...
  }
}
```

### File Organization

- **No camelCase** in file/folder names
- **Use folders** for logical grouping: `thing/{index.ts, helper.ts}`
- **Export from index.ts** for clean imports

```
// Good
src/
├── parser/
│   ├── index.ts           # Main exports
│   ├── expressions.ts     # Expression parsing
│   └── statements.ts      # Statement parsing

// Avoid  
src/
├── parseStatements.ts
├── parseExpressions.ts
└── parser.ts
```

### Naming Conventions

- **Variables/functions**: `snake_case` or `camelCase` (be consistent)
- **Types**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Files**: `kebab-case`

### Error Handling

- **Descriptive errors**: Include context and suggestions
- **Fail fast**: Validate inputs early
- **Consistent format**: Use similar error message patterns

```typescript
// Good
if (!match) {
  throw new Error(`Invalid ask statement: ${line}. Expected: ask("question")`)
}

// Avoid
if (!match) {
  throw new Error('Parse error')
}
```

## Documentation

### Documentation Standards

- **Clear examples**: Show actual code, not just descriptions
- **Complete coverage**: Document all public APIs and features  
- **User-focused**: Write for developers using Spark, not just contributors
- **Up-to-date**: Update docs with code changes

### Documentation Types

1. **API Reference**: Complete function/syntax documentation
2. **Tutorials**: Step-by-step learning guides
3. **Examples**: Real-world usage patterns
4. **FAQ**: Common questions and troubleshooting

### Writing Style

- **Concise**: Get to the point quickly
- **Scannable**: Use headers, bullets, code blocks
- **Consistent**: Follow existing tone and structure
- **Helpful**: Include context and reasoning, not just facts

## Project Goals

Understanding Spark's goals helps guide contributions:

### Primary Goals

1. **Simplify complex Claude Code commands** through programming constructs
2. **Maintain readability** - generated markdown should be understandable
3. **Stay lightweight** - minimal dependencies, fast compilation
4. **Enable reusability** - patterns and logic that can be shared

### Non-Goals

1. **General-purpose programming language** - focused on Claude Code use case
2. **Runtime execution** - we compile to Claude-interpreted markdown
3. **Complex type system** - keep types simple and practical

### Design Principles

- **Functional over OOP** - prefer pure functions and immutable data
- **Explicit over implicit** - clear syntax over clever shortcuts
- **Simple over complex** - solve 80% of use cases really well
- **Extensible over complete** - build a foundation for future growth

## Getting Help

### Communication

- **GitHub Issues**: Bug reports, feature requests, questions
- **GitHub Discussions**: General questions, ideas, showcase
- **Pull Requests**: Code review and technical discussion

### Resources

- **[Tutorial](Tutorial.md)**: Learn Spark basics
- **[API Reference](API.md)**: Complete syntax documentation
- **[Examples](Examples.md)**: Real-world patterns and usage

### Maintainer Response

We aim to:
- **Acknowledge issues** within 48 hours
- **Review PRs** within 1 week  
- **Release frequently** with incremental improvements
- **Communicate clearly** about project direction and decisions

## Recognition

Contributors are recognized through:
- **GitHub contributors list**
- **Changelog mentions** for significant contributions
- **Example attribution** for contributed `.spark` commands
- **Documentation credits** for major doc improvements

---

**Ready to contribute?** 

1. Pick an issue labeled `good first issue` for your first contribution
2. Join the discussion on existing issues and PRs
3. Share your `.spark` commands as examples
4. Help improve documentation and tutorials

Thank you for helping make Spark better for everyone! 🚀