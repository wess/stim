import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { parseCommand } from '../parser/index.js'
import { readLock, writeLock } from '../lockfile/index.js'
import { parseSource, sourceKey, resolveTag, fetchManifest, fetchStimFile } from '../registry/index.js'
import { getTarget, extractTarget } from '../targets/index.js'

const lockDirFor = (targetName: string, local: boolean): string => {
  if (targetName === 'claude') {
    const home = process.env.HOME || process.env.USERPROFILE
    if (!home) throw new Error('Could not determine home directory')
    return local ? resolve(process.cwd(), '.claude') : resolve(home, '.claude')
  }
  return resolve(process.cwd(), `.${targetName}`)
}

export const handleUpdate = async (args: string[]) => {
  const { target: targetName, rest } = extractTarget(args)
  const local = rest.includes('--local')
  const sources = rest.filter(a => !a.startsWith('--'))

  const target = getTarget(targetName)
  const baseDir = lockDirFor(target.name, local)
  const lock = readLock(baseDir)

  if (Object.keys(lock.packages).length === 0) {
    console.log('No packages installed')
    return
  }

  const keys = sources.length > 0
    ? sources.map(s => sourceKey(parseSource(s)))
    : Object.keys(lock.packages)

  let updated = 0

  for (const key of keys) {
    if (!lock.packages[key]) {
      console.error(`Error: Package ${key} is not installed`)
      process.exit(1)
    }

    const parsed = parseSource(key)

    try {
      const latestTag = await resolveTag(parsed.owner, parsed.repo, null)
      const currentVersion = lock.packages[key].version

      if (latestTag === currentVersion) {
        continue
      }

      const manifest = await fetchManifest(parsed.owner, parsed.repo, latestTag, parsed.subpath)
      const installedNames: string[] = []

      for (const file of manifest.commands) {
        const stimSource = await fetchStimFile(parsed.owner, parsed.repo, latestTag, file, parsed.subpath)
        const decl = parseCommand(stimSource)
        const output = target.compile(decl)
        const dest = target.destination(decl, { local })

        mkdirSync(dirname(dest.path), { recursive: true })
        writeFileSync(dest.path, output, 'utf-8')
        installedNames.push(decl.name)
      }

      lock.packages[key] = { version: latestTag, commands: installedNames }
      console.log(`✓ Updated ${key} ${currentVersion} → ${latestTag} (${target.name})`)
      updated++
    } catch (error) {
      console.error(`Error updating ${key}:`, (error as Error).message)
      process.exit(1)
    }
  }

  writeLock(baseDir, lock)

  if (updated === 0) {
    console.log('✓ All packages up to date')
  }
}
