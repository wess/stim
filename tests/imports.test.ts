import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { parseCommand } from '../src/parser/index.js'
import { resolveImports } from '../src/imports/index.js'
import { compileCommand } from '../src/compiler/index.js'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'

describe('import parsing', () => {
  test('parses import before command block', () => {
    const source = `import "shared/prompts.stim"

command test {
  ask("hello")
}`
    const result = parseCommand(source)
    expect(result.imports).toEqual([{ path: 'shared/prompts.stim' }])
    expect(result.name).toBe('test')
  })

  test('parses multiple imports', () => {
    const source = `import "shared/prompts.stim"
import "shared/checks.stim"

command test {
  ask("hello")
}`
    const result = parseCommand(source)
    expect(result.imports).toHaveLength(2)
    expect(result.imports![0]).toEqual({ path: 'shared/prompts.stim' })
    expect(result.imports![1]).toEqual({ path: 'shared/checks.stim' })
  })

  test('parses single-quoted import', () => {
    const source = `import 'shared/prompts.stim'

command test {
  ask("hello")
}`
    const result = parseCommand(source)
    expect(result.imports).toEqual([{ path: 'shared/prompts.stim' }])
  })

  test('command without imports has no imports field', () => {
    const source = `command test {
  ask("hello")
}`
    const result = parseCommand(source)
    expect(result.imports).toBeUndefined()
  })

  test('imports work with annotations', () => {
    const source = `import "shared/prompts.stim"

command test {
  @topology pipeline
  ask("hello")
}`
    const result = parseCommand(source)
    expect(result.imports).toEqual([{ path: 'shared/prompts.stim' }])
    expect(result.annotations).toEqual({ topology: 'pipeline' })
    expect(result.body).toHaveLength(1)
  })
})

describe('import resolution', () => {
  const tmpDir = join(import.meta.dir, '.tmp')

  beforeEach(() => {
    mkdirSync(join(tmpDir, 'shared'), { recursive: true })
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('resolves variables from imported file', () => {
    writeFileSync(join(tmpDir, 'shared/prompts.stim'), 'build_prompt = "Run the build"\ntest_prompt = "Run tests"')

    const imports = [{ path: 'shared/prompts.stim' }]
    const result = resolveImports(imports, tmpDir, new Set())

    expect(result).toEqual({
      build_prompt: 'Run the build',
      test_prompt: 'Run tests',
    })
  })

  test('throws on circular import', () => {
    writeFileSync(join(tmpDir, 'shared/a.stim'), `import "b.stim"\nx = "a"`)
    writeFileSync(join(tmpDir, 'shared/b.stim'), `import "a.stim"\ny = "b"`)

    const imports = [{ path: 'shared/a.stim' }]
    expect(() => resolveImports(imports, tmpDir, new Set())).toThrow('Circular import')
  })

  test('later imports override earlier for same variable', () => {
    writeFileSync(join(tmpDir, 'shared/a.stim'), 'x = "from a"')
    writeFileSync(join(tmpDir, 'shared/b.stim'), 'x = "from b"')

    const imports = [{ path: 'shared/a.stim' }, { path: 'shared/b.stim' }]
    const result = resolveImports(imports, tmpDir, new Set())

    expect(result.x).toBe('from b')
  })

  test('resolves nested imports', () => {
    writeFileSync(join(tmpDir, 'shared/base.stim'), 'base_var = "base value"')
    writeFileSync(join(tmpDir, 'shared/mid.stim'), `import "base.stim"\nmid_var = "mid value"`)

    const imports = [{ path: 'shared/mid.stim' }]
    const result = resolveImports(imports, tmpDir, new Set())

    expect(result.base_var).toBe('base value')
    expect(result.mid_var).toBe('mid value')
  })

  test('throws on missing import file', () => {
    const imports = [{ path: 'shared/nonexistent.stim' }]
    expect(() => resolveImports(imports, tmpDir, new Set())).toThrow('Import file not found')
  })

  test('resolves array values', () => {
    writeFileSync(join(tmpDir, 'shared/lists.stim'), 'items = ["a", "b", "c"]')

    const imports = [{ path: 'shared/lists.stim' }]
    const result = resolveImports(imports, tmpDir, new Set())

    expect(result.items).toEqual(['a', 'b', 'c'])
  })

  test('resolves boolean values', () => {
    writeFileSync(join(tmpDir, 'shared/flags.stim'), 'verbose = true\nquiet = false')

    const imports = [{ path: 'shared/flags.stim' }]
    const result = resolveImports(imports, tmpDir, new Set())

    expect(result.verbose).toBe(true)
    expect(result.quiet).toBe(false)
  })
})

describe('import variable substitution in compilation', () => {
  test('ask() with imported variable gets substituted', () => {
    const result = compileCommand({
      name: 'test',
      body: [{ type: 'ask', question: 'build_prompt' }],
      importedScope: { build_prompt: 'Run the build and report results' },
    })
    expect(result).toContain('Ask the user: "Run the build and report results"')
  })

  test('ask() without matching scope stays as variable reference', () => {
    const result = compileCommand({
      name: 'test',
      body: [{ type: 'ask', question: 'unknown_var' }],
      importedScope: { other_var: 'value' },
    })
    expect(result).toContain('Ask the user the question from variable: unknown_var')
  })

  test('confirm() with imported variable gets substituted', () => {
    const result = compileCommand({
      name: 'test',
      body: [{ type: 'confirm', message: 'confirm_msg' }],
      importedScope: { confirm_msg: 'Deploy to production?' },
    })
    expect(result).toContain('Ask for confirmation: "Deploy to production?"')
  })

  test('substitution works in nested if body', () => {
    const result = compileCommand({
      name: 'test',
      body: [{
        type: 'if',
        condition: 'ready',
        body: [{ type: 'ask', question: 'my_prompt' }],
      }],
      importedScope: { my_prompt: 'Do the thing' },
    })
    expect(result).toContain('Ask the user: "Do the thing"')
  })
})
