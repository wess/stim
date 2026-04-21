import { describe, test, expect } from 'bun:test'
import { writeFileSync, mkdirSync, rmSync, existsSync } from 'fs'
import { resolve, join } from 'path'
import { tmpdir } from 'os'
import { parseCommand } from '../src/parser/index.js'
import { resolveTaskFiles } from '../src/resolve/index.js'
import { getTarget } from '../src/targets/index.js'

const makeTempDir = (name: string): string => {
  const dir = join(tmpdir(), `stim-integration-${name}-${Date.now()}`)
  mkdirSync(dir, { recursive: true })
  return dir
}

describe('agent end-to-end: source → AST → compiled', () => {
  const source = `agent reviewer {
  description "Reviews PRs for security and correctness"
  tools [Read, Grep, Bash]
  model "sonnet"

  "You are a senior code reviewer."
  "Always cite file paths and line numbers."
}`

  test('claude target produces YAML frontmatter + prose', () => {
    const decl = parseCommand(source)
    const out = getTarget('claude').compile(decl)

    expect(out).toMatch(/^---\n/)
    expect(out).toContain('name: reviewer')
    expect(out).toContain('description: Reviews PRs for security and correctness')
    expect(out).toContain('tools: [Read, Grep, Bash]')
    expect(out).toContain('model: sonnet')
    expect(out).toContain('You are a senior code reviewer.')
    expect(out).toContain('Always cite file paths and line numbers.')
  })

  test('chatgpt target produces heading + quote block + prose', () => {
    const decl = parseCommand(source)
    const out = getTarget('chatgpt').compile(decl)

    expect(out).not.toContain('---')
    expect(out).toContain('# reviewer')
    expect(out).toContain('> Reviews PRs for security and correctness')
    expect(out).toContain('You are a senior code reviewer.')
  })

  test('cursor target produces .mdc frontmatter + prose', () => {
    const decl = parseCommand(source)
    const out = getTarget('cursor').compile(decl)

    expect(out).toMatch(/^---\n/)
    expect(out).toContain('description: Reviews PRs for security and correctness')
    expect(out).toContain('globs:')
    expect(out).toContain('alwaysApply: false')
    expect(out).toContain('You are a senior code reviewer.')
  })

  test('every target preserves prose ordering', () => {
    const decl = parseCommand(source)
    for (const name of ['claude', 'chatgpt', 'cursor']) {
      const out = getTarget(name).compile(decl)
      const seniorIdx = out.indexOf('senior code reviewer')
      const citeIdx = out.indexOf('cite file paths')
      expect(seniorIdx).toBeGreaterThan(-1)
      expect(citeIdx).toBeGreaterThan(seniorIdx)
    }
  })
})

describe('command end-to-end: all targets', () => {
  const source = `command brainstorm {
  ask("What's the idea?")
  wait_for_response()
}`

  test('claude target emits prose command', () => {
    const decl = parseCommand(source)
    const out = getTarget('claude').compile(decl)

    expect(out).not.toMatch(/^---\n/)
    expect(out).toContain("What's the idea?")
    expect(out).toContain('Wait for user response before continuing.')
  })

  test('chatgpt target adds # heading', () => {
    const decl = parseCommand(source)
    const out = getTarget('chatgpt').compile(decl)

    expect(out).toContain('# brainstorm')
    expect(out).toContain("What's the idea?")
  })

  test('cursor target wraps command in .mdc frontmatter', () => {
    const decl = parseCommand(source)
    const out = getTarget('cursor').compile(decl)

    expect(out).toMatch(/^---\n/)
    expect(out).toContain('description: brainstorm')
    expect(out).toContain("What's the idea?")
  })
})

describe('agent with imports', () => {
  test('imported variables are available in prose substitution', () => {
    const dir = makeTempDir('agent-imports')
    const varsFile = resolve(dir, 'vars.stim')
    const agentFile = resolve(dir, 'agent.stim')

    writeFileSync(varsFile, 'persona_header = "You are a security engineer."\n', 'utf-8')
    writeFileSync(agentFile, `import "vars.stim"
agent sec {
  description "Security review"
  ask(persona_header)
}`, 'utf-8')

    try {
      const parsed = parseCommand(`import "vars.stim"
agent sec {
  description "Security review"
  ask(persona_header)
}`)
      const decl = resolveTaskFiles(parsed, dir)
      const out = getTarget('claude').compile(decl)

      expect(out).toContain('description: Security review')
      expect(out).toContain('Ask the user: "You are a security engineer."')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('destination paths for install', () => {
  const agent = { kind: 'agent' as const, name: 'r', body: [], metadata: { description: 'x' } }
  const cmd = { kind: 'command' as const, name: 'r', body: [] }

  test('claude command global → ~/.claude/commands/', () => {
    const dest = getTarget('claude').destination(cmd, { local: false })
    expect(dest.path).toMatch(/\.claude\/commands\/r\.md$/)
    expect(dest.path).not.toContain(process.cwd())
  })

  test('claude command local → ./.claude/commands/', () => {
    const dest = getTarget('claude').destination(cmd, { local: true })
    expect(dest.path).toContain(process.cwd())
    expect(dest.path).toMatch(/\.claude\/commands\/r\.md$/)
  })

  test('claude agent → agents/ not commands/', () => {
    const dest = getTarget('claude').destination(agent, { local: false })
    expect(dest.path).toMatch(/\.claude\/agents\/r\.md$/)
    expect(dest.path).not.toMatch(/commands/)
  })

  test('cursor ignores --local (always project)', () => {
    const global = getTarget('cursor').destination(agent, { local: false })
    const local = getTarget('cursor').destination(agent, { local: true })
    expect(global.path).toBe(local.path)
    expect(global.path).toMatch(/\.cursor\/rules\/r\.mdc$/)
  })

  test('chatgpt non-local → dist/chatgpt/, local → ./prompts/', () => {
    const nonLocal = getTarget('chatgpt').destination(agent, { local: false })
    const local = getTarget('chatgpt').destination(agent, { local: true })
    expect(nonLocal.path).toMatch(/dist\/chatgpt\/r\.md$/)
    expect(local.path).toMatch(/prompts\/r\.md$/)
  })
})

describe('warn-and-drop for unsupported fields', () => {
  const decl = {
    kind: 'agent' as const,
    name: 'a',
    body: [{ type: 'prose', text: 'hello' }],
    metadata: {
      description: 'd',
      tools: ['Read'],
      model: 'sonnet',
    },
  }

  test('cursor drops tools and model silently from output', () => {
    const out = getTarget('cursor').compile(decl)
    expect(out).not.toContain('tools:')
    expect(out).not.toContain('model:')
    expect(out).toContain('description: d')
  })

  test('chatgpt drops tools and model silently from output', () => {
    const out = getTarget('chatgpt').compile(decl)
    expect(out).not.toContain('tools')
    expect(out).not.toContain('model')
    expect(out).toContain('> d')
  })

  test('claude keeps all fields', () => {
    const out = getTarget('claude').compile(decl)
    expect(out).toContain('tools: [Read]')
    expect(out).toContain('model: sonnet')
    expect(out).toContain('description: d')
  })
})

describe('annotations still work after refactor', () => {
  test('engine-mode header only on claude + command', () => {
    const source = `command deploy {
  @topology pipeline
  @memory shared
  task bash "build" {
    ask("Run the build")
  }
}`
    const decl = parseCommand(source)

    const claude = getTarget('claude').compile(decl)
    expect(claude).toContain('[annotations]')
    expect(claude).toContain('topology: pipeline')
    expect(claude).toContain('memory: shared')
    expect(claude).toContain('[status: ok]')

    const cursor = getTarget('cursor').compile(decl)
    expect(cursor).not.toContain('[annotations]')
  })
})
