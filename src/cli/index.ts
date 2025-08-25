import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, basename, dirname, join } from 'path'
import { parseCommand } from '../parser/index.js'
import { compileCommand } from '../compiler/index.js'

// Get version from package.json
const getVersion = () => {
  try {
    const packagePath = join(dirname(import.meta.url.replace('file://', '')), '../../package.json')
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'))
    return packageJson.version || '1.0.0'
  } catch {
    return '1.0.0'
  }
}

export const main = () => {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage: stim <command> [options]')
    console.log('')
    console.log('Commands:')
    console.log('  compile <file.stim>  Compile .stim file to Claude command')
    console.log('  version              Show version information')
    console.log('  help                 Show this help')
    return
  }
  
  const command = args[0]
  
  switch (command) {
    case 'compile':
      handleCompile(args.slice(1))
      break
    case 'version':
    case '-v':
    case '--version':
      console.log(`Stim v${getVersion()}`)
      console.log('DSL for Claude Code commands')
      console.log('https://github.com/user/stim')
      break
    case 'help':
    case '-h':
    case '--help':
      console.log(`Stim v${getVersion()} - DSL for Claude Code commands`)
      console.log('')
      console.log('Usage: stim compile <file.stim>')
      console.log('')
      console.log('Commands:')
      console.log('  compile <file.stim>  Compile .stim file to Claude command')
      console.log('  version              Show version information')
      console.log('  help                 Show this help')
      console.log('')
      console.log('Example:')
      console.log('  stim compile brainstorm.stim')
      console.log('  # Generates ~/.claude/commands/brainstorm.md')
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
    const command = parseCommand(source)
    const markdown = compileCommand(command)
    
    // Output to ~/.claude/commands/{name}.md
    const homeDir = process.env.HOME || process.env.USERPROFILE
    if (!homeDir) {
      console.error('Error: Could not determine home directory')
      process.exit(1)
    }
    
    const claudeCommandsDir = resolve(homeDir, '.claude', 'commands')
    const outputFile = resolve(claudeCommandsDir, `${command.name}.md`)
    
    writeFileSync(outputFile, markdown, 'utf-8')
    
    console.log(`✓ Compiled ${basename(inputFile)} → ${outputFile}`)
    console.log(`Command: /${command.name}`)
    
  } catch (error) {
    console.error('Compilation error:', (error as Error).message)
    process.exit(1)
  }
}