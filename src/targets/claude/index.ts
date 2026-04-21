import { resolve } from 'path'
import type { Declaration } from '../../types/index.js'
import { compileBody } from '../../compiler/index.js'
import type { Target, CompileOptions, InstallOptions, InstallPath } from '../index.js'

const resolveGlobalDir = () => {
  const homeDir = process.env.HOME || process.env.USERPROFILE
  if (!homeDir) {
    throw new Error('Could not determine home directory')
  }
  return resolve(homeDir, '.claude')
}

const yamlValue = (value: string | string[]): string => {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`
  }
  return value
}

const buildFrontmatter = (decl: Declaration): string => {
  const lines = ['---']
  lines.push(`name: ${decl.name}`)
  if (decl.metadata?.description) lines.push(`description: ${decl.metadata.description}`)
  if (decl.metadata?.tools) lines.push(`tools: ${yamlValue(decl.metadata.tools)}`)
  if (decl.metadata?.model) lines.push(`model: ${decl.metadata.model}`)
  lines.push('---')
  return lines.join('\n')
}

const compileCommand = (decl: Declaration): string => {
  const parts: string[] = []
  const engineMode = !!(decl.annotations && Object.keys(decl.annotations).length > 0)

  if (engineMode) {
    const header = ['[annotations]']
    for (const [key, value] of Object.entries(decl.annotations!)) {
      header.push(`${key}: ${value}`)
    }
    parts.push(header.join('\n'))
  }

  parts.push(...compileBody(decl.body, { engineMode, scope: decl.importedScope || {} }))
  return parts.join('\n\n')
}

const compileAgent = (decl: Declaration): string => {
  const parts: string[] = [buildFrontmatter(decl)]
  const sections = compileBody(decl.body, {
    engineMode: false,
    scope: decl.importedScope || {},
  })
  parts.push(...sections)
  return parts.join('\n\n')
}

const compile = (decl: Declaration, _opts?: CompileOptions): string => {
  return decl.kind === 'agent' ? compileAgent(decl) : compileCommand(decl)
}

const destination = (decl: Declaration, opts: InstallOptions): InstallPath => {
  const baseDir = opts.local
    ? resolve(process.cwd(), '.claude')
    : resolveGlobalDir()

  const subdir = decl.kind === 'agent' ? 'agents' : 'commands'
  return {
    path: resolve(baseDir, subdir, `${decl.name}.md`),
    scope: opts.local ? 'local' : 'global',
  }
}

const displayName = (decl: Declaration): string => {
  return decl.kind === 'agent' ? `@${decl.name}` : `/${decl.name}`
}

export const claude: Target = {
  name: 'claude',
  compile,
  destination,
  extension: '.md',
  displayName,
}
