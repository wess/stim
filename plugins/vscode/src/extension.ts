import * as vscode from 'vscode'
import * as path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export function activate(context: vscode.ExtensionContext) {
  console.log('Spark Language Support activated')

  // Register compile command
  const compileCommand = vscode.commands.registerCommand('spark.compile', async (uri?: vscode.Uri) => {
    const fileUri = uri || vscode.window.activeTextEditor?.document.uri
    
    if (!fileUri || path.extname(fileUri.fsPath) !== '.spark') {
      vscode.window.showErrorMessage('Please select a .spark file to compile')
      return
    }

    try {
      vscode.window.showInformationMessage('Compiling Spark file...')
      
      // Find the spark project root (where package.json is)
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(fileUri)
      if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found')
        return
      }

      // Execute the compile command
      const { stdout, stderr } = await execAsync(
        `bun run dev compile "${fileUri.fsPath}"`,
        { cwd: workspaceFolder.uri.fsPath }
      )

      if (stderr) {
        vscode.window.showErrorMessage(`Compilation failed: ${stderr}`)
      } else {
        vscode.window.showInformationMessage('✓ Spark file compiled successfully!')
        
        // Show output in output channel
        const outputChannel = vscode.window.createOutputChannel('Spark')
        outputChannel.appendLine(stdout)
        outputChannel.show()
      }
    } catch (error: any) {
      vscode.window.showErrorMessage(`Compilation error: ${error.message}`)
    }
  })

  // Register compile and run command
  const compileAndRunCommand = vscode.commands.registerCommand('spark.compileAndRun', async (uri?: vscode.Uri) => {
    const fileUri = uri || vscode.window.activeTextEditor?.document.uri
    
    if (!fileUri || path.extname(fileUri.fsPath) !== '.spark') {
      vscode.window.showErrorMessage('Please select a .spark file to compile')
      return
    }

    try {
      // First compile
      await vscode.commands.executeCommand('spark.compile', fileUri)
      
      // Extract command name from file
      const fileName = path.basename(fileUri.fsPath, '.spark')
      
      // Show instructions for running in Claude Code
      const message = `Command compiled! Run in Claude Code with: /${fileName}`
      const copyAction = 'Copy Command'
      
      const result = await vscode.window.showInformationMessage(message, copyAction)
      
      if (result === copyAction) {
        await vscode.env.clipboard.writeText(`/${fileName}`)
        vscode.window.showInformationMessage('Command copied to clipboard!')
      }
      
    } catch (error: any) {
      vscode.window.showErrorMessage(`Error: ${error.message}`)
    }
  })

  // Register new command template
  const newCommandCommand = vscode.commands.registerCommand('spark.newCommand', async () => {
    const commandName = await vscode.window.showInputBox({
      prompt: 'Enter command name',
      placeHolder: 'my_command',
      validateInput: (value: string) => {
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
          return 'Command name must be a valid identifier'
        }
        return null
      }
    })

    if (!commandName) return

    const template = `command ${commandName} {
  ask("What would you like to do?")
  wait_for_response()
  
  if (confirm("Continue with this action?")) {
    ask("Great! Let's proceed.")
  }
  
  // Add your command logic here
}`

    const doc = await vscode.workspace.openTextDocument({
      content: template,
      language: 'spark'
    })

    await vscode.window.showTextDocument(doc)
    vscode.window.showInformationMessage(`New Spark command '${commandName}' created!`)
  })

  // Register diagnostic provider for syntax validation
  const diagnostics = vscode.languages.createDiagnosticCollection('spark')
  
  const validateDocument = (document: vscode.TextDocument) => {
    if (document.languageId !== 'spark') return

    const diagnosticsList: vscode.Diagnostic[] = []
    const text = document.getText()
    const lines = text.split('\n')

    // Basic syntax validation
    let braceCount = 0
    let inCommand = false

    lines.forEach((line, lineNumber) => {
      const trimmed = line.trim()
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('//')) return

      // Check command declaration
      if (trimmed.match(/^command\s+\w+\s*\{$/)) {
        inCommand = true
        braceCount++
      } else if (trimmed === '}') {
        braceCount--
        if (braceCount === 0) inCommand = false
      } else if (trimmed.includes('{')) {
        braceCount++
      }

      // Check for common syntax errors
      if (inCommand && braceCount > 0) {
        // Check for unclosed strings
        const stringMatches = trimmed.match(/"/g)
        if (stringMatches && stringMatches.length % 2 !== 0) {
          const diagnostic = new vscode.Diagnostic(
            new vscode.Range(lineNumber, 0, lineNumber, line.length),
            'Unclosed string literal',
            vscode.DiagnosticSeverity.Error
          )
          diagnosticsList.push(diagnostic)
        }

        // Check for invalid assignments
        if (trimmed.includes('=') && !trimmed.match(/^\w+\s*=\s*.+$/)) {
          const diagnostic = new vscode.Diagnostic(
            new vscode.Range(lineNumber, 0, lineNumber, line.length),
            'Invalid assignment syntax',
            vscode.DiagnosticSeverity.Error
          )
          diagnosticsList.push(diagnostic)
        }
      }
    })

    // Check for unmatched braces
    if (braceCount !== 0) {
      const diagnostic = new vscode.Diagnostic(
        new vscode.Range(0, 0, lines.length - 1, lines[lines.length - 1].length),
        'Unmatched braces in command',
        vscode.DiagnosticSeverity.Error
      )
      diagnosticsList.push(diagnostic)
    }

    diagnostics.set(document.uri, diagnosticsList)
  }

  // Validate on document change
  const activeEditor = vscode.window.activeTextEditor
  if (activeEditor) {
    validateDocument(activeEditor.document)
  }

  // Listen for document changes
  vscode.workspace.onDidChangeTextDocument(event => {
    validateDocument(event.document)
  })

  vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor) {
      validateDocument(editor.document)
    }
  })

  // Add all commands to context
  context.subscriptions.push(
    compileCommand,
    compileAndRunCommand,
    newCommandCommand,
    diagnostics
  )
}

export function deactivate() {
  console.log('Spark Language Support deactivated')
}