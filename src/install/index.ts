import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { resolve, basename, dirname } from 'path'
import { parseCommand } from '../parser/index.js'
import { resolveTaskFiles } from '../resolve/index.js'
import { getTarget, DEFAULT_TARGET, extractTarget } from '../targets/index.js'

export const isBundle = (filePath: string): boolean => {
  const fileName = basename(filePath, '.stim')
  const dirName = basename(dirname(filePath))
  return fileName === dirName || fileName === 'index'
}

export const handleInstall = (args: string[]) => {
  const { target: targetName, rest } = extractTarget(args)
  const local = rest.includes('--local')
  const files = rest.filter(a => !a.startsWith('--'))

  if (files.length === 0) {
    console.error('Error: No input file specified')
    console.error('Usage: stim install <file.stim> [--target <name>] [--local]')
    process.exit(1)
  }

  const target = getTarget(targetName)

  for (const file of files) {
    installFile(resolve(file), local, target)
  }
}

const installFile = (inputFile: string, local: boolean, target: ReturnType<typeof getTarget>) => {
  if (!existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`)
    process.exit(1)
  }

  if (!inputFile.endsWith('.stim')) {
    console.error('Error: Input file must have .stim extension')
    process.exit(1)
  }

  if (isBundle(inputFile) && target.name === DEFAULT_TARGET) {
    installBundle(inputFile, local, target)
    return
  }

  try {
    const source = readFileSync(inputFile, 'utf-8')
    const parsed = parseCommand(source)
    const decl = resolveTaskFiles(parsed, dirname(inputFile))
    const output = target.compile(decl)
    const dest = target.destination(decl, { local })

    mkdirSync(dirname(dest.path), { recursive: true })
    writeFileSync(dest.path, output, 'utf-8')

    const label = target.displayName ? target.displayName(decl) : decl.name
    console.log(`✓ Installed ${label} → ${dest.path} (${target.name}, ${dest.scope})`)
  } catch (error) {
    console.error('Install error:', (error as Error).message)
    process.exit(1)
  }
}

const installBundle = (entryFile: string, local: boolean, target: ReturnType<typeof getTarget>) => {
  const bundleDir = dirname(entryFile)
  const entrySource = readFileSync(entryFile, 'utf-8')
  const entryParsed = parseCommand(entrySource)
  const entryDecl = resolveTaskFiles(entryParsed, bundleDir)
  const entryOutput = target.compile(entryDecl)
  const entryDest = target.destination(entryDecl, { local })

  mkdirSync(dirname(entryDest.path), { recursive: true })
  writeFileSync(entryDest.path, entryOutput, 'utf-8')

  const label = target.displayName ? target.displayName(entryDecl) : entryDecl.name
  console.log(`✓ Installed ${label} → ${entryDest.path} (${target.name}, ${entryDest.scope})`)

  const subDir = resolve(dirname(entryDest.path), basename(bundleDir))
  mkdirSync(subDir, { recursive: true })

  const siblings = readdirSync(bundleDir)
    .filter(f => f.endsWith('.stim') && f !== basename(entryFile))

  for (const sibling of siblings) {
    try {
      const siblingPath = resolve(bundleDir, sibling)
      const source = readFileSync(siblingPath, 'utf-8')
      const parsed = parseCommand(source)
      const decl = resolveTaskFiles(parsed, bundleDir)
      const output = target.compile(decl)

      const siblingOutput = resolve(subDir, `${decl.name}${target.extension}`)
      writeFileSync(siblingOutput, output, 'utf-8')

      console.log(`  ✓ Module ${decl.name} → ${siblingOutput}`)
    } catch (error) {
      console.error(`  Error installing ${sibling}:`, (error as Error).message)
    }
  }
}
