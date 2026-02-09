import { describe, test, expect } from 'bun:test'
import { parseCommand } from '../src/parser/index.js'

describe('parseCommand', () => {
  test('parses basic command with name', () => {
    const result = parseCommand('command hello {\n  ask("What is your name?")\n}')
    expect(result.name).toBe('hello')
    expect(result.body).toHaveLength(1)
  })

  test('throws on empty source', () => {
    expect(() => parseCommand('')).toThrow('Empty command file')
  })

  test('throws on missing command declaration', () => {
    expect(() => parseCommand('hello {')).toThrow('Expected command declaration')
  })

  test('throws on malformed command line', () => {
    expect(() => parseCommand('command {')).toThrow('Expected command declaration')
  })
})

describe('ask statement', () => {
  test('parses double-quoted string', () => {
    const result = parseCommand('command test {\n  ask("What?")\n}')
    expect(result.body[0]).toEqual({ type: 'ask', question: 'What?' })
  })

  test('parses single-quoted string', () => {
    const result = parseCommand("command test {\n  ask('What?')\n}")
    expect(result.body[0]).toEqual({ type: 'ask', question: 'What?' })
  })

  test('parses variable reference', () => {
    const result = parseCommand('command test {\n  ask(myVar)\n}')
    expect(result.body[0]).toEqual({ type: 'ask', question: 'myVar' })
  })
})

describe('confirm statement', () => {
  test('parses double-quoted message', () => {
    const result = parseCommand('command test {\n  confirm("Proceed?")\n}')
    expect(result.body[0]).toEqual({ type: 'confirm', message: 'Proceed?' })
  })

  test('parses single-quoted message', () => {
    const result = parseCommand("command test {\n  confirm('Proceed?')\n}")
    expect(result.body[0]).toEqual({ type: 'confirm', message: 'Proceed?' })
  })
})

describe('variable assignment', () => {
  test('parses string value', () => {
    const result = parseCommand('command test {\n  name = "alice"\n}')
    expect(result.body[0]).toEqual({ type: 'variable_assignment', name: 'name', value: 'alice' })
  })

  test('parses array value', () => {
    const result = parseCommand('command test {\n  items = ["a", "b", "c"]\n}')
    expect(result.body[0]).toEqual({
      type: 'variable_assignment',
      name: 'items',
      value: ['a', 'b', 'c'],
    })
  })

  test('parses boolean true', () => {
    const result = parseCommand('command test {\n  flag = true\n}')
    expect(result.body[0]).toEqual({ type: 'variable_assignment', name: 'flag', value: true })
  })

  test('parses boolean false', () => {
    const result = parseCommand('command test {\n  flag = false\n}')
    expect(result.body[0]).toEqual({ type: 'variable_assignment', name: 'flag', value: false })
  })
})

describe('create_file statement', () => {
  test('parses filename and content', () => {
    const result = parseCommand('command test {\n  create_file("out.txt", content)\n}')
    expect(result.body[0]).toEqual({ type: 'create_file', filename: 'out.txt', content: 'content' })
  })
})

describe('control flow', () => {
  test('parses if block', () => {
    const source = `command test {
  if (x > 0) {
    ask("positive?")
  }
}`
    const result = parseCommand(source)
    expect(result.body[0].type).toBe('if')
    expect(result.body[0].condition).toBe('x > 0')
    expect(result.body[0].body).toHaveLength(1)
    expect(result.body[0].body[0].type).toBe('ask')
  })

  test('parses while block', () => {
    const source = `command test {
  while (running) {
    ask("continue?")
  }
}`
    const result = parseCommand(source)
    expect(result.body[0].type).toBe('while')
    expect(result.body[0].condition).toBe('running')
    expect(result.body[0].body).toHaveLength(1)
  })

  test('parses for block', () => {
    const source = `command test {
  for item in items {
    ask(item)
  }
}`
    const result = parseCommand(source)
    expect(result.body[0].type).toBe('for')
    expect(result.body[0].variable).toBe('item')
    expect(result.body[0].iterable).toBe('items')
    expect(result.body[0].body).toHaveLength(1)
  })

  test('parses break', () => {
    const source = `command test {
  while (true) {
    break
  }
}`
    const result = parseCommand(source)
    expect(result.body[0].body[0]).toEqual({ type: 'break' })
  })
})

describe('wait_for_response', () => {
  test('parses standalone call', () => {
    const result = parseCommand('command test {\n  wait_for_response()\n}')
    expect(result.body[0]).toEqual({ type: 'wait_for_response' })
  })
})

describe('function call', () => {
  test('parses call with no args', () => {
    const result = parseCommand('command test {\n  doStuff()\n}')
    expect(result.body[0]).toEqual({ type: 'function_call', name: 'doStuff', args: [] })
  })

  test('parses call with args', () => {
    const result = parseCommand('command test {\n  doStuff(a, b)\n}')
    expect(result.body[0]).toEqual({ type: 'function_call', name: 'doStuff', args: ['a', 'b'] })
  })
})

describe('multiple statements', () => {
  test('parses sequential statements', () => {
    const source = `command multi {
  name = "test"
  ask("hello?")
  wait_for_response()
  confirm("ok?")
}`
    const result = parseCommand(source)
    expect(result.body).toHaveLength(4)
    expect(result.body[0].type).toBe('variable_assignment')
    expect(result.body[1].type).toBe('ask')
    expect(result.body[2].type).toBe('wait_for_response')
    expect(result.body[3].type).toBe('confirm')
  })

  test('parses nested control flow', () => {
    const source = `command nested {
  if (a) {
    if (b) {
      ask("deep")
    }
  }
}`
    const result = parseCommand(source)
    expect(result.body[0].type).toBe('if')
    expect(result.body[0].body[0].type).toBe('if')
    expect(result.body[0].body[0].body[0].type).toBe('ask')
  })
})
