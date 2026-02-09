import { describe, test, expect } from 'bun:test'
import { compileCommand } from '../src/compiler/index.js'
import type { Command } from '../src/types/index.js'

const compile = (body: any[]): string =>
  compileCommand({ name: 'test', body })

describe('compileCommand', () => {
  test('compiles ask with parsed string (quotes stripped by parser)', () => {
    // parser strips quotes, so the compiler sees a bare string and treats it as variable ref
    const result = compile([{ type: 'ask', question: 'What?' }])
    expect(result).toBe('Ask the user the question from variable: What?')
  })

  test('compiles ask with quoted string (pre-parser input)', () => {
    // if question still has quotes, compiler detects it as a string literal
    const result = compile([{ type: 'ask', question: '"What?"' }])
    expect(result).toBe('Ask the user: ""What?""')
  })

  test('compiles ask with variable reference', () => {
    const result = compile([{ type: 'ask', question: 'myVar' }])
    expect(result).toBe('Ask the user the question from variable: myVar')
  })

  test('compiles confirm', () => {
    const result = compile([{ type: 'confirm', message: 'Proceed?' }])
    expect(result).toBe('Ask for confirmation: "Proceed?"')
  })

  test('compiles create_file', () => {
    const result = compile([{ type: 'create_file', filename: 'out.txt', content: 'data' }])
    expect(result).toBe('Create file "out.txt" with content: data')
  })

  test('compiles wait_for_response', () => {
    const result = compile([{ type: 'wait_for_response' }])
    expect(result).toBe('Wait for user response before continuing.')
  })

  test('compiles break', () => {
    const result = compile([{ type: 'break' }])
    expect(result).toBe('Stop current loop/process.')
  })

  test('compiles variable assignment', () => {
    const result = compile([{ type: 'variable_assignment', name: 'x', value: 42 }])
    expect(result).toBe('Set x = 42')
  })

  test('compiles function call without args', () => {
    const result = compile([{ type: 'function_call', name: 'doStuff', args: [] }])
    expect(result).toBe('Call function doStuff')
  })

  test('compiles function call with args', () => {
    const result = compile([{ type: 'function_call', name: 'doStuff', args: ['a', 'b'] }])
    expect(result).toBe('Call function doStuff with arguments: a, b')
  })

  test('compiles if block', () => {
    const result = compile([{
      type: 'if',
      condition: 'x > 0',
      body: [{ type: 'ask', question: 'positive?' }],
    }])
    expect(result).toContain('If x > 0:')
    expect(result).toContain('- Ask the user the question from variable: positive?')
  })

  test('compiles if/else block', () => {
    const result = compile([{
      type: 'if',
      condition: 'x > 0',
      body: [{ type: 'ask', question: 'yes' }],
      else: [{ type: 'ask', question: 'no' }],
    }])
    expect(result).toContain('If x > 0:')
    expect(result).toContain('Otherwise:')
    expect(result).toContain('- Ask the user the question from variable: no')
  })

  test('compiles while block', () => {
    const result = compile([{
      type: 'while',
      condition: 'running',
      body: [{ type: 'ask', question: 'again?' }],
    }])
    expect(result).toContain('While running, repeat:')
    expect(result).toContain('- Ask the user the question from variable: again?')
  })

  test('compiles for block', () => {
    const result = compile([{
      type: 'for',
      variable: 'item',
      iterable: 'items',
      body: [{ type: 'ask', question: 'item' }],
    }])
    expect(result).toContain('For each item in items:')
  })

  test('joins multiple statements with double newline', () => {
    const result = compile([
      { type: 'ask', question: 'first' },
      { type: 'ask', question: 'second' },
    ])
    expect(result).toBe('Ask the user the question from variable: first\n\nAsk the user the question from variable: second')
  })

  test('handles unknown statement type gracefully', () => {
    const result = compile([{ type: 'unknown_thing' }])
    expect(result).toContain('Unknown statement type')
  })
})

describe('end to end: parse then compile', () => {
  const { parseCommand } = require('../src/parser/index.js')

  test('full pipeline produces valid markdown', () => {
    const source = `command greet {
  name = "world"
  ask("What is your name?")
  wait_for_response()
  confirm("Ready?")
}`
    const command = parseCommand(source)
    const md = compileCommand(command)

    expect(md).toContain('Set name = world')
    expect(md).toContain('Ask the user the question from variable: What is your name?')
    expect(md).toContain('Wait for user response before continuing.')
    expect(md).toContain('Ask for confirmation: "Ready?"')
  })
})
