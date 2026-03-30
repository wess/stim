import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs'
import { resolve, basename, dirname } from 'path'
import { parseCommand } from '../parser/index.js'
import { compileCommand } from '../compiler/index.js'
import { resolveTaskFiles } from '../resolve/index.js'

export const isBundle = (filePath: string): boolean => {
  const fileName = basename(filePath, '.stim')
  const dirName = basename(dirname(filePath))
  return fileName === dirName || fileName === 'index'
}

export const handleInstall = (args: string[]) => {
  const local = args.includes('--local')
  const files = args.filter(a => !a.startsWith('--'))

  if (files.length === 0) {
    console.error('Error: No input file specified')
    console.error('Usage: stim install <file.stim> [--local]')
    process.exit(1)
  }

  for (const file of files) {
    installFile(resolve(file), local)
  }
}

const installFile = (inputFile: string, local: boolean) => {
  if (!existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`)
    process.exit(1)
  }

  if (!inputFile.endsWith('.stim')) {
    console.error('Error: Input file must have .stim extension')
    process.exit(1)
  }

  if (isBundle(inputFile)) {
    installBundle(inputFile, local)
    return
  }

  try {
    const source = readFileSync(inputFile, 'utf-8')
    const parsed = parseCommand(source)
    const command = resolveTaskFiles(parsed, dirname(inputFile))
    const markdown = compileCommand(command)

    const targetDir = local
      ? resolve(process.cwd(), '.claude', 'commands')
      : resolveGlobalDir()

    mkdirSync(targetDir, { recursive: true })

    const outputFile = resolve(targetDir, `${command.name}.md`)
    writeFileSync(outputFile, markdown, 'utf-8')

    const scope = local ? 'local' : 'global'
    console.log(`✓ Installed /${command.name} → ${outputFile} (${scope})`)
  } catch (error) {
    console.error('Install error:', (error as Error).message)
    process.exit(1)
  }
}

const installBundle = (entryFile: string, local: boolean) => {
  const bundleDir = dirname(entryFile)
  const entrySource = readFileSync(entryFile, 'utf-8')
  const entryParsed = parseCommand(entrySource)
  const entryCommand = resolveTaskFiles(entryParsed, bundleDir)
  const entryMarkdown = compileCommand(entryCommand)
  const bundleName = entryCommand.name

  const targetDir = local
    ? resolve(process.cwd(), '.claude', 'commands')
    : resolveGlobalDir()

  const subDir = resolve(targetDir, basename(bundleDir))
  mkdirSync(targetDir, { recursive: true })
  mkdirSync(subDir, { recursive: true })

  const outputFile = resolve(targetDir, `${bundleName}.md`)
  writeFileSync(outputFile, entryMarkdown, 'utf-8')

  const scope = local ? 'local' : 'global'
  console.log(`\u2713 Installed /${bundleName} \u2192 ${outputFile} (${scope})`)

  const siblings = readdirSync(bundleDir)
    .filter(f => f.endsWith('.stim') && f !== basename(entryFile))

  for (const sibling of siblings) {
    try {
      const siblingPath = resolve(bundleDir, sibling)
      const source = readFileSync(siblingPath, 'utf-8')
      const parsed = parseCommand(source)
      const command = resolveTaskFiles(parsed, bundleDir)
      const markdown = compileCommand(command)

      const siblingOutput = resolve(subDir, `${command.name}.md`)
      writeFileSync(siblingOutput, markdown, 'utf-8')

      console.log(`  \u2713 Module ${command.name} \u2192 ${siblingOutput}`)
    } catch (error) {
      console.error(`  Error installing ${sibling}:`, (error as Error).message)
    }
  }
}

const resolveGlobalDir = () => {
  const homeDir = process.env.HOME || process.env.USERPROFILE
  if (!homeDir) {
    console.error('Error: Could not determine home directory')
    process.exit(1)
  }
  return resolve(homeDir!, '.claude', 'commands')
}
