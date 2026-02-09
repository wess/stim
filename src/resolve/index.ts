import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import type { Command, Statement } from '../types/index.js'
import { parseCommand } from '../parser/index.js'

export const resolveTaskFiles = (command: Command, basePath: string): Command => ({
  ...command,
  body: resolveStatements(command.body, basePath, new Set())
})

const resolveStatements = (statements: Statement[], basePath: string, visited: Set<string>): Statement[] =>
  statements.map(s => resolveStatement(s, basePath, visited))

const resolveStatement = (statement: Statement, basePath: string, visited: Set<string>): Statement => {
  if (statement.type === 'task' && statement.file) {
    return resolveFileTask(statement, basePath, visited)
  }

  if (statement.type === 'parallel') {
    return { ...statement, tasks: resolveStatements(statement.tasks, basePath, visited) }
  }

  if (statement.body && Array.isArray(statement.body)) {
    return { ...statement, body: resolveStatements(statement.body, basePath, visited) }
  }

  return statement
}

const resolveFileTask = (statement: Statement, basePath: string, visited: Set<string>): Statement => {
  const filePath = resolve(basePath, statement.file)

  if (visited.has(filePath)) {
    throw new Error(`Circular task file reference detected: ${statement.file}`)
  }

  if (!existsSync(filePath)) {
    throw new Error(`Task file not found: ${filePath}`)
  }

  const source = readFileSync(filePath, 'utf-8')
  const parsed = parseCommand(source)

  const newVisited = new Set(visited)
  newVisited.add(filePath)

  const resolvedBody = resolveStatements(parsed.body, dirname(filePath), newVisited)

  return {
    ...statement,
    description: statement.description || parsed.name,
    body: resolvedBody
  }
}
