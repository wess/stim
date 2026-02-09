import { describe, test, expect, beforeEach, afterEach, spyOn } from 'bun:test'
import { mkdirSync, rmSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { handleAdd } from '../src/add/index.js'
import { readLock } from '../src/lockfile/index.js'

const TMP = resolve(import.meta.dir, '../.tmp/add')
const COMMANDS_DIR = resolve(TMP, '.claude', 'commands')

const STIM_SOURCE = `command brainstorm {
  ask("What topic?")
  wait_for_response()
}`

const STIM_SOURCE_2 = `command recall {
  ask("What to recall?")
}`

const MANIFEST = {
  name: 'brainstorm',
  version: '1.0.0',
  author: 'wess',
  commands: ['brainstorm.stim', 'recall.stim'],
}

const originalFetch = globalThis.fetch
const originalCwd = process.cwd
const originalExit = process.exit
const originalError = console.error
const originalLog = console.log

beforeEach(() => {
  mkdirSync(TMP, { recursive: true })
  process.cwd = () => TMP
  process.exit = (() => { throw new Error('process.exit') }) as any
  console.error = () => {}
  console.log = () => {}
})

afterEach(() => {
  rmSync(TMP, { recursive: true, force: true })
  globalThis.fetch = originalFetch
  process.cwd = originalCwd
  process.exit = originalExit
  console.error = originalError
  console.log = originalLog
})

const mockFetch = () => {
  globalThis.fetch = (async (url: string) => {
    if (url.includes('/releases/latest')) {
      return new Response(JSON.stringify({ tag_name: 'v1.0.0' }), { status: 200 })
    }
    if (url.endsWith('/stim.json')) {
      return new Response(JSON.stringify(MANIFEST), { status: 200 })
    }
    if (url.endsWith('/brainstorm.stim')) {
      return new Response(STIM_SOURCE, { status: 200 })
    }
    if (url.endsWith('/recall.stim')) {
      return new Response(STIM_SOURCE_2, { status: 200 })
    }
    return new Response('', { status: 404 })
  }) as any
}

describe('handleAdd', () => {
  test('exits when no source provided', () => {
    expect(() => handleAdd([])).toThrow('process.exit')
  })

  test('installs package locally with --local', async () => {
    mockFetch()
    await handleAdd(['github/wess/brainstorm', '--local'])

    expect(existsSync(resolve(COMMANDS_DIR, 'brainstorm.md'))).toBe(true)
    expect(existsSync(resolve(COMMANDS_DIR, 'recall.md'))).toBe(true)
  })

  test('compiles .stim files to markdown', async () => {
    mockFetch()
    await handleAdd(['github/wess/brainstorm', '--local'])

    const md = readFileSync(resolve(COMMANDS_DIR, 'brainstorm.md'), 'utf-8')
    expect(md).toContain('Ask the user the question from variable: What topic?')
    expect(md).toContain('Wait for user response before continuing.')
  })

  test('creates lockfile with package entry', async () => {
    mockFetch()
    await handleAdd(['github/wess/brainstorm', '--local'])

    const lock = readLock(resolve(TMP, '.claude'))
    const entry = lock.packages['github/wess/brainstorm']
    expect(entry).toBeDefined()
    expect(entry.version).toBe('v1.0.0')
    expect(entry.commands).toEqual(['brainstorm', 'recall'])
  })

  test('installs with pinned tag', async () => {
    globalThis.fetch = (async (url: string) => {
      if (url.includes('v2.0.0/stim.json')) {
        return new Response(JSON.stringify({ ...MANIFEST, commands: ['brainstorm.stim'] }), { status: 200 })
      }
      if (url.includes('v2.0.0/brainstorm.stim')) {
        return new Response(STIM_SOURCE, { status: 200 })
      }
      return new Response('', { status: 404 })
    }) as any

    await handleAdd(['github/wess/brainstorm@v2.0.0', '--local'])

    const lock = readLock(resolve(TMP, '.claude'))
    expect(lock.packages['github/wess/brainstorm'].version).toBe('v2.0.0')
  })

  test('creates commands directory if it does not exist', async () => {
    mockFetch()
    expect(existsSync(COMMANDS_DIR)).toBe(false)

    await handleAdd(['github/wess/brainstorm', '--local'])

    expect(existsSync(COMMANDS_DIR)).toBe(true)
  })

  test('prints success message', async () => {
    mockFetch()
    const logs: string[] = []
    console.log = (...args: any[]) => logs.push(args.join(' '))

    await handleAdd(['github/wess/brainstorm', '--local'])

    expect(logs.some(l => l.includes('Added github/wess/brainstorm@v1.0.0'))).toBe(true)
    expect(logs.some(l => l.includes('2 commands'))).toBe(true)
  })

  test('exits on invalid source format', () => {
    expect(handleAdd(['bad-source', '--local'])).rejects.toThrow('process.exit')
  })

  test('exits on fetch failure', () => {
    globalThis.fetch = (async () => {
      return new Response('', { status: 404 })
    }) as any

    expect(handleAdd(['github/wess/brainstorm@v1.0.0', '--local'])).rejects.toThrow('process.exit')
  })
})
