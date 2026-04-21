import { resolve } from 'path'
import type { Declaration } from '../../types/index.js'
import { compileBody } from '../../compiler/index.js'
import type { Target, CompileOptions, InstallOptions, InstallPath } from '../index.js'
import { warnDropped } from '../index.js'

const buildFrontmatter = (decl: Declaration): string => {
  const lines = ['---']
  if (decl.metadata?.description) {
    lines.push(`description: ${decl.metadata.description}`)
  } else {
    lines.push(`description: ${decl.name}`)
  }
  lines.push('globs:')
  lines.push('alwaysApply: false')
  lines.push('---')
  return lines.join('\n')
}

const compile = (decl: Declaration, _opts?: CompileOptions): string => {
  const dropped: string[] = []
  if (decl.metadata?.tools) dropped.push('tools')
  if (decl.metadata?.model) dropped.push('model')
  warnDropped('cursor', decl.kind, dropped)

  const parts: string[] = [buildFrontmatter(decl)]
  parts.push(...compileBody(decl.body, { engineMode: false, scope: decl.importedScope || {} }))
  return parts.join('\n\n')
}

const destination = (decl: Declaration, _opts: InstallOptions): InstallPath => {
  return {
    path: resolve(process.cwd(), '.cursor', 'rules', `${decl.name}.mdc`),
    scope: 'project',
  }
}

export const cursor: Target = {
  name: 'cursor',
  compile,
  destination,
  extension: '.mdc',
}
