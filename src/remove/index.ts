import { unlinkSync, existsSync } from 'fs'
import { resolve } from 'path'
import { readLock, writeLock } from '../lockfile/index.js'
import { parseSource } from '../registry/index.js'

const resolveGlobalDir = () => {
  const homeDir = process.env.HOME || process.env.USERPROFILE
  if (!homeDir) {
    console.error('Error: Could not determine home directory')
    process.exit(1)
  }
  return resolve(homeDir!, '.claude')
}

export const handleRemove = (args: string[]) => {
  const local = args.includes('--local')
  const sources = args.filter(a => !a.startsWith('--'))

  if (sources.length === 0) {
    console.error('Error: No package source specified')
    console.error('Usage: stim remove <github/user/repo> [--local]')
    process.exit(1)
  }

  for (const source of sources) {
    removePackage(source, local)
  }
}

const removePackage = (source: string, local: boolean) => {
  try {
    const { owner, repo } = parseSource(source)
    const key = `github/${owner}/${repo}`

    const baseDir = local
      ? resolve(process.cwd(), '.claude')
      : resolveGlobalDir()

    const lock = readLock(baseDir)

    if (!lock.packages[key]) {
      console.error(`Error: Package ${key} is not installed`)
      process.exit(1)
    }

    const entry = lock.packages[key]
    const commandsDir = resolve(baseDir, 'commands')

    for (const name of entry.commands) {
      const filePath = resolve(commandsDir, `${name}.md`)
      if (existsSync(filePath)) {
        unlinkSync(filePath)
      }
    }

    delete lock.packages[key]
    writeLock(baseDir, lock)

    console.log(`✓ Removed ${key} (${entry.commands.length} commands)`)
  } catch (error) {
    console.error('Remove error:', (error as Error).message)
    process.exit(1)
  }
}
