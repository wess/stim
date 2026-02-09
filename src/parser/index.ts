import type { Command, Statement } from '../types/index.js'

export const parseCommand = (source: string): Command => {
  const lines = source.split('\n').map(line => line.trim()).filter(Boolean)
  
  if (lines.length === 0) {
    throw new Error('Empty command file')
  }
  
  const firstLine = lines[0]
  const commandMatch = firstLine.match(/^command\s+(\w+)\s*\{$/)
  
  if (!commandMatch) {
    throw new Error('Expected command declaration: command <name> {')
  }
  
  const name = commandMatch[1]
  const body = parseBody(lines.slice(1, -1)) // Remove first line and closing brace
  
  return { name, body }
}

const parseBody = (lines: string[]): Statement[] => {
  const statements: Statement[] = []
  let i = 0
  
  while (i < lines.length) {
    const line = lines[i]
    
    if (line === '}') {
      i++
      continue
    }
    
    if (line.startsWith('ask(')) {
      statements.push(parseAsk(line))
    } else if (line.startsWith('confirm(')) {
      statements.push(parseConfirm(line))
    } else if (line.startsWith('create_file(')) {
      statements.push(parseCreateFile(line))
    } else if (line.startsWith('if (')) {
      const { statement, endIndex } = parseIf(lines, i)
      statements.push(statement)
      i = endIndex
      continue
    } else if (line.startsWith('while (')) {
      const { statement, endIndex } = parseWhile(lines, i)
      statements.push(statement)
      i = endIndex
      continue
    } else if (line.startsWith('for ')) {
      const { statement, endIndex } = parseFor(lines, i)
      statements.push(statement)
      i = endIndex
      continue
    } else if ((line.startsWith('task ') || line.startsWith('task(')) && !line.includes(' = ')) {
      if (line.startsWith('task(')) {
        statements.push(parseTaskFile(line))
      } else if (line.endsWith('{')) {
        const { statement, endIndex } = parseTask(lines, i)
        statements.push(statement)
        i = endIndex
        continue
      } else {
        throw new Error(`Invalid task statement: ${line}`)
      }
    } else if (line === 'parallel {') {
      const { statement, endIndex } = parseParallel(lines, i)
      statements.push(statement)
      i = endIndex
      continue
    } else if (line === 'break') {
      statements.push({ type: 'break' })
    } else if (line === 'wait_for_response()') {
      statements.push({ type: 'wait_for_response' })
    } else if (line.includes(' = ')) {
      statements.push(parseAssignment(line))
    } else {
      // Function call
      statements.push(parseFunctionCall(line))
    }
    
    i++
  }
  
  return statements
}

const parseAsk = (line: string): Statement => {
  const match = line.match(/^ask\((.+)\)$/)
  if (!match) throw new Error(`Invalid ask statement: ${line}`)
  
  let question = match[1].trim()
  
  // Handle string literals
  if (question.startsWith('"') && question.endsWith('"')) {
    question = question.slice(1, -1)
  } else if (question.startsWith("'") && question.endsWith("'")) {
    question = question.slice(1, -1)
  }
  // Otherwise it's a variable reference
  
  return { type: 'ask', question }
}

const parseConfirm = (line: string): Statement => {
  const match = line.match(/^confirm\((.+)\)$/)
  if (!match) throw new Error(`Invalid confirm statement: ${line}`)
  
  let message = match[1].trim()
  
  // Handle string literals
  if (message.startsWith('"') && message.endsWith('"')) {
    message = message.slice(1, -1)
  } else if (message.startsWith("'") && message.endsWith("'")) {
    message = message.slice(1, -1)
  }
  
  return { type: 'confirm', message }
}

const parseCreateFile = (line: string): Statement => {
  const match = line.match(/^create_file\(["'](.*)["'],\s*(.+)\)$/)
  if (!match) throw new Error(`Invalid create_file statement: ${line}`)
  return { type: 'create_file', filename: match[1], content: match[2] }
}

const parseAssignment = (line: string): Statement => {
  const match = line.match(/^(\w+)\s*=\s*(.+)$/)
  if (!match) throw new Error(`Invalid assignment: ${line}`)
  
  let value = match[2].trim()
  
  // Handle array literals
  if (value.startsWith('[') && value.endsWith(']')) {
    const arrayContent = value.slice(1, -1)
    const items = arrayContent.split(',').map(item => item.trim().replace(/^["']|["']$/g, ''))
    value = items
  }
  // Handle string literals
  else if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1)
  }
  // Handle boolean literals
  else if (value === 'true' || value === 'false') {
    value = value === 'true'
  }
  
  return { type: 'variable_assignment', name: match[1], value }
}

const parseFunctionCall = (line: string): Statement => {
  const match = line.match(/^(\w+)\((.*)?\)$/)
  if (!match) throw new Error(`Invalid function call: ${line}`)
  const args = match[2] ? match[2].split(',').map(arg => arg.trim()) : []
  return { type: 'function_call', name: match[1], args }
}

const parseIf = (lines: string[], startIndex: number) => {
  const line = lines[startIndex]
  const match = line.match(/^if \((.+)\) \{$/)
  if (!match) throw new Error(`Invalid if statement: ${line}`)
  
  const condition = match[1]
  const { body, endIndex } = parseBlock(lines, startIndex + 1)
  
  return {
    statement: { type: 'if', condition, body },
    endIndex
  }
}

const parseWhile = (lines: string[], startIndex: number) => {
  const line = lines[startIndex]
  const match = line.match(/^while \((.+)\) \{$/)
  if (!match) throw new Error(`Invalid while statement: ${line}`)
  
  const condition = match[1]
  const { body, endIndex } = parseBlock(lines, startIndex + 1)
  
  return {
    statement: { type: 'while', condition, body },
    endIndex
  }
}

const parseFor = (lines: string[], startIndex: number) => {
  const line = lines[startIndex]
  const match = line.match(/^for (\w+) in (.+) \{$/)
  if (!match) throw new Error(`Invalid for statement: ${line}`)
  
  const variable = match[1]
  const iterable = match[2]
  const { body, endIndex } = parseBlock(lines, startIndex + 1)
  
  return {
    statement: { type: 'for', variable, iterable, body },
    endIndex
  }
}

const parseTask = (lines: string[], startIndex: number) => {
  const line = lines[startIndex]
  const match = line.match(/^task\s+(?:(bash|explore|plan|general)\s+)?["'](.+?)["']\s*\{$/)
  if (!match) throw new Error(`Invalid task statement: ${line}`)

  const agent = (match[1] || 'general') as import('../types/index.js').AgentType
  const description = match[2]
  const { body, endIndex } = parseBlock(lines, startIndex + 1)

  return {
    statement: { type: 'task' as const, description, agent, body },
    endIndex
  }
}

const parseTaskFile = (line: string): Statement => {
  const match = line.match(/^task\(["'](.+?)["'](?:,\s*(bash|explore|plan|general))?\)$/)
  if (!match) throw new Error(`Invalid task file reference: ${line}`)

  return {
    type: 'task',
    description: '',
    agent: (match[2] || 'general') as import('../types/index.js').AgentType,
    body: [],
    file: match[1]
  }
}

const parseParallel = (lines: string[], startIndex: number) => {
  const { body, endIndex } = parseBlock(lines, startIndex + 1)

  const nonTaskStatements = body.filter(s => s.type !== 'task')
  if (nonTaskStatements.length > 0) {
    throw new Error('parallel block may only contain task statements')
  }

  return {
    statement: { type: 'parallel' as const, tasks: body },
    endIndex
  }
}

const parseBlock = (lines: string[], startIndex: number) => {
  let braceCount = 1
  let i = startIndex
  const blockLines: string[] = []
  
  while (i < lines.length && braceCount > 0) {
    const line = lines[i]
    if (line.endsWith('{')) braceCount++
    if (line === '}') braceCount--
    
    if (braceCount > 0) {
      blockLines.push(line)
    }
    i++
  }
  
  return {
    body: parseBody(blockLines),
    endIndex: i
  }
}