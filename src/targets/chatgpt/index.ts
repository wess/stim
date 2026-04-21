import { resolve } from 'path'
import type { Declaration } from '../../types/index.js'
import { compileBody } from '../../compiler/index.js'
import type { Target, CompileOptions, InstallOptions, InstallPath } from '../index.js'
import { warnDropped } from '../index.js'

const compileCommand = (decl: Declaration): string => {
  const parts: string[] = []
  parts.push(`# ${decl.name}`)
  parts.push(...compileBody(decl.body, { engineMode: false, scope: decl.importedScope || {} }))
  return parts.join('\n\n')
}

const compileAgent = (decl: Declaration): string => {
  const dropped: string[] = []
  if (decl.metadata?.tools) dropped.push('tools')
  if (decl.metadata?.model) dropped.push('model')
  warnDropped('chatgpt', 'agent', dropped)

  const parts: string[] = []
  parts.push(`# ${decl.name}`)
  if (decl.metadata?.description) {
    parts.push(`> ${decl.metadata.description}`)
  }
  parts.push(...compileBody(decl.body, { engineMode: false, scope: decl.importedScope || {} }))
  return parts.join('\n\n')
}

const compile = (decl: Declaration, _opts?: CompileOptions): string => {
  return decl.kind === 'agent' ? compileAgent(decl) : compileCommand(decl)
}

const destination = (decl: Declaration, opts: InstallOptions): InstallPath => {
  const baseDir = opts.local
    ? resolve(process.cwd(), 'prompts')
    : resolve(process.cwd(), 'dist', 'chatgpt')

  return {
    path: resolve(baseDir, `${decl.name}.md`),
    scope: opts.local ? 'local' : 'dist',
  }
}

export const chatgpt: Target = {
  name: 'chatgpt',
  compile,
  destination,
  extension: '.md',
}
