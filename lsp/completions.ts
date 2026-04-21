import {
  CompletionItem,
  CompletionItemKind,
  InsertTextFormat,
} from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import type { Position } from 'vscode-languageserver/node'
import { existsSync, readdirSync } from 'fs'
import { dirname, resolve, join } from 'path'
import { fileURLToPath } from 'url'

const KEYWORDS: CompletionItem[] = [
  { label: 'command', kind: CompletionItemKind.Keyword, insertText: 'command ${1:name} {\n\t$0\n}', insertTextFormat: InsertTextFormat.Snippet },
  { label: 'agent', kind: CompletionItemKind.Keyword, insertText: 'agent ${1:name} {\n\tdescription "${2:description}"\n\t$0\n}', insertTextFormat: InsertTextFormat.Snippet, detail: 'Declare an agent' },
  { label: 'if', kind: CompletionItemKind.Keyword, insertText: 'if (${1:condition}) {\n\t$0\n}', insertTextFormat: InsertTextFormat.Snippet },
  { label: 'while', kind: CompletionItemKind.Keyword, insertText: 'while (${1:condition}) {\n\t$0\n}', insertTextFormat: InsertTextFormat.Snippet },
  { label: 'for', kind: CompletionItemKind.Keyword, insertText: 'for ${1:item} in ${2:items} {\n\t$0\n}', insertTextFormat: InsertTextFormat.Snippet },
  { label: 'task', kind: CompletionItemKind.Keyword, insertText: 'task ${1|general,bash,explore,plan|} "${2:description}" {\n\t$0\n}', insertTextFormat: InsertTextFormat.Snippet },
  { label: 'parallel', kind: CompletionItemKind.Keyword, insertText: 'parallel {\n\t$0\n}', insertTextFormat: InsertTextFormat.Snippet },
  { label: 'import', kind: CompletionItemKind.Keyword, insertText: 'import "${1:path}"', insertTextFormat: InsertTextFormat.Snippet },
  { label: 'break', kind: CompletionItemKind.Keyword },
  { label: 'true', kind: CompletionItemKind.Keyword },
  { label: 'false', kind: CompletionItemKind.Keyword },
  { label: 'else', kind: CompletionItemKind.Keyword },
  { label: 'in', kind: CompletionItemKind.Keyword },
]

const FUNCTIONS: CompletionItem[] = [
  { label: 'ask', kind: CompletionItemKind.Function, insertText: 'ask(${1:"question"})', insertTextFormat: InsertTextFormat.Snippet, detail: 'Prompt the user with a question' },
  { label: 'confirm', kind: CompletionItemKind.Function, insertText: 'confirm(${1:"message"})', insertTextFormat: InsertTextFormat.Snippet, detail: 'Yes/no confirmation dialog' },
  { label: 'wait_for_response', kind: CompletionItemKind.Function, insertText: 'wait_for_response()', insertTextFormat: InsertTextFormat.PlainText, detail: 'Wait for user response' },
  { label: 'create_file', kind: CompletionItemKind.Function, insertText: 'create_file("${1:filename}", ${2:content})', insertTextFormat: InsertTextFormat.Snippet, detail: 'Create a file with content' },
]

const ANNOTATION_KEYS: CompletionItem[] = [
  { label: '@topology', kind: CompletionItemKind.Property, insertText: '@topology ${1|pipeline,fanout,supervisor|}', insertTextFormat: InsertTextFormat.Snippet, detail: 'Execution topology' },
  { label: '@memory', kind: CompletionItemKind.Property, insertText: '@memory ${1|shared,none|}', insertTextFormat: InsertTextFormat.Snippet, detail: 'Memory sharing mode' },
  { label: '@on_error', kind: CompletionItemKind.Property, insertText: '@on_error ${1|escalate|}', insertTextFormat: InsertTextFormat.Snippet, detail: 'Error handling strategy' },
]

const ANNOTATION_VALUES: Record<string, CompletionItem[]> = {
  topology: [
    { label: 'pipeline', kind: CompletionItemKind.EnumMember, detail: 'Sequential execution' },
    { label: 'fanout', kind: CompletionItemKind.EnumMember, detail: 'Parallel broadcast' },
    { label: 'supervisor', kind: CompletionItemKind.EnumMember, detail: 'Supervised coordination' },
  ],
  memory: [
    { label: 'shared', kind: CompletionItemKind.EnumMember, detail: 'Share state between tasks' },
    { label: 'none', kind: CompletionItemKind.EnumMember, detail: 'No shared state' },
  ],
  on_error: [
    { label: 'escalate', kind: CompletionItemKind.EnumMember, detail: 'Escalate errors' },
  ],
}

const METADATA_KEYS: CompletionItem[] = [
  { label: 'description', kind: CompletionItemKind.Property, insertText: 'description "${1:description}"', insertTextFormat: InsertTextFormat.Snippet, detail: 'Agent description' },
  { label: 'tools', kind: CompletionItemKind.Property, insertText: 'tools [${1:Read, Grep, Bash}]', insertTextFormat: InsertTextFormat.Snippet, detail: 'Agent tools' },
  { label: 'model', kind: CompletionItemKind.Property, insertText: 'model "${1:sonnet}"', insertTextFormat: InsertTextFormat.Snippet, detail: 'Agent model' },
]

const AGENT_TYPES: CompletionItem[] = [
  { label: 'general', kind: CompletionItemKind.EnumMember, detail: 'General purpose agent' },
  { label: 'bash', kind: CompletionItemKind.EnumMember, detail: 'Shell command agent' },
  { label: 'explore', kind: CompletionItemKind.EnumMember, detail: 'Codebase exploration agent' },
  { label: 'plan', kind: CompletionItemKind.EnumMember, detail: 'Planning agent' },
]

const collectDeclaredVariables = (text: string): CompletionItem[] => {
  const vars: CompletionItem[] = []
  const seen = new Set<string>()

  for (const line of text.split('\n')) {
    const trimmed = line.trim()

    const assignMatch = trimmed.match(/^(\w+)\s*=\s*/)
    if (assignMatch && !seen.has(assignMatch[1])) {
      seen.add(assignMatch[1])
      vars.push({ label: assignMatch[1], kind: CompletionItemKind.Variable })
    }

    const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+/)
    if (forMatch && !seen.has(forMatch[1])) {
      seen.add(forMatch[1])
      vars.push({ label: forMatch[1], kind: CompletionItemKind.Variable })
    }
  }

  return vars
}

const getStimFiles = (baseDir: string): CompletionItem[] => {
  try {
    if (!existsSync(baseDir)) return []
    const entries = readdirSync(baseDir, { withFileTypes: true })
    const items: CompletionItem[] = []

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.stim')) {
        items.push({ label: entry.name, kind: CompletionItemKind.File })
      } else if (entry.isDirectory() && !entry.name.startsWith('.')) {
        items.push({ label: entry.name + '/', kind: CompletionItemKind.Folder })
      }
    }

    return items
  } catch {
    return []
  }
}

export const getCompletions = (doc: TextDocument, position: Position): CompletionItem[] => {
  const text = doc.getText()
  const lines = text.split('\n')
  const line = lines[position.line] || ''
  const prefix = line.slice(0, position.character).trim()

  // Annotation key after @
  if (prefix === '@' || prefix.startsWith('@')) {
    const annoKeyMatch = prefix.match(/^@(\w+)\s+$/)
    if (annoKeyMatch && ANNOTATION_VALUES[annoKeyMatch[1]]) {
      return ANNOTATION_VALUES[annoKeyMatch[1]]
    }
    if (!annoKeyMatch) {
      return ANNOTATION_KEYS
    }
  }

  // Inside import or task file path
  const importMatch = prefix.match(/^import\s+["'](.*)$/)
  const taskFileMatch = prefix.match(/^task\(["'](.*)$/)

  if (importMatch || taskFileMatch) {
    const partial = (importMatch || taskFileMatch)![1]
    const filePath = fileURLToPath(doc.uri)
    const baseDir = dirname(filePath)
    const searchDir = partial.includes('/')
      ? resolve(baseDir, partial.substring(0, partial.lastIndexOf('/')))
      : baseDir

    return getStimFiles(searchDir)
  }

  // Inside task declaration — offer agent types
  if (prefix.startsWith('task ') && !prefix.includes('"') && !prefix.includes("'")) {
    return AGENT_TYPES
  }

  // Default: keywords, functions, variables; include metadata keys inside agent bodies
  const variables = collectDeclaredVariables(text)
  const inAgent = isInsideAgent(lines, position.line)
  const base = [...KEYWORDS, ...FUNCTIONS, ...variables]
  return inAgent ? [...METADATA_KEYS, ...base] : base
}

const isInsideAgent = (lines: string[], currentLine: number): boolean => {
  let inAgent = false
  let braceDepth = 0

  for (let i = 0; i <= currentLine && i < lines.length; i++) {
    const trimmed = lines[i].trim()

    if (!inAgent) {
      if (/^agent\s+\w+\s*\{$/.test(trimmed)) {
        inAgent = true
        braceDepth = 1
        continue
      }
      if (/^command\s+\w+\s*\{$/.test(trimmed)) {
        return false
      }
      continue
    }

    if (i === currentLine) return braceDepth > 0
    if (trimmed.endsWith('{')) braceDepth++
    if (trimmed === '}') {
      braceDepth--
      if (braceDepth === 0) inAgent = false
    }
  }

  return inAgent
}
