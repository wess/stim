import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { parseCommand } from '../parser/index.js'
import { compileCommand } from '../compiler/index.js'
import { readLock, writeLock } from '../lockfile/index.js'
import { parseSource, resolveTag, fetchManifest, fetchStimFile } from '../registry/index.js'

const resolveGlobalDir = () => {
  const homeDir = process.env.HOME || process.env.USERPROFILE
  if (!homeDir) {
    console.error('Error: Could not determine home directory')
    process.exit(1)
  }
  return resolve(homeDir!, '.claude')
}

export const handleAdd = async (args: string[]) => {
  const local = args.includes('--local')
  const sources = args.filter(a => !a.startsWith('--'))

  if (sources.length === 0) {
    console.error('Error: No package source specified')
    console.error('Usage: stim add <github/user/repo[@tag]> [--local]')
    process.exit(1)
  }

  for (const source of sources) {
    await addPackage(source, local)
  }
}

const addPackage = async (source: string, local: boolean) => {
  try {
    const { owner, repo, tag: requestedTag } = parseSource(source)
    const tag = await resolveTag(owner, repo, requestedTag)
    const manifest = await fetchManifest(owner, repo, tag)

    const baseDir = local
      ? resolve(process.cwd(), '.claude')
      : resolveGlobalDir()

    const commandsDir = resolve(baseDir, 'commands')
    mkdirSync(commandsDir, { recursive: true })

    const commandNames: string[] = []

    for (const file of manifest.commands) {
      const stimSource = await fetchStimFile(owner, repo, tag, file)
      const command = parseCommand(stimSource)
      const markdown = compileCommand(command)

      const outputFile = resolve(commandsDir, `${command.name}.md`)
      writeFileSync(outputFile, markdown, 'utf-8')
      commandNames.push(command.name)
    }

    const lock = readLock(baseDir)
    const key = `github/${owner}/${repo}`
    lock.packages[key] = { version: tag, commands: commandNames }
    writeLock(baseDir, lock)

    console.log(`✓ Added ${key}@${tag} (${commandNames.length} commands: ${commandNames.join(', ')})`)
  } catch (error) {
    console.error('Add error:', (error as Error).message)
    process.exit(1)
  }
}
