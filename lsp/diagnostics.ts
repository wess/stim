import { Diagnostic, DiagnosticSeverity, type Connection } from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { parseCommand } from '../src/parser/index'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const VALID_ANNOTATIONS: Record<string, string[]> = {
  topology: ['pipeline', 'fanout', 'supervisor'],
  memory: ['shared', 'none'],
  on_error: ['escalate'],
}

const BUILTIN_FUNCTIONS = ['ask', 'confirm', 'create_file', 'wait_for_response']

const findLineNumber = (text: string, pattern: string): number => {
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().includes(pattern)) return i
  }
  return 0
}

const lineRange = (doc: TextDocument, lineNum: number) => ({
  start: { line: lineNum, character: 0 },
  end: { line: lineNum, character: doc.getText().split('\n')[lineNum]?.length ?? 0 },
})

const collectVariables = (text: string): Set<string> => {
  const vars = new Set<string>()
  const lines = text.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()

    const assignMatch = trimmed.match(/^(\w+)\s*=\s*/)
    if (assignMatch) vars.add(assignMatch[1])

    const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+/)
    if (forMatch) vars.add(forMatch[1])
  }

  return vars
}

const collectVariableReferences = (text: string): { name: string; line: number }[] => {
  const refs: { name: string; line: number }[] = []
  const lines = text.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()

    // Variable in ask()
    const askMatch = trimmed.match(/^ask\((\w+)\)$/)
    if (askMatch) {
      refs.push({ name: askMatch[1], line: i })
      continue
    }

    // Variable in confirm()
    const confirmMatch = trimmed.match(/^confirm\((\w+)\)$/)
    if (confirmMatch) {
      refs.push({ name: confirmMatch[1], line: i })
      continue
    }

    // Variable in for..in
    const forMatch = trimmed.match(/^for\s+\w+\s+in\s+(\w+)\s*\{$/)
    if (forMatch) {
      refs.push({ name: forMatch[1], line: i })
      continue
    }

    // Variable in condition
    const condMatch = trimmed.match(/^(?:if|while)\s+\((.+)\)\s*\{$/)
    if (condMatch) {
      const cond = condMatch[1]
      const identifiers = cond.match(/[a-zA-Z_]\w*/g) || []
      for (const id of identifiers) {
        if (!['true', 'false'].includes(id)) {
          refs.push({ name: id, line: i })
        }
      }
    }

    // Right side of assignment referencing variables
    const assignMatch = trimmed.match(/^\w+\s*=\s*(\w+)$/)
    if (assignMatch && !['true', 'false'].includes(assignMatch[1]) && !assignMatch[1].startsWith('"') && !assignMatch[1].startsWith("'")) {
      if (!/^\[/.test(trimmed.split('=')[1].trim()) && !/^"/.test(trimmed.split('=')[1].trim()) && !/^'/.test(trimmed.split('=')[1].trim())) {
        refs.push({ name: assignMatch[1], line: i })
      }
    }
  }

  return refs
}

export const validateDocument = (connection: Connection, doc: TextDocument): void => {
  const text = doc.getText()
  const diagnostics: Diagnostic[] = []
  const filePath = fileURLToPath(doc.uri)
  const baseDir = dirname(filePath)

  // Parse errors
  try {
    parseCommand(text)
  } catch (err) {
    const message = (err as Error).message
    let lineNum = 0

    // Try to extract context from error message
    const invalidMatch = message.match(/Invalid .+ statement: (.+)/)
    if (invalidMatch) {
      lineNum = findLineNumber(text, invalidMatch[1])
    }

    diagnostics.push({
      severity: DiagnosticSeverity.Error,
      range: lineRange(doc, lineNum),
      message,
      source: 'stim',
    })
  }

  const lines = text.split('\n')

  // Check annotations
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const annoMatch = trimmed.match(/^@(\w+)\s+(.+)$/)
    if (!annoMatch) continue

    const [, key, value] = annoMatch
    if (!VALID_ANNOTATIONS[key]) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: lineRange(doc, i),
        message: `Unknown annotation @${key}. Valid: ${Object.keys(VALID_ANNOTATIONS).join(', ')}`,
        source: 'stim',
      })
    } else if (!VALID_ANNOTATIONS[key].includes(value.trim())) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: lineRange(doc, i),
        message: `Invalid value "${value.trim()}" for @${key}. Valid: ${VALID_ANNOTATIONS[key].join(', ')}`,
        source: 'stim',
      })
    }
  }

  // Check import file existence
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const importMatch = trimmed.match(/^import\s+["'](.+?)["']$/)
    if (!importMatch) continue

    const importPath = resolve(baseDir, importMatch[1])
    if (!existsSync(importPath)) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: lineRange(doc, i),
        message: `Import file not found: ${importMatch[1]}`,
        source: 'stim',
      })
    }
  }

  // Check task file references
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const taskFileMatch = trimmed.match(/^task\(["'](.+?)["']/)
    if (!taskFileMatch) continue

    const taskPath = resolve(baseDir, taskFileMatch[1])
    if (!existsSync(taskPath)) {
      diagnostics.push({
        severity: DiagnosticSeverity.Error,
        range: lineRange(doc, i),
        message: `Task file not found: ${taskFileMatch[1]}`,
        source: 'stim',
      })
    }
  }

  // Check unknown variables
  const declared = collectVariables(text)
  const refs = collectVariableReferences(text)

  for (const ref of refs) {
    if (!declared.has(ref.name)) {
      diagnostics.push({
        severity: DiagnosticSeverity.Warning,
        range: lineRange(doc, ref.line),
        message: `Possibly undefined variable: ${ref.name}`,
        source: 'stim',
      })
    }
  }

  // Check parallel block violations
  let inParallel = false
  let parallelBraces = 0

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()

    if (trimmed === 'parallel {') {
      inParallel = true
      parallelBraces = 1
      continue
    }

    if (inParallel) {
      if (trimmed.endsWith('{')) parallelBraces++
      if (trimmed === '}') parallelBraces--

      if (parallelBraces === 0) {
        inParallel = false
        continue
      }

      if (parallelBraces === 1 && trimmed !== '}' && !trimmed.startsWith('task')) {
        diagnostics.push({
          severity: DiagnosticSeverity.Error,
          range: lineRange(doc, i),
          message: 'parallel blocks may only contain task statements',
          source: 'stim',
        })
      }
    }
  }

  connection.sendDiagnostics({ uri: doc.uri, diagnostics })
}
