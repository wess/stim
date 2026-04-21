import { unlinkSync, existsSync } from 'fs'
import { resolve, dirname, basename } from 'path'
import { readLock, writeLock } from '../lockfile/index.js'
import { parseSource, sourceKey } from '../registry/index.js'
import { getTarget, extractTarget } from '../targets/index.js'

const lockDirFor = (targetName: string, local: boolean): string => {
  if (targetName === 'claude') {
    const home = process.env.HOME || process.env.USERPROFILE
    if (!home) throw new Error('Could not determine home directory')
    return local ? resolve(process.cwd(), '.claude') : resolve(home, '.claude')
  }
  return resolve(process.cwd(), `.${targetName}`)
}

export const handleRemove = (args: string[]) => {
  const { target: targetName, rest } = extractTarget(args)
  const local = rest.includes('--local')
  const sources = rest.filter(a => !a.startsWith('--'))

  if (sources.length === 0) {
    console.error('Error: No package source specified')
    console.error('Usage: stim remove <github/user/repo[/subpath]> [--target <name>] [--local]')
    process.exit(1)
  }

  const target = getTarget(targetName)

  for (const source of sources) {
    removePackage(source, local, target)
  }
}

const removePackage = (source: string, local: boolean, target: ReturnType<typeof getTarget>) => {
  try {
    const parsed = parseSource(source)
    const key = sourceKey(parsed)

    const baseDir = lockDirFor(target.name, local)
    const lock = readLock(baseDir)

    if (!lock.packages[key]) {
      console.error(`Error: Package ${key} is not installed`)
      process.exit(1)
    }

    const entry = lock.packages[key]
    let removed = 0

    for (const name of entry.commands) {
      for (const kind of ['command', 'agent'] as const) {
        const decl = { kind, name, body: [] }
        const { path } = target.destination(decl, { local })
        if (existsSync(path)) {
          unlinkSync(path)
          removed++
        }
      }
    }

    delete lock.packages[key]
    writeLock(baseDir, lock)

    console.log(`✓ Removed ${key} (${removed} files, ${target.name})`)
  } catch (error) {
    console.error('Remove error:', (error as Error).message)
    process.exit(1)
  }
}
