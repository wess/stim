import { describe, test, expect } from 'bun:test'
import { getTarget, extractTarget, DEFAULT_TARGET, listTargets } from '../src/targets/index.js'
import type { Declaration } from '../src/types/index.js'

const agent: Declaration = {
  kind: 'agent',
  name: 'reviewer',
  body: [{ type: 'prose', text: 'You are a reviewer.' }],
  metadata: {
    description: 'Reviews PRs',
    tools: ['Read', 'Grep'],
    model: 'sonnet',
  },
}

const command: Declaration = {
  kind: 'command',
  name: 'brainstorm',
  body: [{ type: 'ask', question: '"What now?"' }],
}

describe('target registry', () => {
  test('default target is claude', () => {
    expect(DEFAULT_TARGET).toBe('claude')
  })

  test('lists known targets', () => {
    const names = listTargets()
    expect(names).toContain('claude')
    expect(names).toContain('chatgpt')
    expect(names).toContain('cursor')
  })

  test('throws on unknown target', () => {
    expect(() => getTarget('nope')).toThrow('Unknown target')
  })
})

describe('extractTarget', () => {
  test('defaults to claude when no --target flag', () => {
    const { target, rest } = extractTarget(['file.stim'])
    expect(target).toBe('claude')
    expect(rest).toEqual(['file.stim'])
  })

  test('parses --target flag', () => {
    const { target, rest } = extractTarget(['--target', 'cursor', 'file.stim'])
    expect(target).toBe('cursor')
    expect(rest).toEqual(['file.stim'])
  })

  test('preserves other flags in rest', () => {
    const { target, rest } = extractTarget(['--local', '--target', 'chatgpt', 'file.stim'])
    expect(target).toBe('chatgpt')
    expect(rest).toEqual(['--local', 'file.stim'])
  })

  test('throws on missing value', () => {
    expect(() => extractTarget(['--target'])).toThrow('--target requires a value')
  })
})

describe('claude target', () => {
  const claude = getTarget('claude')

  test('compiles agent with YAML frontmatter', () => {
    const out = claude.compile(agent)
    expect(out).toContain('---')
    expect(out).toContain('name: reviewer')
    expect(out).toContain('description: Reviews PRs')
    expect(out).toContain('tools: [Read, Grep]')
    expect(out).toContain('model: sonnet')
    expect(out).toContain('You are a reviewer.')
  })

  test('compiles command without frontmatter', () => {
    const out = claude.compile(command)
    expect(out).not.toContain('---')
    expect(out).toContain('Ask the user')
  })

  test('agent destination goes to agents/', () => {
    const dest = claude.destination(agent, { local: false })
    expect(dest.path).toMatch(/\.claude\/agents\/reviewer\.md$/)
    expect(dest.scope).toBe('global')
  })

  test('command destination goes to commands/', () => {
    const dest = claude.destination(command, { local: true })
    expect(dest.path).toMatch(/\.claude\/commands\/brainstorm\.md$/)
    expect(dest.scope).toBe('local')
  })
})

describe('chatgpt target', () => {
  const chatgpt = getTarget('chatgpt')

  test('compiles agent without YAML frontmatter', () => {
    const out = chatgpt.compile(agent)
    expect(out).not.toContain('---')
    expect(out).toContain('# reviewer')
    expect(out).toContain('> Reviews PRs')
    expect(out).toContain('You are a reviewer.')
  })

  test('compiles command with heading', () => {
    const out = chatgpt.compile(command)
    expect(out).toContain('# brainstorm')
  })

  test('destination defaults to dist/chatgpt/', () => {
    const dest = chatgpt.destination(agent, { local: false })
    expect(dest.path).toMatch(/dist\/chatgpt\/reviewer\.md$/)
  })

  test('destination with --local goes to prompts/', () => {
    const dest = chatgpt.destination(agent, { local: true })
    expect(dest.path).toMatch(/prompts\/reviewer\.md$/)
  })
})

describe('cursor target', () => {
  const cursor = getTarget('cursor')

  test('compiles with Cursor frontmatter', () => {
    const out = cursor.compile(agent)
    expect(out).toContain('description: Reviews PRs')
    expect(out).toContain('globs:')
    expect(out).toContain('alwaysApply: false')
    expect(out).toContain('You are a reviewer.')
  })

  test('falls back to name when description missing', () => {
    const out = cursor.compile({ ...agent, metadata: {} })
    expect(out).toContain('description: reviewer')
  })

  test('destination is .cursor/rules/*.mdc', () => {
    const dest = cursor.destination(agent, { local: false })
    expect(dest.path).toMatch(/\.cursor\/rules\/reviewer\.mdc$/)
    expect(dest.scope).toBe('project')
  })

  test('extension is .mdc', () => {
    expect(cursor.extension).toBe('.mdc')
  })
})
