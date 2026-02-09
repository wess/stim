import { describe, test, expect } from 'bun:test'
import { parseCommand } from '../src/parser/index.js'
import { compileCommand } from '../src/compiler/index.js'
import { resolveTaskFiles } from '../src/resolve/index.js'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'

const parse = (source: string) => parseCommand(source)
const compile = (body: any[]) => compileCommand({ name: 'test', body })

describe('task parsing', () => {
  test('parses inline task with default agent', () => {
    const result = parse(`command test {
  task "explore auth" {
    ask("What patterns?")
  }
}`)
    expect(result.body[0].type).toBe('task')
    expect(result.body[0].description).toBe('explore auth')
    expect(result.body[0].agent).toBe('general')
    expect(result.body[0].body).toHaveLength(1)
    expect(result.body[0].body[0].type).toBe('ask')
  })

  test('parses inline task with explicit agent', () => {
    const result = parse(`command test {
  task explore "find patterns" {
    ask("What?")
  }
}`)
    expect(result.body[0].agent).toBe('explore')
    expect(result.body[0].description).toBe('find patterns')
  })

  test('parses task with bash agent', () => {
    const result = parse(`command test {
  task bash "run tests" {
    ask("Which tests?")
  }
}`)
    expect(result.body[0].agent).toBe('bash')
  })

  test('parses task with plan agent', () => {
    const result = parse(`command test {
  task plan "design system" {
    ask("What approach?")
  }
}`)
    expect(result.body[0].agent).toBe('plan')
  })

  test('parses task file reference', () => {
    const result = parse(`command test {
  task("helpers/research.stim")
}`)
    expect(result.body[0].type).toBe('task')
    expect(result.body[0].file).toBe('helpers/research.stim')
    expect(result.body[0].agent).toBe('general')
    expect(result.body[0].body).toEqual([])
  })

  test('parses task file reference with agent', () => {
    const result = parse(`command test {
  task("helpers/research.stim", explore)
}`)
    expect(result.body[0].file).toBe('helpers/research.stim')
    expect(result.body[0].agent).toBe('explore')
  })

  test('parses single-quoted task description', () => {
    const result = parse(`command test {
  task 'find auth' {
    ask("What?")
  }
}`)
    expect(result.body[0].description).toBe('find auth')
  })

  test('throws on invalid task statement', () => {
    expect(() => parse(`command test {
  task invalid
}`)).toThrow()
  })
})

describe('parallel parsing', () => {
  test('parses parallel block with tasks', () => {
    const result = parse(`command test {
  parallel {
    task "analyze frontend" {
      ask("What frontend patterns?")
    }
    task explore "analyze backend" {
      ask("What backend patterns?")
    }
  }
}`)
    expect(result.body[0].type).toBe('parallel')
    expect(result.body[0].tasks).toHaveLength(2)
    expect(result.body[0].tasks[0].type).toBe('task')
    expect(result.body[0].tasks[0].description).toBe('analyze frontend')
    expect(result.body[0].tasks[1].agent).toBe('explore')
  })

  test('throws on non-task statements in parallel', () => {
    expect(() => parse(`command test {
  parallel {
    ask("not a task")
  }
}`)).toThrow('parallel block may only contain task statements')
  })
})

describe('task compilation', () => {
  test('compiles inline task with default agent', () => {
    const result = compile([{
      type: 'task',
      description: 'explore auth',
      agent: 'general',
      body: [{ type: 'ask', question: 'What patterns?' }]
    }])
    expect(result).toContain('Spawn a general-purpose subagent task: "explore auth"')
    expect(result).toContain('subagent_type: general-purpose')
    expect(result).toContain('description: explore auth')
    expect(result).toContain('- Ask the user the question from variable: What patterns?')
  })

  test('compiles task with explore agent', () => {
    const result = compile([{
      type: 'task',
      description: 'find patterns',
      agent: 'explore',
      body: [{ type: 'ask', question: 'What?' }]
    }])
    expect(result).toContain('Spawn a Explore subagent task: "find patterns"')
    expect(result).toContain('subagent_type: Explore')
  })

  test('compiles task with bash agent', () => {
    const result = compile([{
      type: 'task',
      description: 'run tests',
      agent: 'bash',
      body: [{ type: 'ask', question: 'Which?' }]
    }])
    expect(result).toContain('subagent_type: Bash')
  })

  test('compiles task with plan agent', () => {
    const result = compile([{
      type: 'task',
      description: 'design system',
      agent: 'plan',
      body: [{ type: 'ask', question: 'How?' }]
    }])
    expect(result).toContain('subagent_type: Plan')
  })

  test('compiles parallel block', () => {
    const result = compile([{
      type: 'parallel',
      tasks: [
        { type: 'task', description: 'analyze frontend', agent: 'general', body: [{ type: 'ask', question: 'What frontend patterns?' }] },
        { type: 'task', description: 'analyze backend', agent: 'explore', body: [{ type: 'ask', question: 'What backend patterns?' }] }
      ]
    }])
    expect(result).toContain('Spawn 2 subagent tasks in parallel:')
    expect(result).toContain('### Task 1')
    expect(result).toContain('### Task 2')
    expect(result).toContain('general-purpose')
    expect(result).toContain('Explore')
  })
})

describe('task file resolution', () => {
  const tmpDir = join(tmpdir(), 'stim-test-' + Date.now())

  test('resolves task file reference', () => {
    mkdirSync(join(tmpDir, 'helpers'), { recursive: true })
    writeFileSync(join(tmpDir, 'helpers', 'research.stim'), `command research {
  ask("What should I research?")
  wait_for_response()
}`)

    const command = {
      name: 'test',
      body: [{
        type: 'task' as const,
        description: '',
        agent: 'general' as const,
        body: [],
        file: 'helpers/research.stim'
      }]
    }

    const resolved = resolveTaskFiles(command, tmpDir)
    expect(resolved.body[0].description).toBe('research')
    expect(resolved.body[0].body).toHaveLength(2)
    expect(resolved.body[0].body[0].type).toBe('ask')
    expect(resolved.body[0].body[1].type).toBe('wait_for_response')

    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('throws on missing task file', () => {
    const command = {
      name: 'test',
      body: [{
        type: 'task' as const,
        description: '',
        agent: 'general' as const,
        body: [],
        file: 'nonexistent.stim'
      }]
    }

    expect(() => resolveTaskFiles(command, tmpDir)).toThrow('Task file not found')
  })

  test('detects circular references', () => {
    const circDir = join(tmpdir(), 'stim-circ-' + Date.now())
    mkdirSync(circDir, { recursive: true })
    writeFileSync(join(circDir, 'a.stim'), `command a {
  task("b.stim")
}`)
    writeFileSync(join(circDir, 'b.stim'), `command b {
  task("a.stim")
}`)

    const source = `command a {
  task("b.stim")
}`
    const parsed = parseCommand(source)
    expect(() => resolveTaskFiles(parsed, circDir)).toThrow('Circular task file reference')

    rmSync(circDir, { recursive: true, force: true })
  })
})

describe('end to end: task pipeline', () => {
  test('parse and compile inline task', () => {
    const source = `command research {
  task explore "find auth patterns" {
    ask("What patterns exist?")
    wait_for_response()
  }
}`
    const command = parseCommand(source)
    const md = compileCommand(command)

    expect(md).toContain('Spawn a Explore subagent task: "find auth patterns"')
    expect(md).toContain('subagent_type: Explore')
    expect(md).toContain('description: find auth patterns')
    expect(md).toContain('Ask the user the question from variable: What patterns exist?')
    expect(md).toContain('Wait for user response before continuing.')
  })

  test('parse and compile parallel block', () => {
    const source = `command analyze {
  parallel {
    task "analyze frontend" {
      ask("What frontend patterns?")
    }
    task explore "analyze backend" {
      ask("What backend patterns?")
    }
  }
}`
    const command = parseCommand(source)
    const md = compileCommand(command)

    expect(md).toContain('Spawn 2 subagent tasks in parallel:')
    expect(md).toContain('### Task 1')
    expect(md).toContain('### Task 2')
  })
})
