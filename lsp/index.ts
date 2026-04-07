import {
  createConnection,
  ProposedFeatures,
  TextDocumentSyncKind,
  SemanticTokensBuilder,
  StreamMessageReader,
  StreamMessageWriter,
} from 'vscode-languageserver/node'
import { TextDocument } from 'vscode-languageserver-textdocument'
import { validateDocument } from './diagnostics'
import { getCompletions } from './completions'
import { getHover } from './hover'
import { getDefinition } from './definition'
import { getDocumentSymbols } from './symbols'
import { tokenTypes, tokenModifiers, provideSemanticTokens } from './highlighting'

const connection = createConnection(
  new StreamMessageReader(process.stdin),
  new StreamMessageWriter(process.stdout),
)
const documents = new Map<string, TextDocument>()

connection.onInitialize(() => ({
  capabilities: {
    textDocumentSync: TextDocumentSyncKind.Full,
    completionProvider: {
      triggerCharacters: ['@', '"', "'", '(', '.'],
    },
    hoverProvider: true,
    definitionProvider: true,
    documentSymbolProvider: true,
    semanticTokensProvider: {
      legend: {
        tokenTypes,
        tokenModifiers,
      },
      full: true,
    },
  },
}))

connection.onNotification('textDocument/didOpen', (params) => {
  const doc = TextDocument.create(
    params.textDocument.uri,
    params.textDocument.languageId,
    params.textDocument.version,
    params.textDocument.text,
  )
  documents.set(params.textDocument.uri, doc)
  validateDocument(connection, doc)
})

connection.onNotification('textDocument/didChange', (params) => {
  const existing = documents.get(params.textDocument.uri)
  if (!existing) return

  const doc = TextDocument.update(
    existing,
    params.contentChanges,
    params.textDocument.version,
  )
  documents.set(params.textDocument.uri, doc)
  validateDocument(connection, doc)
})

connection.onNotification('textDocument/didClose', (params) => {
  documents.delete(params.textDocument.uri)
  connection.sendDiagnostics({ uri: params.textDocument.uri, diagnostics: [] })
})

connection.onCompletion((params) => {
  const doc = documents.get(params.textDocument.uri)
  if (!doc) return []
  return getCompletions(doc, params.position)
})

connection.onHover((params) => {
  const doc = documents.get(params.textDocument.uri)
  if (!doc) return null
  return getHover(doc, params.position)
})

connection.onDefinition((params) => {
  const doc = documents.get(params.textDocument.uri)
  if (!doc) return null
  return getDefinition(doc, params.position)
})

connection.onDocumentSymbol((params) => {
  const doc = documents.get(params.textDocument.uri)
  if (!doc) return []
  return getDocumentSymbols(doc)
})

connection.onRequest('textDocument/semanticTokens/full', (params) => {
  const doc = documents.get(params.textDocument.uri)
  if (!doc) return { data: [] }

  const builder = new SemanticTokensBuilder()
  provideSemanticTokens(doc, builder)
  return builder.build()
})

connection.listen()
