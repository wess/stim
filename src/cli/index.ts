import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, basename, dirname, join } from 'path'
import { parseCommand } from '../parser/index.js'
import { compileCommand } from '../compiler/index.js'
import { resolveTaskFiles } from '../resolve/index.js'
import { handleInstall } from '../install/index.js'
import { handleAdd } from '../add/index.js'
import { handleRemove } from '../remove/index.js'
import { handleUpdate } from '../update/index.js'

const getVersion = () => {
  try {
    const packagePath = join(dirname(import.meta.url.replace('file://', '')), '../../package.json')
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))
    return packageJson.version || '1.0.0'
  } catch {
    return '1.0.0'
  }
}

const showHelp = (version: string) => {
  console.log(`Stim v${version} - DSL for Claude Code commands`)
  console.log('')
  console.log('Usage: stim <command> [options]')
  console.log('')
  console.log('Commands:')
  console.log('  compile <file.stim>                        Compile .stim file to dist/')
  console.log('  install <file.stim> [--local]              Install command (global by default)')
  console.log('  add <github/user/repo[@tag]> [--local]     Add package from GitHub')
  console.log('  remove <github/user/repo> [--local]        Remove installed package')
  console.log('  update [github/user/repo] [--local]        Update packages to latest')
  console.log('  version                                    Show version information')
  console.log('  help                                       Show this help')
  console.log('')
  console.log('Examples:')
  console.log('  stim compile brainstorm.stim')
  console.log('  stim install brainstorm.stim')
  console.log('  stim install brainstorm.stim --local')
  console.log('  stim add github/wess/brainstorm')
  console.log('  stim add github/wess/brainstorm@v1.0.0 --local')
  console.log('  stim remove github/wess/brainstorm')
  console.log('  stim update')
}

export const main = () => {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    showHelp(getVersion())
    return
  }

  const command = args[0]

  switch (command) {
    case 'compile':
      handleCompile(args.slice(1))
      break
    case 'install':
      handleInstall(args.slice(1))
      break
    case 'add':
      handleAdd(args.slice(1))
      break
    case 'remove':
      handleRemove(args.slice(1))
      break
    case 'update':
      handleUpdate(args.slice(1))
      break
    case 'version':
    case '-v':
    case '--version':
      console.log(`Stim v${getVersion()}`)
      break
    case 'help':
    case '-h':
    case '--help':
      showHelp(getVersion())
      break
    default:
      console.error(`Unknown command: ${command}`)
      process.exit(1)
  }
}

const handleCompile = (args: string[]) => {
  if (args.length === 0) {
    console.error('Error: No input file specified')
    console.error('Usage: stim compile <file.stim>')
    process.exit(1)
  }

  const inputFile = resolve(args[0])

  if (!existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`)
    process.exit(1)
  }

  if (!inputFile.endsWith('.stim')) {
    console.error('Error: Input file must have .stim extension')
    process.exit(1)
  }

  try {
    const source = readFileSync(inputFile, 'utf-8')
    const parsed = parseCommand(source)
    const command = resolveTaskFiles(parsed, dirname(inputFile))
    const markdown = compileCommand(command)

    const distDir = resolve(process.cwd(), 'dist')
    mkdirSync(distDir, { recursive: true })

    const outputFile = resolve(distDir, `${command.name}.md`)
    writeFileSync(outputFile, markdown, 'utf-8')

    console.log(`✓ Compiled ${basename(inputFile)} → ${outputFile}`)
  } catch (error) {
    console.error('Compilation error:', (error as Error).message)
    process.exit(1)
  }
}
