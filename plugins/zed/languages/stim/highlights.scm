; Keywords
[
  "command"
  "if"
  "else"
  "while"
  "for"
  "in"
  "break"
  "task"
  "parallel"
] @keyword

; Agent types
[
  "bash"
  "explore"
  "plan"
  "general"
] @type

; Booleans
[
  "true"
  "false"
] @boolean

; Built-in functions
(function_call
  name: (identifier) @function.builtin
  (#any-of? @function.builtin "ask" "confirm" "wait_for_response" "create_file"))

; Other function calls
(function_call
  name: (identifier) @function)

; Strings
(string) @string
(escape_sequence) @string.escape

; Numbers
(number) @number

; Comments
(comment) @comment

; Operators
[
  "="
  "+"
  "=="
  "!="
  "&&"
  "||"
  "!"
] @operator

; Punctuation
[
  "{"
  "}"
] @punctuation.bracket

[
  "("
  ")"
] @punctuation.bracket

[
  "["
  "]"
] @punctuation.bracket

; Variables
(identifier) @variable

; Command name
(command_declaration
  name: (identifier) @function.definition)

; Task description
(task_statement
  description: (string) @string.special)

; Variable assignment target
(variable_assignment
  name: (identifier) @variable.definition)
