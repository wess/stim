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

export const handleUpdate = async (args: string[]) => {
  const local = args.includes('--local')
  const sources = args.filter(a => !a.startsWith('--'))

  const baseDir = local
    ? resolve(process.cwd(), '.claude')
    : resolveGlobalDir()

  const lock = readLock(baseDir)

  if (Object.keys(lock.packages).length === 0) {
    console.log('No packages installed')
    return
  }

  const keys = sources.length > 0
    ? sources.map(s => {
        const { owner, repo } = parseSource(s)
        return `github/${owner}/${repo}`
      })
    : Object.keys(lock.packages)

  let updated = 0

  for (const key of keys) {
    if (!lock.packages[key]) {
      console.error(`Error: Package ${key} is not installed`)
      process.exit(1)
    }

    const match = key.match(/^github\/([^/]+)\/([^/]+)$/)
    if (!match) continue

    const [, owner, repo] = match

    try {
      const latestTag = await resolveTag(owner, repo, null)
      const currentVersion = lock.packages[key].version

      if (latestTag === currentVersion) {
        continue
      }

      const manifest = await fetchManifest(owner, repo, latestTag)
      const commandsDir = resolve(baseDir, 'commands')
      mkdirSync(commandsDir, { recursive: true })

      const commandNames: string[] = []

      for (const file of manifest.commands) {
        const stimSource = await fetchStimFile(owner, repo, latestTag, file)
        const command = parseCommand(stimSource)
        const markdown = compileCommand(command)

        const outputFile = resolve(commandsDir, `${command.name}.md`)
        writeFileSync(outputFile, markdown, 'utf-8')
        commandNames.push(command.name)
      }

      lock.packages[key] = { version: latestTag, commands: commandNames }
      console.log(`✓ Updated ${key} ${currentVersion} → ${latestTag}`)
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
