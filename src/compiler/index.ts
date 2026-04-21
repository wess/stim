import type { Command, Statement } from '../types/index.js'

export type CompileOptions = {
  engineMode: boolean
  scope: Record<string, any>
}

export const compileCommand = (command: Command): string => {
  const parts: string[] = []
  const options: CompileOptions = {
    engineMode: !!(command.annotations && Object.keys(command.annotations).length > 0),
    scope: command.importedScope || {},
  }

  if (options.engineMode) {
    const header = ['[annotations]']
    for (const [key, value] of Object.entries(command.annotations!)) {
      header.push(`${key}: ${value}`)
    }
    parts.push(header.join('\n'))
  }

  const sections = compileBody(command.body, options)
  parts.push(...sections)

  return parts.join('\n\n')
}

export const compileBody = (statements: Statement[], options?: CompileOptions): string[] => {
  return statements.map(s => compileStatement(s, options)).filter(Boolean)
}

const compileStatement = (statement: Statement, options?: CompileOptions): string => {
  switch (statement.type) {
    case 'ask':
      return compileAsk(statement, options)
    case 'confirm':
      return compileConfirm(statement, options)
    case 'create_file':
      return compileCreateFile(statement)
    case 'if':
      return compileIf(statement, options)
    case 'while':
      return compileWhile(statement, options)
    case 'for':
      return compileFor(statement, options)
    case 'variable_assignment':
      return compileAssignment(statement)
    case 'function_call':
      return compileFunctionCall(statement)
    case 'wait_for_response':
      return 'Wait for user response before continuing.'
    case 'task':
      return compileTask(statement, options)
    case 'parallel':
      return compileParallel(statement, options)
    case 'break':
      return 'Stop current loop/process.'
    case 'annotation':
      return ''
    case 'metadata':
      return ''
    case 'prose':
      return statement.text
    default:
      return `// Unknown statement type: ${statement.type}`
  }
}

const compileAsk = (statement: any, options?: CompileOptions): string => {
  const question = statement.question

  if (options?.scope && options.scope[question] !== undefined) {
    return `Ask the user: "${options.scope[question]}"`
  }

  if (!/^["']/.test(question)) {
    return `Ask the user the question from variable: ${question}`
  }

  return `Ask the user: "${question}"`
}

const compileConfirm = (statement: any, options?: CompileOptions): string => {
  const message = statement.message

  if (options?.scope && options.scope[message] !== undefined) {
    return `Ask for confirmation: "${options.scope[message]}"`
  }

  return `Ask for confirmation: "${message}"`
}

const compileCreateFile = (statement: any): string => {
  return `Create file "${statement.filename}" with content: ${statement.content}`
}

const compileIf = (statement: any, options?: CompileOptions): string => {
  const condition = statement.condition
  const bodyInstructions = compileBody(statement.body, options)

  let result = `If ${condition}:`
  bodyInstructions.forEach(instruction => {
    result += `\n- ${instruction}`
  })

  if (statement.else) {
    const elseInstructions = compileBody(statement.else, options)
    result += `\n\nOtherwise:`
    elseInstructions.forEach(instruction => {
      result += `\n- ${instruction}`
    })
  }

  return result
}

const compileWhile = (statement: any, options?: CompileOptions): string => {
  const condition = statement.condition
  const bodyInstructions = compileBody(statement.body, options)

  let result = `While ${condition}, repeat:`
  bodyInstructions.forEach(instruction => {
    result += `\n- ${instruction}`
  })

  return result
}

const compileFor = (statement: any, options?: CompileOptions): string => {
  const variable = statement.variable
  const iterable = statement.iterable
  const bodyInstructions = compileBody(statement.body, options)

  let result = `For each ${variable} in ${iterable}:`
  bodyInstructions.forEach(instruction => {
    result += `\n- ${instruction}`
  })

  return result
}

const compileAssignment = (statement: any): string => {
  return `Set ${statement.name} = ${statement.value}`
}

const compileFunctionCall = (statement: any): string => {
  const args = statement.args.length > 0 ? ` with arguments: ${statement.args.join(', ')}` : ''
  return `Call function ${statement.name}${args}`
}

const formatAgentType = (agent: string): string => {
  const map: Record<string, string> = {
    bash: 'Bash',
    explore: 'Explore',
    plan: 'Plan',
    general: 'general-purpose'
  }
  return map[agent] || agent
}

const compileTask = (statement: any, options?: CompileOptions): string => {
  const agentLabel = formatAgentType(statement.agent)
  const desc = statement.description
  const bodyInstructions = compileBody(statement.body, options)

  let result = `Spawn a ${agentLabel} subagent task: "${desc}"\nUse the Task tool with:\n- subagent_type: ${agentLabel}\n- description: ${desc}\n- prompt:`
  bodyInstructions.forEach(instruction => {
    result += `\n  - ${instruction}`
  })

  if (options?.engineMode) {
    result += `\n  - End your output with [status: ok] or [status: error] <reason>`
  }

  return result
}

const compileParallel = (statement: any, options?: CompileOptions): string => {
  const tasks = statement.tasks as any[]
  let result = `Spawn ${tasks.length} subagent tasks in parallel:`

  tasks.forEach((task, index) => {
    result += `\n\n### Task ${index + 1}\n${compileTask(task, options)}`
  })

  return result
}
