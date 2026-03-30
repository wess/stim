import { describe, test, expect } from 'bun:test'
import { parseCommand } from '../src/parser/index.js'
import { compileCommand } from '../src/compiler/index.js'

describe('annotation parsing', () => {
  test('parses @topology annotation', () => {
    const source = `command test {
  @topology pipeline
  ask("hello")
}`
    const result = parseCommand(source)
    expect(result.annotations).toEqual({ topology: 'pipeline' })
    expect(result.body).toHaveLength(1)
    expect(result.body[0].type).toBe('ask')
  })

  test('parses multiple annotations', () => {
    const source = `command test {
  @topology fanout
  @memory shared
  @on_error escalate
  ask("hello")
}`
    const result = parseCommand(source)
    expect(result.annotations).toEqual({
      topology: 'fanout',
      memory: 'shared',
      on_error: 'escalate',
    })
    expect(result.body).toHaveLength(1)
  })

  test('command with no annotations has no annotations field', () => {
    const source = `command test {
  ask("hello")
}`
    const result = parseCommand(source)
    expect(result.annotations).toBeUndefined()
  })

  test('throws on unknown annotation key', () => {
    const source = `command test {
  @unknown value
  ask("hello")
}`
    expect(() => parseCommand(source)).toThrow('Unknown annotation @unknown')
  })

  test('throws on invalid annotation value', () => {
    const source = `command test {
  @topology invalid
  ask("hello")
}`
    expect(() => parseCommand(source)).toThrow('Invalid value "invalid" for @topology')
  })

  test('throws on duplicate annotation', () => {
    const source = `command test {
  @topology pipeline
  @topology fanout
  ask("hello")
}`
    expect(() => parseCommand(source)).toThrow('Duplicate annotation: @topology')
  })

  test('throws on annotations after statements', () => {
    const source = `command test {
  ask("hello")
  @topology pipeline
}`
    expect(() => parseCommand(source)).toThrow('Annotations must appear before other statements')
  })
})

describe('annotation compilation', () => {
  test('emits annotations header block', () => {
    const result = compileCommand({
      name: 'test',
      body: [{ type: 'ask', question: 'hello' }],
      annotations: { topology: 'pipeline', memory: 'shared', on_error: 'escalate' },
    })
    expect(result).toContain('[annotations]')
    expect(result).toContain('topology: pipeline')
    expect(result).toContain('memory: shared')
    expect(result).toContain('on_error: escalate')
  })

  test('no annotations header when no annotations', () => {
    const result = compileCommand({
      name: 'test',
      body: [{ type: 'ask', question: 'hello' }],
    })
    expect(result).not.toContain('[annotations]')
  })
})

describe('status line injection', () => {
  test('task includes status line when annotations present', () => {
    const result = compileCommand({
      name: 'test',
      body: [{
        type: 'task',
        description: 'build',
        agent: 'bash',
        body: [{ type: 'ask', question: 'Run build' }],
      }],
      annotations: { topology: 'pipeline' },
    })
    expect(result).toContain('[status: ok]')
    expect(result).toContain('[status: error]')
  })

  test('task has no status line without annotations', () => {
    const result = compileCommand({
      name: 'test',
      body: [{
        type: 'task',
        description: 'build',
        agent: 'bash',
        body: [{ type: 'ask', question: 'Run build' }],
      }],
    })
    expect(result).not.toContain('[status: ok]')
  })

  test('parallel tasks include status lines in engine mode', () => {
    const result = compileCommand({
      name: 'test',
      body: [{
        type: 'parallel',
        tasks: [
          { type: 'task', description: 'a', agent: 'bash', body: [{ type: 'ask', question: 'do a' }] },
          { type: 'task', description: 'b', agent: 'bash', body: [{ type: 'ask', question: 'do b' }] },
        ],
      }],
      annotations: { topology: 'fanout' },
    })
    const matches = result.match(/\[status: ok\]/g)
    expect(matches).toHaveLength(2)
  })
})

describe('end to end: annotated workflow', () => {
  test('full pipeline: parse -> compile with annotations and status lines', () => {
    const source = `command deploy {
  @topology pipeline
  @memory shared
  task bash "build" {
    ask("Run the build")
  }
  task bash "test" {
    ask("Run tests")
  }
}`
    const parsed = parseCommand(source)
    expect(parsed.annotations).toEqual({ topology: 'pipeline', memory: 'shared' })

    const compiled = compileCommand(parsed)
    expect(compiled).toContain('[annotations]')
    expect(compiled).toContain('topology: pipeline')
    expect(compiled).toContain('memory: shared')
    expect(compiled).toContain('[status: ok]')
    expect(compiled).toContain('Spawn a Bash subagent task: "build"')
    expect(compiled).toContain('Spawn a Bash subagent task: "test"')
  })

  test('full pipeline: parse -> compile without annotations (backward compatible)', () => {
    const source = `command simple {
  ask("What?")
  wait_for_response()
}`
    const parsed = parseCommand(source)
    expect(parsed.annotations).toBeUndefined()

    const compiled = compileCommand(parsed)
    expect(compiled).not.toContain('[annotations]')
    expect(compiled).not.toContain('[status: ok]')
  })
})
