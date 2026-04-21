import type { Declaration } from '../types/index.js'
import { claude } from './claude/index.js'
import { chatgpt } from './chatgpt/index.js'
import { cursor } from './cursor/index.js'

export type CompileOptions = {
  strict?: boolean
}

export type InstallOptions = {
  local: boolean
}

export type InstallPath = {
  path: string
  scope: string
}

export type Target = {
  name: string
  compile: (decl: Declaration, opts?: CompileOptions) => string
  destination: (decl: Declaration, opts: InstallOptions) => InstallPath
  extension: string
  displayName?: (decl: Declaration) => string
}

const targets: Record<string, Target> = {
  claude: claude,
  chatgpt: chatgpt,
  cursor: cursor,
}

export const DEFAULT_TARGET = 'claude'

export const getTarget = (name: string): Target => {
  const target = targets[name]
  if (!target) {
    const available = Object.keys(targets).join(', ')
    throw new Error(`Unknown target "${name}". Available: ${available}`)
  }
  return target
}

export const listTargets = (): string[] => Object.keys(targets)

export const warnDropped = (target: string, kind: string, fields: string[]) => {
  if (fields.length === 0) return
  const list = fields.map(f => `"${f}"`).join(', ')
  console.warn(`warning: ${target} target does not support ${kind} field(s) ${list}; ignoring`)
}

export const extractTarget = (args: string[]): { target: string, rest: string[] } => {
  const rest: string[] = []
  let target = DEFAULT_TARGET

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--target') {
      const next = args[i + 1]
      if (!next || next.startsWith('--')) {
        throw new Error('--target requires a value')
      }
      target = next
      i++
    } else {
      rest.push(args[i])
    }
  }

  return { target, rest }
}
