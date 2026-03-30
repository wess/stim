import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import type { ImportStatement } from '../types/index.js'

export const resolveImports = (
  imports: ImportStatement[],
  basePath: string,
  visited: Set<string>,
): Record<string, any> => {
  const scope: Record<string, any> = {}

  for (const imp of imports) {
    const filePath = resolve(basePath, imp.path)

    if (visited.has(filePath)) {
      throw new Error(`Circular import detected: ${imp.path}`)
    }

    if (!existsSync(filePath)) {
      throw new Error(`Import file not found: ${filePath}`)
    }

    const source = readFileSync(filePath, 'utf-8')
    const lines = source.split('\n').map(line => line.trim()).filter(Boolean)

    const newVisited = new Set(visited)
    newVisited.add(filePath)

    const nestedImports: ImportStatement[] = []
    const assignmentLines: string[] = []

    for (const line of lines) {
      const importMatch = line.match(/^import\s+["'](.+?)["']$/)
      if (importMatch) {
        nestedImports.push({ path: importMatch[1] })
      } else {
        assignmentLines.push(line)
      }
    }

    if (nestedImports.length > 0) {
      const nested = resolveImports(nestedImports, dirname(filePath), newVisited)
      Object.assign(scope, nested)
    }

    for (const line of assignmentLines) {
      const match = line.match(/^(\w+)\s*=\s*(.+)$/)
      if (!match) continue

      let value: any = match[2].trim()

      if (value.startsWith('[') && value.endsWith(']')) {
        const arrayContent = value.slice(1, -1)
        value = arrayContent.split(',').map((item: string) => item.trim().replace(/^["']|["']$/g, ''))
      } else if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1)
      } else if (value === 'true' || value === 'false') {
        value = value === 'true'
      }

      scope[match[1]] = value
    }
  }

  return scope
}
