import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, basename } from 'path'
import { parseCommand } from '../parser/index.js'
import { compileCommand } from '../compiler/index.js'

export const main = () => {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('Usage: spark <command> [options]')
    console.log('')
    console.log('Commands:')
    console.log('  compile <file.spark>  Compile .spark file to Claude command')
    console.log('  help                  Show this help')
    return
  }
  
  const command = args[0]
  
  switch (command) {
    case 'compile':
      handleCompile(args.slice(1))
      break
    case 'help':
      console.log('Spark - DSL for Claude Code commands')
      console.log('')
      console.log('Usage: spark compile <file.spark>')
      console.log('')
      console.log('Example:')
      console.log('  spark compile brainstorm.spark')
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
    console.error('Usage: spark compile <file.spark>')
    process.exit(1)
  }
  
  const inputFile = resolve(args[0])
  
  if (!existsSync(inputFile)) {
    console.error(`Error: File not found: ${inputFile}`)
    process.exit(1)
  }
  
  if (!inputFile.endsWith('.spark')) {
    console.error('Error: Input file must have .spark extension')
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