import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { handleRemove } from '../src/remove/index.js'
import { writeLock, readLock } from '../src/lockfile/index.js'
import type { StimLock } from '../src/types/index.js'

const TMP = resolve(import.meta.dir, '../.tmp/remove')
const BASE_DIR = resolve(TMP, '.claude')
const COMMANDS_DIR = resolve(BASE_DIR, 'commands')

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
  process.cwd = originalCwd
  process.exit = originalExit
  console.error = originalError
  console.log = originalLog
})

const seedPackage = (lock?: StimLock) => {
  const data = lock || {
    packages: {
      'github/wess/brainstorm': {
        version: 'v1.0.0',
        commands: ['brainstorm', 'recall'],
      },
    },
  }
  writeLock(BASE_DIR, data)
  for (const pkg of Object.values(data.packages)) {
    for (const cmd of pkg.commands) {
      writeFileSync(resolve(COMMANDS_DIR, `${cmd}.md`), '# test', 'utf-8')
    }
  }
}

describe('handleRemove', () => {
  test('exits when no source provided', () => {
    expect(() => handleRemove([])).toThrow('process.exit')
  })

  test('exits when package is not installed', () => {
    writeLock(BASE_DIR, { packages: {} })
    expect(() => handleRemove(['github/wess/brainstorm', '--local'])).toThrow('process.exit')
  })

  test('deletes command markdown files', () => {
    seedPackage()

    expect(existsSync(resolve(COMMANDS_DIR, 'brainstorm.md'))).toBe(true)
    expect(existsSync(resolve(COMMANDS_DIR, 'recall.md'))).toBe(true)

    handleRemove(['github/wess/brainstorm', '--local'])

    expect(existsSync(resolve(COMMANDS_DIR, 'brainstorm.md'))).toBe(false)
    expect(existsSync(resolve(COMMANDS_DIR, 'recall.md'))).toBe(false)
  })

  test('removes package entry from lockfile', () => {
    seedPackage()
    handleRemove(['github/wess/brainstorm', '--local'])

    const lock = readLock(BASE_DIR)
    expect(lock.packages['github/wess/brainstorm']).toBeUndefined()
  })

  test('preserves other packages in lockfile', () => {
    seedPackage({
      packages: {
        'github/wess/brainstorm': { version: 'v1.0.0', commands: ['brainstorm'] },
        'github/wess/tools': { version: 'v2.0.0', commands: ['lint'] },
      },
    })

    handleRemove(['github/wess/brainstorm', '--local'])

    const lock = readLock(BASE_DIR)
    expect(lock.packages['github/wess/brainstorm']).toBeUndefined()
    expect(lock.packages['github/wess/tools'].version).toBe('v2.0.0')
  })

  test('handles already-deleted command files gracefully', () => {
    const lock: StimLock = {
      packages: {
        'github/wess/brainstorm': { version: 'v1.0.0', commands: ['brainstorm'] },
      },
    }
    writeLock(BASE_DIR, lock)
    // intentionally not creating the .md file

    handleRemove(['github/wess/brainstorm', '--local'])

    const result = readLock(BASE_DIR)
    expect(result.packages['github/wess/brainstorm']).toBeUndefined()
  })

  test('prints success message', () => {
    seedPackage()
    const logs: string[] = []
    console.log = (...args: any[]) => logs.push(args.join(' '))

    handleRemove(['github/wess/brainstorm', '--local'])

    expect(logs.some(l => l.includes('Removed github/wess/brainstorm'))).toBe(true)
    expect(logs.some(l => l.includes('2 commands'))).toBe(true)
  })

  test('exits on invalid source format', () => {
    expect(() => handleRemove(['bad-source', '--local'])).toThrow('process.exit')
  })
})
