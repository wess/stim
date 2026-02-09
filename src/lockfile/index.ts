import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import type { StimLock } from '../types/index.js'

const LOCK_FILE = 'stim.lock'

export const readLock = (dir: string): StimLock => {
  const lockPath = resolve(dir, LOCK_FILE)

  if (!existsSync(lockPath)) {
    return { packages: {} }
  }

  try {
    return JSON.parse(readFileSync(lockPath, 'utf-8'))
  } catch {
    return { packages: {} }
  }
}

export const writeLock = (dir: string, lock: StimLock): void => {
  const lockPath = resolve(dir, LOCK_FILE)
  writeFileSync(lockPath, JSON.stringify(lock, null, 2) + '\n', 'utf-8')
}
