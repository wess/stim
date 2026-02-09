import type { Command, Statement } from '../types/index.js'

export const compileCommand = (command: Command): string => {
  const sections = compileStatements(command.body)
  return sections.join('\n\n')
}

const compileStatements = (statements: Statement[]): string[] => {
  return statements.map(compileStatement).filter(Boolean)
}

const compileStatement = (statement: Statement): string => {
  switch (statement.type) {
    case 'ask':
      return compileAsk(statement)
    case 'confirm':
      return compileConfirm(statement)
    case 'create_file':
      return compileCreateFile(statement)
    case 'if':
      return compileIf(statement)
    case 'while':
      return compileWhile(statement)
    case 'for':
      return compileFor(statement)
    case 'variable_assignment':
      return compileAssignment(statement)
    case 'function_call':
      return compileFunctionCall(statement)
    case 'wait_for_response':
      return 'Wait for user response before continuing.'
    case 'task':
      return compileTask(statement)
    case 'parallel':
      return compileParallel(statement)
    case 'break':
      return 'Stop current loop/process.'
    default:
      return `// Unknown statement type: ${statement.type}`
  }
}

const compileAsk = (statement: any): string => {
  const question = statement.question
  
  // If it's a variable reference, use template syntax
  if (!/^["']/.test(question)) {
    return `Ask the user the question from variable: ${question}`
  }
  
  return `Ask the user: "${question}"`
}

const compileConfirm = (statement: any): string => {
  return `Ask for confirmation: "${statement.message}"`
}

const compileCreateFile = (statement: any): string => {
  return `Create file "${statement.filename}" with content: ${statement.content}`
}

const compileIf = (statement: any): string => {
  const condition = statement.condition
  const bodyInstructions = compileStatements(statement.body)
  
  let result = `If ${condition}:`
  bodyInstructions.forEach(instruction => {
    result += `\n- ${instruction}`
  })
  
  if (statement.else) {
    const elseInstructions = compileStatements(statement.else)
    result += `\n\nOtherwise:`
    elseInstructions.forEach(instruction => {
      result += `\n- ${instruction}`
    })
  }
  
  return result
}

const compileWhile = (statement: any): string => {
  const condition = statement.condition
  const bodyInstructions = compileStatements(statement.body)
  
  let result = `While ${condition}, repeat:`
  bodyInstructions.forEach(instruction => {
    result += `\n- ${instruction}`
  })
  
  return result
}

const compileFor = (statement: any): string => {
  const variable = statement.variable
  const iterable = statement.iterable
  const bodyInstructions = compileStatements(statement.body)
  
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

const compileTask = (statement: any): string => {
  const agentLabel = formatAgentType(statement.agent)
  const desc = statement.description
  const bodyInstructions = compileStatements(statement.body)

  let result = `Spawn a ${agentLabel} subagent task: "${desc}"\nUse the Task tool with:\n- subagent_type: ${agentLabel}\n- description: ${desc}\n- prompt:`
  bodyInstructions.forEach(instruction => {
    result += `\n  - ${instruction}`
  })

  return result
}

const compileParallel = (statement: any): string => {
  const tasks = statement.tasks as any[]
  let result = `Spawn ${tasks.length} subagent tasks in parallel:`

  tasks.forEach((task, index) => {
    result += `\n\n### Task ${index + 1}\n${compileTask(task)}`
  })

  return result
}