import { writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { parseCommand } from '../parser/index.js'
import { readLock, writeLock } from '../lockfile/index.js'
import { parseSource, sourceKey, resolveTag, fetchManifest, fetchStimFile } from '../registry/index.js'
import { getTarget, extractTarget } from '../targets/index.js'

export const handleAdd = async (args: string[]) => {
  const { target: targetName, rest } = extractTarget(args)
  const local = rest.includes('--local')
  const sources = rest.filter(a => !a.startsWith('--'))

  if (sources.length === 0) {
    console.error('Error: No package source specified')
    console.error('Usage: stim add <github/user/repo[@tag]> [--target <name>] [--local]')
    process.exit(1)
  }

  const target = getTarget(targetName)

  for (const source of sources) {
    await addPackage(source, local, target)
  }
}

const addPackage = async (source: string, local: boolean, target: ReturnType<typeof getTarget>) => {
  try {
    const parsed = parseSource(source)
    const tag = await resolveTag(parsed.owner, parsed.repo, parsed.tag)
    const manifest = await fetchManifest(parsed.owner, parsed.repo, tag, parsed.subpath)

    const installedNames: string[] = []

    for (const file of manifest.commands) {
      const stimSource = await fetchStimFile(parsed.owner, parsed.repo, tag, file, parsed.subpath)
      const decl = parseCommand(stimSource)
      const output = target.compile(decl)
      const dest = target.destination(decl, { local })

      mkdirSync(dirname(dest.path), { recursive: true })
      writeFileSync(dest.path, output, 'utf-8')
      installedNames.push(decl.name)
    }

    const lockDir = lockDirFor(target.name, local)
    const lock = readLock(lockDir)
    const key = sourceKey(parsed)
    lock.packages[key] = { version: tag, commands: installedNames }
    writeLock(lockDir, lock)

    console.log(`✓ Added ${key}@${tag} (${target.name}, ${installedNames.length} files: ${installedNames.join(', ')})`)
  } catch (error) {
    console.error('Add error:', (error as Error).message)
    process.exit(1)
  }
}

const lockDirFor = (targetName: string, local: boolean): string => {
  if (targetName === 'claude') {
    const home = process.env.HOME || process.env.USERPROFILE
    if (!home) {
      throw new Error('Could not determine home directory')
    }
    return local ? `${process.cwd()}/.claude` : `${home}/.claude`
  }
  return `${process.cwd()}/.${targetName}`
}
