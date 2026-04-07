import { SemanticTokensBuilder } from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'

export const tokenTypes = [
  'keyword',
  'function',
  'variable',
  'string',
  'number',
  'operator',
  'type',
  'decorator',
  'parameter',
  'comment',
]

export const tokenModifiers = [
  'declaration',
  'definition',
  'readonly',
]

const TOKEN = {
  keyword: 0,
  function: 1,
  variable: 2,
  string: 3,
  number: 4,
  operator: 5,
  type: 6,
  decorator: 7,
  parameter: 8,
  comment: 9,
} as const

const MOD = {
  declaration: 1,
  definition: 2,
  readonly: 4,
} as const

const KEYWORDS = new Set([
  'command', 'if', 'else', 'while', 'for', 'in',
  'task', 'parallel', 'break', 'import', 'true', 'false',
])

const BUILTINS = new Set([
  'ask', 'confirm', 'wait_for_response', 'create_file',
])

const AGENT_TYPES = new Set(['bash', 'explore', 'plan', 'general'])

export const provideSemanticTokens = (doc: TextDocument, builder: SemanticTokensBuilder): void => {
  const text = doc.getText()
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    const indent = line.length - line.trimStart().length

    // Annotations
    if (trimmed.startsWith('@')) {
      const match = trimmed.match(/^(@\w+)\s+(.+)$/)
      if (match) {
        const keyStart = line.indexOf('@')
        builder.push(i, keyStart, match[1].length, TOKEN.decorator, 0)
        const valStart = line.indexOf(match[2], keyStart + match[1].length)
        builder.push(i, valStart, match[2].length, TOKEN.string, 0)
      }
      continue
    }

    // Import statement
    if (trimmed.startsWith('import ')) {
      builder.push(i, indent, 6, TOKEN.keyword, 0)
      highlightStrings(line, i, builder)
      continue
    }

    // Command declaration
    const commandMatch = trimmed.match(/^command\s+(\w+)\s*\{$/)
    if (commandMatch) {
      builder.push(i, indent, 7, TOKEN.keyword, 0)
      const nameStart = line.indexOf(commandMatch[1])
      builder.push(i, nameStart, commandMatch[1].length, TOKEN.function, MOD.declaration)
      continue
    }

    // Task declaration
    const taskMatch = trimmed.match(/^task\s+(?:(bash|explore|plan|general)\s+)?["'](.+?)["']\s*\{$/)
    if (taskMatch) {
      builder.push(i, indent, 4, TOKEN.keyword, 0)
      if (taskMatch[1]) {
        const agentStart = line.indexOf(taskMatch[1])
        builder.push(i, agentStart, taskMatch[1].length, TOKEN.type, 0)
      }
      highlightStrings(line, i, builder)
      continue
    }

    // Task file reference
    const taskFileMatch = trimmed.match(/^task\(/)
    if (taskFileMatch) {
      builder.push(i, indent, 4, TOKEN.keyword, 0)
      highlightStrings(line, i, builder)
      continue
    }

    // Parallel
    if (trimmed === 'parallel {') {
      builder.push(i, indent, 8, TOKEN.keyword, 0)
      continue
    }

    // Control flow: if/while/for
    const ifMatch = trimmed.match(/^if\s+\(/)
    if (ifMatch) {
      builder.push(i, indent, 2, TOKEN.keyword, 0)
      highlightConditionVars(line, i, indent + 4, builder)
      continue
    }

    if (trimmed.startsWith('} else {') || trimmed === 'else {') {
      const elseStart = line.indexOf('else')
      builder.push(i, elseStart, 4, TOKEN.keyword, 0)
      continue
    }

    const whileMatch = trimmed.match(/^while\s+\(/)
    if (whileMatch) {
      builder.push(i, indent, 5, TOKEN.keyword, 0)
      highlightConditionVars(line, i, indent + 7, builder)
      continue
    }

    const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+(\w+)\s*\{$/)
    if (forMatch) {
      builder.push(i, indent, 3, TOKEN.keyword, 0)
      const varStart = line.indexOf(forMatch[1], indent + 3)
      builder.push(i, varStart, forMatch[1].length, TOKEN.variable, MOD.declaration)
      const inStart = line.indexOf(' in ', varStart) + 1
      builder.push(i, inStart, 2, TOKEN.keyword, 0)
      const iterStart = line.indexOf(forMatch[2], inStart + 2)
      builder.push(i, iterStart, forMatch[2].length, TOKEN.variable, 0)
      continue
    }

    // Break
    if (trimmed === 'break') {
      builder.push(i, indent, 5, TOKEN.keyword, 0)
      continue
    }

    // Built-in function calls
    for (const fn of BUILTINS) {
      if (trimmed.startsWith(fn + '(')) {
        builder.push(i, indent, fn.length, TOKEN.function, 0)
        highlightStrings(line, i, builder)
        // Highlight variable args (non-string args)
        const argsMatch = trimmed.match(new RegExp(`^${fn}\\((\\w+)\\)$`))
        if (argsMatch && !argsMatch[1].startsWith('"') && !argsMatch[1].startsWith("'")) {
          const argStart = line.indexOf(argsMatch[1], indent + fn.length)
          builder.push(i, argStart, argsMatch[1].length, TOKEN.variable, 0)
        }
        break
      }
    }

    // Variable assignment
    const assignMatch = trimmed.match(/^(\w+)\s*=\s*/)
    if (assignMatch) {
      builder.push(i, indent, assignMatch[1].length, TOKEN.variable, MOD.definition)
      const eqStart = line.indexOf('=', indent + assignMatch[1].length)
      builder.push(i, eqStart, 1, TOKEN.operator, 0)
      highlightStrings(line, i, builder)
      // Highlight boolean values
      const valPart = trimmed.slice(assignMatch[0].length).trim()
      if (valPart === 'true' || valPart === 'false') {
        const boolStart = line.indexOf(valPart, eqStart + 1)
        builder.push(i, boolStart, valPart.length, TOKEN.keyword, 0)
      }
      continue
    }
  }
}

const highlightStrings = (line: string, lineNum: number, builder: SemanticTokensBuilder): void => {
  const regex = /["']([^"']*?)["']/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(line)) !== null) {
    builder.push(lineNum, match.index, match[0].length, TOKEN.string, 0)
  }
}

const highlightConditionVars = (line: string, lineNum: number, startCol: number, builder: SemanticTokensBuilder): void => {
  const parenContent = line.slice(startCol)
  const endParen = parenContent.indexOf(')')
  if (endParen < 0) return

  const cond = parenContent.slice(0, endParen)
  const operators = ['==', '!=', '&&', '||', '!']

  for (const op of operators) {
    let idx = cond.indexOf(op)
    while (idx >= 0) {
      builder.push(lineNum, startCol + idx, op.length, TOKEN.operator, 0)
      idx = cond.indexOf(op, idx + op.length)
    }
  }

  const identifiers = cond.matchAll(/[a-zA-Z_]\w*/g)
  for (const id of identifiers) {
    if (id[0] === 'true' || id[0] === 'false') {
      builder.push(lineNum, startCol + id.index!, id[0].length, TOKEN.keyword, 0)
    } else {
      builder.push(lineNum, startCol + id.index!, id[0].length, TOKEN.variable, 0)
    }
  }
}
