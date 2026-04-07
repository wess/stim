import { Location, Range } from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import type { Position } from 'vscode-languageserver/node'
import { existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const getWordAtPosition = (line: string, character: number): string => {
  let start = character
  let end = character

  while (start > 0 && /\w/.test(line[start - 1])) start--
  while (end < line.length && /\w/.test(line[end])) end++

  return line.slice(start, end)
}

const getStringAtPosition = (line: string, character: number): string | null => {
  const patterns = [
    /import\s+["'](.+?)["']/,
    /task\(["'](.+?)["']/,
  ]

  for (const pattern of patterns) {
    const match = line.match(pattern)
    if (!match) continue

    const start = line.indexOf(match[1])
    const end = start + match[1].length

    if (character >= start && character <= end) {
      return match[1]
    }
  }

  return null
}

export const getDefinition = (doc: TextDocument, position: Position): Location | null => {
  const text = doc.getText()
  const lines = text.split('\n')
  const line = lines[position.line] || ''

  // Check for file path (import or task file reference)
  const filePath = getStringAtPosition(line, position.character)
  if (filePath) {
    const docPath = fileURLToPath(doc.uri)
    const baseDir = dirname(docPath)
    const resolved = resolve(baseDir, filePath)

    if (existsSync(resolved)) {
      return Location.create(
        pathToFileURL(resolved).toString(),
        Range.create(0, 0, 0, 0),
      )
    }

    return null
  }

  // Check for variable definition
  const word = getWordAtPosition(line, position.character)
  if (!word) return null

  // Find variable assignment
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()

    const assignMatch = trimmed.match(new RegExp(`^(${word})\\s*=\\s*`))
    if (assignMatch) {
      const col = lines[i].indexOf(word)
      return Location.create(
        doc.uri,
        Range.create(i, col, i, col + word.length),
      )
    }

    const forMatch = trimmed.match(new RegExp(`^for\\s+(${word})\\s+in\\s+`))
    if (forMatch) {
      const col = lines[i].indexOf(word, lines[i].indexOf('for') + 3)
      return Location.create(
        doc.uri,
        Range.create(i, col, i, col + word.length),
      )
    }
  }

  return null
}
