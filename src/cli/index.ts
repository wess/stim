import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { resolve, basename, dirname, join } from 'path'
import { parseCommand } from '../parser/index.js'
import { resolveTaskFiles } from '../resolve/index.js'
import { handleInstall } from '../install/index.js'
import { handleAdd } from '../add/index.js'
import { handleRemove } from '../remove/index.js'
import { handleUpdate } from '../update/index.js'
import { getTarget, DEFAULT_TARGET, listTargets, extractTarget } from '../targets/index.js'

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
  console.log(`Stim v${version} - DSL for AI prompts, commands, and agents`)
  console.log('')
  console.log('Usage: stim <command> [options]')
  console.log('')
  console.log('Commands:')
  console.log('  compile <file.stim> [--target <t>]              Compile to dist/<target>/')
  console.log('  install <file.stim> [--target <t>] [--local]    Install for the target')
  console.log('  add <github/user/repo[/sub][@tag]> [--target <t>] [--local]    Add package from GitHub')
  console.log('  remove <github/user/repo[/sub]> [--target <t>] [--local]       Remove installed package')
  console.log('  update [github/user/repo[/sub]] [--target <t>] [--local]       Update packages to latest')
  console.log('  version                                         Show version information')
  console.log('  help                                            Show this help')
  console.log('')
  console.log('Flags:')
  console.log(`  --target <name>                                 ${listTargets().join(' | ')} (default: ${DEFAULT_TARGET})`)
  console.log('  --local                                         Install to project (.claude/, .cursor/, ./prompts/)')
  console.log('  --lsp                                           Start the LSP server (stdio)')
  console.log('')
  console.log('Examples:')
  console.log('  stim compile brainstorm.stim')
  console.log('  stim install brainstorm.stim')
  console.log('  stim install reviewer.stim --target cursor')
  console.log('  stim add github/wess/stim/packages/reviews     # install a first-party package')
  console.log('  stim add github/user/repo@v1.0.0 --local       # pin + project scope')
  console.log('')
  console.log('Packages:')
  console.log('  Browse the registry at https://github.com/wess/stim/blob/main/packages.md')
  console.log('')
  console.log('Engine:')
  console.log('  stim install engine/engine.stim                 Install the Stim engine')
  console.log('  Then use /stim workflow.stim in Claude Code')
}

export const main = () => {
  const args = process.argv.slice(2)

  if (args.includes('--lsp')) {
    import('../../lsp/index').catch((err) => {
      console.error('Failed to start LSP server:', err.message)
      process.exit(1)
    })
    return
  }

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
  const { target: targetName, rest } = extractTarget(args)

  if (rest.length === 0) {
    console.error('Error: No input file specified')
    console.error('Usage: stim compile <file.stim> [--target <name>]')
    process.exit(1)
  }

  const inputFile = resolve(rest[0])

  if (!existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`)
    process.exit(1)
  }

  if (!inputFile.endsWith('.stim')) {
    console.error('Error: Input file must have .stim extension')
    process.exit(1)
  }

  try {
    const target = getTarget(targetName)
    const source = readFileSync(inputFile, 'utf-8')
    const parsed = parseCommand(source)
    const decl = resolveTaskFiles(parsed, dirname(inputFile))
    const output = target.compile(decl)

    const distDir = resolve(process.cwd(), 'dist', target.name)
    mkdirSync(distDir, { recursive: true })

    const outputFile = resolve(distDir, `${decl.name}${target.extension}`)
    writeFileSync(outputFile, output, 'utf-8')

    console.log(`✓ Compiled ${basename(inputFile)} → ${outputFile} (${target.name})`)
  } catch (error) {
    console.error('Compilation error:', (error as Error).message)
    process.exit(1)
  }
}
