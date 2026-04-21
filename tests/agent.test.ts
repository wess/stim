import { describe, test, expect } from 'bun:test'
import { parseCommand } from '../src/parser/index.js'

describe('agent declarator', () => {
  test('parses bare agent', () => {
    const result = parseCommand('agent reviewer {\n  "You are a reviewer."\n}')
    expect(result.kind).toBe('agent')
    expect(result.name).toBe('reviewer')
    expect(result.body).toHaveLength(1)
    expect(result.body[0]).toEqual({ type: 'prose', text: 'You are a reviewer.' })
  })

  test('command kind defaults correctly', () => {
    const result = parseCommand('command hello {\n  ask("Hi?")\n}')
    expect(result.kind).toBe('command')
  })
})

describe('agent metadata', () => {
  test('parses description field', () => {
    const source = `agent reviewer {
  description "Reviews PRs for security issues"
  "You are a reviewer."
}`
    const result = parseCommand(source)
    expect(result.metadata).toEqual({ description: 'Reviews PRs for security issues' })
    expect(result.body).toHaveLength(1)
  })

  test('parses tools array', () => {
    const source = `agent reviewer {
  tools [Read, Grep, Bash]
  "Body prose."
}`
    const result = parseCommand(source)
    expect(result.metadata?.tools).toEqual(['Read', 'Grep', 'Bash'])
  })

  test('parses model field', () => {
    const source = `agent reviewer {
  model "sonnet"
  "Body."
}`
    const result = parseCommand(source)
    expect(result.metadata?.model).toBe('sonnet')
  })

  test('parses all metadata together', () => {
    const source = `agent reviewer {
  description "Does reviews"
  tools [Read, Grep]
  model "opus"
  "You are a reviewer."
}`
    const result = parseCommand(source)
    expect(result.metadata).toEqual({
      description: 'Does reviews',
      tools: ['Read', 'Grep'],
      model: 'opus',
    })
  })

  test('throws on metadata in command declaration', () => {
    const source = `command reviewer {
  description "not allowed here"
}`
    expect(() => parseCommand(source)).toThrow('only allowed in agent declarations')
  })

  test('throws on metadata after prose', () => {
    const source = `agent reviewer {
  "Intro prose."
  description "too late"
}`
    expect(() => parseCommand(source)).toThrow('Metadata fields must appear before other statements')
  })

  test('throws on duplicate metadata field', () => {
    const source = `agent reviewer {
  description "first"
  description "second"
  "body"
}`
    expect(() => parseCommand(source)).toThrow('Duplicate metadata field: description')
  })

  test('agent without metadata has no metadata field', () => {
    const result = parseCommand('agent x {\n  "body"\n}')
    expect(result.metadata).toBeUndefined()
  })

  test('throws on annotations inside agent declaration', () => {
    const source = `agent x {
  @topology pipeline
  "body"
}`
    expect(() => parseCommand(source)).toThrow('Annotations are not allowed in agent declarations')
  })
})

describe('prose statements', () => {
  test('double-quoted prose', () => {
    const result = parseCommand('agent x {\n  "hello world"\n}')
    expect(result.body[0]).toEqual({ type: 'prose', text: 'hello world' })
  })

  test('single-quoted prose', () => {
    const result = parseCommand("agent x {\n  'hello world'\n}")
    expect(result.body[0]).toEqual({ type: 'prose', text: 'hello world' })
  })

  test('multiple prose lines', () => {
    const source = `agent x {
  "Line one."
  "Line two."
  "Line three."
}`
    const result = parseCommand(source)
    expect(result.body).toHaveLength(3)
    expect(result.body.every(s => s.type === 'prose')).toBe(true)
  })
})
