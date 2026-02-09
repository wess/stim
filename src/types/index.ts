export type Command = {
  name: string
  body: Statement[]
}

export type Statement = {
  type: StatementType
  [key: string]: any
}

export type StatementType =
  | 'ask'
  | 'wait_for_response'
  | 'create_file'
  | 'if'
  | 'while'
  | 'for'
  | 'break'
  | 'confirm'
  | 'variable_assignment'
  | 'function_call'
  | 'task'
  | 'parallel'

export type AgentType = 'bash' | 'explore' | 'plan' | 'general'

export type TaskStatement = {
  type: 'task'
  description: string
  agent: AgentType
  body: Statement[]
  file?: string
}

export type ParallelStatement = {
  type: 'parallel'
  tasks: Statement[]
}

export type AskStatement = {
  type: 'ask'
  question: string
}

export type CreateFileStatement = {
  type: 'create_file'
  filename: string
  content: string
}

export type IfStatement = {
  type: 'if'
  condition: string
  body: Statement[]
  else?: Statement[]
}

export type WhileStatement = {
  type: 'while'
  condition: string
  body: Statement[]
}

export type ForStatement = {
  type: 'for'
  variable: string
  iterable: string
  body: Statement[]
}

export type ConfirmStatement = {
  type: 'confirm'
  message: string
  variable?: string
}

export type VariableAssignment = {
  type: 'variable_assignment'
  name: string
  value: any
}

export type FunctionCall = {
  type: 'function_call'
  name: string
  args: any[]
}

export type StimManifest = {
  name: string
  version: string
  author: string
  commands: string[]
}

export type StimLock = {
  packages: Record<string, LockEntry>
}

export type LockEntry = {
  version: string
  commands: string[]
}