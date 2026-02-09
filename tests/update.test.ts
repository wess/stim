import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { handleUpdate } from '../src/update/index.js'
import { writeLock, readLock } from '../src/lockfile/index.js'
import type { StimLock } from '../src/types/index.js'

const TMP = resolve(import.meta.dir, '../.tmp/update')
const BASE_DIR = resolve(TMP, '.claude')
const COMMANDS_DIR = resolve(BASE_DIR, 'commands')

const STIM_V1 = `command brainstorm {
  ask("v1 question")
}`

const STIM_V2 = `command brainstorm {
  ask("v2 question")
}`

const MANIFEST_V2 = {
  name: 'brainstorm',
  version: '2.0.0',
  author: 'wess',
  commands: ['brainstorm.stim'],
}

const originalFetch = globalThis.fetch
const originalCwd = process.cwd
const originalExit = process.exit
const originalError = console.error
const originalLog = console.log

beforeEach(() => {
  mkdirSync(COMMANDS_DIR, { recursive: true })
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

describe('handleUpdate', () => {
  test('prints message when no packages installed', async () => {
    const logs: string[] = []
    console.log = (...args: any[]) => logs.push(args.join(' '))

    await handleUpdate(['--local'])

    expect(logs.some(l => l.includes('No packages installed'))).toBe(true)
  })

  test('reports up to date when version matches', async () => {
    writeLock(BASE_DIR, {
      packages: {
        'github/wess/brainstorm': { version: 'v1.0.0', commands: ['brainstorm'] },
      },
    })
    writeFileSync(resolve(COMMANDS_DIR, 'brainstorm.md'), '# old', 'utf-8')

    globalThis.fetch = (async (url: string) => {
      if (url.includes('/releases/latest')) {
        return new Response(JSON.stringify({ tag_name: 'v1.0.0' }), { status: 200 })
      }
      return new Response('', { status: 404 })
    }) as any

    const logs: string[] = []
    console.log = (...args: any[]) => logs.push(args.join(' '))

    await handleUpdate(['--local'])

    expect(logs.some(l => l.includes('All packages up to date'))).toBe(true)
  })

  test('updates package when newer version available', async () => {
    writeLock(BASE_DIR, {
      packages: {
        'github/wess/brainstorm': { version: 'v1.0.0', commands: ['brainstorm'] },
      },
    })
    writeFileSync(resolve(COMMANDS_DIR, 'brainstorm.md'), '# old', 'utf-8')

    globalThis.fetch = (async (url: string) => {
      if (url.includes('/releases/latest')) {
        return new Response(JSON.stringify({ tag_name: 'v2.0.0' }), { status: 200 })
      }
      if (url.endsWith('/stim.json')) {
        return new Response(JSON.stringify(MANIFEST_V2), { status: 200 })
      }
      if (url.endsWith('/brainstorm.stim')) {
        return new Response(STIM_V2, { status: 200 })
      }
      return new Response('', { status: 404 })
    }) as any

    const logs: string[] = []
    console.log = (...args: any[]) => logs.push(args.join(' '))

    await handleUpdate(['--local'])

    const lock = readLock(BASE_DIR)
    expect(lock.packages['github/wess/brainstorm'].version).toBe('v2.0.0')

    const md = readFileSync(resolve(COMMANDS_DIR, 'brainstorm.md'), 'utf-8')
    expect(md).toContain('v2 question')

    expect(logs.some(l => l.includes('Updated github/wess/brainstorm v1.0.0 → v2.0.0'))).toBe(true)
  })

  test('updates specific package only', async () => {
    writeLock(BASE_DIR, {
      packages: {
        'github/wess/brainstorm': { version: 'v1.0.0', commands: ['brainstorm'] },
        'github/wess/tools': { version: 'v1.0.0', commands: ['lint'] },
      },
    })
    writeFileSync(resolve(COMMANDS_DIR, 'brainstorm.md'), '# old', 'utf-8')
    writeFileSync(resolve(COMMANDS_DIR, 'lint.md'), '# old', 'utf-8')

    globalThis.fetch = (async (url: string) => {
      if (url.includes('/releases/latest')) {
        return new Response(JSON.stringify({ tag_name: 'v2.0.0' }), { status: 200 })
      }
      if (url.endsWith('/stim.json')) {
        return new Response(JSON.stringify(MANIFEST_V2), { status: 200 })
      }
      if (url.endsWith('/brainstorm.stim')) {
        return new Response(STIM_V2, { status: 200 })
      }
      return new Response('', { status: 404 })
    }) as any

    await handleUpdate(['github/wess/brainstorm', '--local'])

    const lock = readLock(BASE_DIR)
    expect(lock.packages['github/wess/brainstorm'].version).toBe('v2.0.0')
    expect(lock.packages['github/wess/tools'].version).toBe('v1.0.0')
  })

  test('exits when specified package is not installed', () => {
    writeLock(BASE_DIR, {
      packages: {
        'github/wess/brainstorm': { version: 'v1.0.0', commands: ['brainstorm'] },
      },
    })

    expect(handleUpdate(['github/wess/other', '--local'])).rejects.toThrow('process.exit')
  })

  test('updates multiple packages', async () => {
    writeLock(BASE_DIR, {
      packages: {
        'github/wess/brainstorm': { version: 'v1.0.0', commands: ['brainstorm'] },
        'github/wess/tools': { version: 'v1.0.0', commands: ['tools'] },
      },
    })
    writeFileSync(resolve(COMMANDS_DIR, 'brainstorm.md'), '# old', 'utf-8')
    writeFileSync(resolve(COMMANDS_DIR, 'tools.md'), '# old', 'utf-8')

    const toolsStim = `command tools {
  ask("which tool?")
}`

    globalThis.fetch = (async (url: string) => {
      if (url.includes('/releases/latest')) {
        return new Response(JSON.stringify({ tag_name: 'v2.0.0' }), { status: 200 })
      }
      if (url.includes('brainstorm') && url.endsWith('/stim.json')) {
        return new Response(JSON.stringify(MANIFEST_V2), { status: 200 })
      }
      if (url.includes('tools') && url.endsWith('/stim.json')) {
        return new Response(JSON.stringify({
          name: 'tools', version: '2.0.0', author: 'wess', commands: ['tools.stim'],
        }), { status: 200 })
      }
      if (url.endsWith('/brainstorm.stim')) {
        return new Response(STIM_V2, { status: 200 })
      }
      if (url.endsWith('/tools.stim')) {
        return new Response(toolsStim, { status: 200 })
      }
      return new Response('', { status: 404 })
    }) as any

    const logs: string[] = []
    console.log = (...args: any[]) => logs.push(args.join(' '))

    await handleUpdate(['--local'])

    const lock = readLock(BASE_DIR)
    expect(lock.packages['github/wess/brainstorm'].version).toBe('v2.0.0')
    expect(lock.packages['github/wess/tools'].version).toBe('v2.0.0')
    expect(logs.filter(l => l.includes('Updated'))).toHaveLength(2)
  })
})
