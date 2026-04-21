import { Hover, MarkupKind } from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import type { Position } from 'vscode-languageserver/node'

const KEYWORD_DOCS: Record<string, string> = {
  command: '**command** `<name> { ... }`\n\nDeclares a Stim command. Every `.stim` file must contain exactly one top-level declaration.',
  agent: '**agent** `<name> { ... }`\n\nDeclares a Stim agent. Agents support `description`, `tools`, `model` metadata followed by prose instructions.',
  task: '**task** `[agent] "<description>" { ... }`\n\nSpawns a subagent task. Agent types: `general`, `bash`, `explore`, `plan`.\n\nCan also reference a file: `task("file.stim")`',
  parallel: '**parallel** `{ ... }`\n\nExecutes multiple tasks concurrently. May only contain `task` statements.',
  if: '**if** `(condition) { ... }`\n\nConditional execution. Supports `else` blocks.',
  while: '**while** `(condition) { ... }`\n\nLoop while condition is true. Use `break` to exit early.',
  for: '**for** `<var> in <iterable> { ... }`\n\nIterates over an array variable.',
  break: '**break**\n\nExits the innermost `while` or `for` loop.',
  import: '**import** `"<path>"`\n\nImports variables from another `.stim` file.',
  true: '**true**\n\nBoolean literal.',
  false: '**false**\n\nBoolean literal.',
  else: '**else** `{ ... }`\n\nAlternate branch for `if` statements.',
  in: '**in**\n\nUsed in `for` loops: `for item in items { ... }`',
}

const FUNCTION_DOCS: Record<string, string> = {
  ask: '**ask** `(question)`\n\nPrompts the user with a question. Accepts a string literal or variable reference.',
  confirm: '**confirm** `(message)`\n\nDisplays a yes/no confirmation dialog. Returns a boolean.',
  wait_for_response: '**wait_for_response** `()`\n\nPauses execution until the user responds.',
  create_file: '**create_file** `(filename, content)`\n\nCreates a file with the given name and content.',
}

const METADATA_DOCS: Record<string, string> = {
  description: '**description** `"<string>"`\n\nShort description of what the agent does. Agent-body metadata.',
  tools: '**tools** `[Tool1, Tool2, ...]`\n\nArray of tools the agent may invoke (bare identifiers). Agent-body metadata.',
  model: '**model** `"<string>"`\n\nModel name for the agent (e.g. `"sonnet"`). Agent-body metadata.',
}

const ANNOTATION_DOCS: Record<string, string> = {
  topology: '**@topology** `pipeline | fanout | supervisor`\n\nSets the execution topology for the engine.\n- `pipeline`: Sequential task execution\n- `fanout`: Parallel broadcast\n- `supervisor`: Supervised coordination',
  memory: '**@memory** `shared | none`\n\nControls state sharing between tasks.\n- `shared`: Tasks share state\n- `none`: Tasks are isolated',
  on_error: '**@on_error** `escalate`\n\nError handling strategy.\n- `escalate`: Escalate errors to the supervisor',
}

const AGENT_DOCS: Record<string, string> = {
  general: '**general**\n\nDefault agent type. General-purpose subagent.',
  bash: '**bash**\n\nShell command agent. Executes terminal commands.',
  explore: '**explore**\n\nCodebase exploration agent. Searches and reads files.',
  plan: '**plan**\n\nPlanning agent. Designs implementation strategies.',
}

const getWordAtPosition = (line: string, character: number): string => {
  let start = character
  let end = character

  while (start > 0 && /[\w@]/.test(line[start - 1])) start--
  while (end < line.length && /\w/.test(line[end])) end++

  return line.slice(start, end)
}

export const getHover = (doc: TextDocument, position: Position): Hover | null => {
  const text = doc.getText()
  const lines = text.split('\n')
  const line = lines[position.line] || ''
  const word = getWordAtPosition(line, position.character)

  if (!word) return null

  // Annotation hover
  if (word.startsWith('@')) {
    const key = word.slice(1)
    if (ANNOTATION_DOCS[key]) {
      return { contents: { kind: MarkupKind.Markdown, value: ANNOTATION_DOCS[key] } }
    }
  }

  // Keyword hover
  if (KEYWORD_DOCS[word]) {
    return { contents: { kind: MarkupKind.Markdown, value: KEYWORD_DOCS[word] } }
  }

  // Agent metadata hover — only when the word is at the start of its line
  if (METADATA_DOCS[word] && line.trimStart().startsWith(word + ' ')) {
    return { contents: { kind: MarkupKind.Markdown, value: METADATA_DOCS[word] } }
  }

  // Function hover
  if (FUNCTION_DOCS[word]) {
    return { contents: { kind: MarkupKind.Markdown, value: FUNCTION_DOCS[word] } }
  }

  // Agent type hover
  if (AGENT_DOCS[word]) {
    const trimmed = line.trim()
    if (trimmed.startsWith('task')) {
      return { contents: { kind: MarkupKind.Markdown, value: AGENT_DOCS[word] } }
    }
  }

  // Variable hover — find its assignment
  const allLines = text.split('\n')
  for (let i = 0; i < allLines.length; i++) {
    const trimmed = allLines[i].trim()
    const assignMatch = trimmed.match(new RegExp(`^${word}\\s*=\\s*(.+)$`))
    if (assignMatch) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: `**${word}** (variable)\n\n\`\`\`stim\n${trimmed}\n\`\`\`\n\nDefined on line ${i + 1}`,
        },
      }
    }

    const forMatch = trimmed.match(new RegExp(`^for\\s+${word}\\s+in\\s+(.+)\\s*\\{$`))
    if (forMatch) {
      return {
        contents: {
          kind: MarkupKind.Markdown,
          value: `**${word}** (loop variable)\n\nIterates over \`${forMatch[1]}\`\n\nDefined on line ${i + 1}`,
        },
      }
    }
  }

  return null
}
