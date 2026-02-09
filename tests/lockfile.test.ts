import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { mkdirSync, rmSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { readLock, writeLock } from '../src/lockfile/index.js'
import type { StimLock } from '../src/types/index.js'

const TMP = resolve(import.meta.dir, '../.tmp/lockfile')

beforeEach(() => {
  mkdirSync(TMP, { recursive: true })
})

afterEach(() => {
  rmSync(TMP, { recursive: true, force: true })
})

describe('readLock', () => {
  test('returns empty packages when file does not exist', () => {
    const lock = readLock(TMP)
    expect(lock).toEqual({ packages: {} })
  })

  test('returns empty packages on corrupt JSON', () => {
    writeFileSync(resolve(TMP, 'stim.lock'), 'not json at all', 'utf-8')
    const lock = readLock(TMP)
    expect(lock).toEqual({ packages: {} })
  })

  test('parses valid lockfile', () => {
    const data: StimLock = {
      packages: {
        'github/wess/brainstorm': {
          version: 'v1.0.0',
          commands: ['brainstorm', 'recall'],
        },
      },
    }
    writeFileSync(resolve(TMP, 'stim.lock'), JSON.stringify(data), 'utf-8')

    const lock = readLock(TMP)
    expect(lock.packages['github/wess/brainstorm'].version).toBe('v1.0.0')
    expect(lock.packages['github/wess/brainstorm'].commands).toEqual(['brainstorm', 'recall'])
  })

  test('parses lockfile with multiple packages', () => {
    const data: StimLock = {
      packages: {
        'github/wess/brainstorm': { version: 'v1.0.0', commands: ['brainstorm'] },
        'github/wess/tools': { version: 'v2.0.0', commands: ['lint', 'fmt'] },
      },
    }
    writeFileSync(resolve(TMP, 'stim.lock'), JSON.stringify(data), 'utf-8')

    const lock = readLock(TMP)
    expect(Object.keys(lock.packages)).toHaveLength(2)
  })
})

describe('writeLock', () => {
  test('writes formatted JSON with trailing newline', () => {
    const lock: StimLock = {
      packages: {
        'github/wess/brainstorm': {
          version: 'v1.0.0',
          commands: ['brainstorm'],
        },
      },
    }

    writeLock(TMP, lock)

    const raw = readFileSync(resolve(TMP, 'stim.lock'), 'utf-8')
    expect(raw.endsWith('\n')).toBe(true)
    expect(JSON.parse(raw)).toEqual(lock)
  })

  test('writes with 2-space indentation', () => {
    const lock: StimLock = { packages: {} }
    writeLock(TMP, lock)

    const raw = readFileSync(resolve(TMP, 'stim.lock'), 'utf-8')
    expect(raw).toBe(JSON.stringify(lock, null, 2) + '\n')
  })

  test('overwrites existing lockfile', () => {
    const v1: StimLock = {
      packages: { 'github/a/b': { version: 'v1', commands: ['x'] } },
    }
    const v2: StimLock = {
      packages: { 'github/c/d': { version: 'v2', commands: ['y'] } },
    }

    writeLock(TMP, v1)
    writeLock(TMP, v2)

    const lock = readLock(TMP)
    expect(lock.packages['github/a/b']).toBeUndefined()
    expect(lock.packages['github/c/d'].version).toBe('v2')
  })
})

describe('round trip', () => {
  test('write then read returns identical data', () => {
    const lock: StimLock = {
      packages: {
        'github/wess/brainstorm': { version: 'v1.0.0', commands: ['brainstorm', 'recall'] },
        'github/wess/tools': { version: 'v3.2.1', commands: ['lint'] },
      },
    }

    writeLock(TMP, lock)
    const result = readLock(TMP)
    expect(result).toEqual(lock)
  })

  test('empty packages round trips', () => {
    const lock: StimLock = { packages: {} }
    writeLock(TMP, lock)
    expect(readLock(TMP)).toEqual(lock)
  })
})
