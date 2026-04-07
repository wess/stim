import { DocumentSymbol, SymbolKind, Range } from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'

export const getDocumentSymbols = (doc: TextDocument): DocumentSymbol[] => {
  const text = doc.getText()
  const lines = text.split('\n')
  const symbols: DocumentSymbol[] = []

  let commandSymbol: DocumentSymbol | null = null

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    const lineLen = lines[i].length

    // Command declaration
    const commandMatch = trimmed.match(/^command\s+(\w+)\s*\{$/)
    if (commandMatch) {
      const endLine = findClosingBrace(lines, i)
      commandSymbol = {
        name: commandMatch[1],
        kind: SymbolKind.Module,
        range: Range.create(i, 0, endLine, lines[endLine]?.length ?? 0),
        selectionRange: Range.create(i, 0, i, lineLen),
        children: [],
      }
      symbols.push(commandSymbol)
      continue
    }

    const container = commandSymbol?.children ?? symbols

    // Variable assignment
    const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/)
    if (assignMatch) {
      container.push({
        name: assignMatch[1],
        detail: truncate(assignMatch[2], 40),
        kind: SymbolKind.Variable,
        range: Range.create(i, 0, i, lineLen),
        selectionRange: Range.create(i, 0, i, lineLen),
      })
      continue
    }

    // Task declaration
    const taskMatch = trimmed.match(/^task\s+(?:(?:bash|explore|plan|general)\s+)?["'](.+?)["']\s*\{$/)
    if (taskMatch) {
      const endLine = findClosingBrace(lines, i)
      container.push({
        name: `task: ${taskMatch[1]}`,
        kind: SymbolKind.Function,
        range: Range.create(i, 0, endLine, lines[endLine]?.length ?? 0),
        selectionRange: Range.create(i, 0, i, lineLen),
      })
      continue
    }

    // Task file reference
    const taskFileMatch = trimmed.match(/^task\(["'](.+?)["']/)
    if (taskFileMatch) {
      container.push({
        name: `task: ${taskFileMatch[1]}`,
        kind: SymbolKind.Function,
        range: Range.create(i, 0, i, lineLen),
        selectionRange: Range.create(i, 0, i, lineLen),
      })
      continue
    }

    // Parallel block
    if (trimmed === 'parallel {') {
      const endLine = findClosingBrace(lines, i)
      container.push({
        name: 'parallel',
        kind: SymbolKind.Namespace,
        range: Range.create(i, 0, endLine, lines[endLine]?.length ?? 0),
        selectionRange: Range.create(i, 0, i, lineLen),
      })
      continue
    }

    // For loop
    const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+(.+)\s*\{$/)
    if (forMatch) {
      const endLine = findClosingBrace(lines, i)
      container.push({
        name: `for ${forMatch[1]} in ${forMatch[2]}`,
        kind: SymbolKind.Struct,
        range: Range.create(i, 0, endLine, lines[endLine]?.length ?? 0),
        selectionRange: Range.create(i, 0, i, lineLen),
      })
      continue
    }

    // While loop
    const whileMatch = trimmed.match(/^while\s+\((.+)\)\s*\{$/)
    if (whileMatch) {
      const endLine = findClosingBrace(lines, i)
      container.push({
        name: `while (${truncate(whileMatch[1], 30)})`,
        kind: SymbolKind.Struct,
        range: Range.create(i, 0, endLine, lines[endLine]?.length ?? 0),
        selectionRange: Range.create(i, 0, i, lineLen),
      })
      continue
    }

    // Annotation
    const annoMatch = trimmed.match(/^@(\w+)\s+(.+)$/)
    if (annoMatch) {
      container.push({
        name: `@${annoMatch[1]} ${annoMatch[2]}`,
        kind: SymbolKind.Property,
        range: Range.create(i, 0, i, lineLen),
        selectionRange: Range.create(i, 0, i, lineLen),
      })
    }
  }

  return symbols
}

const findClosingBrace = (lines: string[], startLine: number): number => {
  let braceCount = 0

  for (let i = startLine; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    for (const ch of trimmed) {
      if (ch === '{') braceCount++
      if (ch === '}') braceCount--
    }
    if (braceCount === 0) return i
  }

  return lines.length - 1
}

const truncate = (s: string, max: number): string =>
  s.length <= max ? s : s.slice(0, max - 3) + '...'
