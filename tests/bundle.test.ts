import { describe, test, expect } from 'bun:test'
import { isBundle } from '../src/install/index.js'

describe('bundle detection', () => {
  test('detects bundle when filename matches directory name', () => {
    expect(isBundle('/path/to/engine/engine.stim')).toBe(true)
  })

  test('detects bundle with index.stim', () => {
    expect(isBundle('/path/to/engine/index.stim')).toBe(true)
  })

  test('does not detect bundle for regular file', () => {
    expect(isBundle('/path/to/workflows/deploy.stim')).toBe(false)
  })

  test('detects bundle when dirname matches stim name', () => {
    expect(isBundle('/path/to/myengine/myengine.stim')).toBe(true)
  })

  test('does not detect single file in root-like path', () => {
    expect(isBundle('/path/to/commands/deploy.stim')).toBe(false)
  })
})
